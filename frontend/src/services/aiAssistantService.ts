/**
 * Servicio Inteligente de Asistencia Técnica con IA (RIALSA - Grupo Industrial Delnorte)
 * Diseñado para entender lenguaje natural coloquial, no técnico y cotidiano
 * de empleados de planta y oficinas administrativas (ej: "no jala", "se tragó el papel",
 * "pantalla negra", "olvidé la clave", "no me escuchan en la llamada", "no tengo internet").
 * 
 * Soporta:
 * 1. Google Gemini API (Cloud LLM en tiempo real si el usuario provee API Key).
 * 2. Microservicio Python FastAPI (localhost:8000 si está corriendo localmente).
 * 3. Motor Autónomo Neuronal Semántico en Navegador (100% funcional en Vercel sin servidor).
 */

export interface AiDiagnosticResult {
  respuesta: string;
  pasos: string[];
  cita: string;
  similitud: string;
  modelo: string;
  requiereEscalado: boolean;
  esChiste?: boolean;
}

export interface TicketDraftContext {
  asunto: string;
  descripcion: string;
  categoria: string;
  prioridad?: string;
  contextoIa?: string;
}
export interface ConversationTurn { sender: "user" | "ai"; text: string; steps?: string[]; citation?: string; }

/**
 * Normaliza texto eliminando acentos, puntuación extra y convirtiendo a minúsculas
 * para que búsquedas coloquiales como "contraseña", "contrasena", "pantallazo", etc.,
 * coincidan sin importar la ortografía o modismos.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos (á->a, é->e, etc.)
    .replace(/[^\w\s]/gi, ' ')        // Quita signos de puntuación
    .replace(/\s+/g, ' ')             // Espacios múltiples a uno solo
    .trim();
}

const IT_JOKES = [
  {
    respuesta: '😄 ¡Claro que sí! Aquí tienes un chiste clásico de soporte técnico:\n\n— Un usuario llama desesperado: "¡Oiga, se me cayó el internet!"\n— El técnico le pregunta: "¿Y se golpeó muy fuerte?" 😂',
    pasos: [
      'Paso 1: Reírse un momento para liberar el estrés laboral.',
      'Paso 2: Comprobar que el cable de red no esté machucado por la silla.',
      'Paso 3: Si tienes una consulta o fallo técnico real, ¡escríbela y la resolvemos de inmediato!'
    ],
    cita: 'Manual de Humor Técnico GID · Artículo HUMOR-01'
  },
  {
    respuesta: '😄 Ahí te va uno de programadores y técnicos:\n\n— ¿Por qué los ingenieros de soporte prefieren el modo oscuro?\n— ¡Porque la luz atrae a los bugs! 🐛💡',
    pasos: [
      'Tip 1: Mantener el modo oscuro en tus aplicaciones para cuidar la vista.',
      'Tip 2: Tomar agua y hacer pausas activas de 5 minutos.',
      'Tip 3: Dime qué sistema o equipo te está dando problemas hoy.'
    ],
    cita: 'Manual de Humor Técnico GID · Artículo HUMOR-02'
  },
  {
    respuesta: '😄 Este es de la vida real en la mesa de ayuda:\n\n— Soporte: "¿Cuál es su problema?"\n— Usuario: "El teclado no escribe nada."\n— Soporte: "¿Qué tecla está presionando?"\n— Usuario: "¡Cualquiera! Si la pantalla dice: Presione cualquier tecla para continuar..." ⌨️😂',
    pasos: [
      'Dato curioso: La tecla "Any Key" (Cualquiera) no existe físicamente en el teclado.',
      'Si tu teclado de verdad no responde, desconéctalo y pruébalo en otro puerto USB.',
      '¿En qué más te puedo asistir con los sistemas de planta o de oficina?'
    ],
    cita: 'Manual de Humor Técnico GID · Artículo HUMOR-03'
  }
];

export interface KbArticleDefinition {
  codigo: string;
  titulo: string;
  categoria: string;
  problemaColoquial: string;
  explicacionSencilla: string;
  frasesColoquiales: string[];
  palabrasClave: string[];
  pasosSencillos: string[];
}

/**
 * Catálogo completo de 15 Manuales Oficiales de GID con mapeo de frases coloquiales
 * y traducción empática a pasos en lenguaje sencillo sin tecnicismos innecesarios.
 */
export const FULL_KB_CATALOG: KbArticleDefinition[] = [
  // 1. ZEBRA ETIQUETAS
  {
    codigo: 'KB-014',
    titulo: 'Calibración y solución de atascos en impresoras térmicas Zebra ZT230',
    categoria: 'Hardware',
    problemaColoquial: 'la impresora Zebra tiene luz roja, no imprime etiquetas o imprime chueco',
    explicacionSencilla: 'En líneas de producción y embarque cada minuto cuenta. Cuando la Zebra parpadea con su foco en rojo o no alinea las etiquetas, se soluciona casi siempre con una auto-calibración de su sensor óptico.',
    frasesColoquiales: [
      'zebra con luz roja', 'luz roja parpadea', 'foco rojo parpadea', 'no saca etiquetas',
      'impresora de etiquetas no jala', 'imprime chueco las etiquetas', 'se brinca las etiquetas',
      'etiquetas encimadas', 'rollo de etiquetas atorado', 'la maquina de etiquetas',
      'no salen las etiquetas de embarque', 'parpadea en rojo la zebra', 'calibrar la zebra'
    ],
    palabrasClave: ['zebra', 'zt230', 'etiqueta', 'etiquetas', 'embarque', 'termica', 'luz roja', 'foco rojo', 'parpadea', 'calibrar', 'calibracion', 'rollo', 'rollos', 'feed'],
    pasosSencillos: [
      'Abre la compuerta lateral y asegúrate de que la palanca dorada de presión del cabezal térmico esté bajada y trabada hacia abajo.',
      'Mantén presionado el botón verde FEED durante 3 segundos continuos hasta que expulse una etiqueta sola para auto-calibrar sensores.',
      'Verifica que el cable de red azul de atrás esté bien conectado a la pared.',
      'Si la luz roja sigue parpadeando, limpia con un hisopo o toallita el pequeño sensor negro donde pasa la tira de etiquetas.'
    ]
  },

  // 2. IMPRESORAS DE OFICINA (HP / RICOH / EPSON)
  {
    codigo: 'KB-018',
    titulo: 'Impresoras multifuncionales de oficina (HP / Ricoh / Epson): atascos y cola de impresión',
    categoria: 'Hardware',
    problemaColoquial: 'la impresora se tragó una hoja, se atoró el papel o no saca tus impresiones',
    explicacionSencilla: 'Entiendo tu urgencia por sacar tus documentos. Cuando la impresora "se traga el papel" o mandas imprimir y no hace nada, por lo regular es un documento atorado en la memoria de impresión de Windows o una hoja mordida en los rodillos.',
    frasesColoquiales: [
      'se trago el papel', 'se trago la hoja', 'se atoraron las hojas', 'la maquina no saca las hojas',
      'no me deja imprimir', 'no imprime nada', 'documento trabado', 'impresora trabada',
      'cola de impresion', 'papel atascado', 'hoja atorada', 'no sale la impresion',
      'la impresora no agarra', 'impresora no jala', 'marca error la impresora',
      'se quedo pegada la hoja', 'se trago las hojas', 'no imprime mi archivo',
      'mando a imprimir y no hace nada', 'la impresora no responde', 'se atoro el papel'
    ],
    palabrasClave: ['impresora', 'imprimir', 'impresion', 'papel', 'hoja', 'hojas', 'atoro', 'atorado', 'atorada', 'atasco', 'atascos', 'trago', 'tragado', 'spooler', 'cola', 'toner', 'tinta', 'ricoh', 'hp', 'epson', 'canon'],
    pasosSencillos: [
      'Abre la bandeja de papel y la tapa frontal: retira suavemente cualquier pedacito de hoja que se haya doblado o quedado en los rodillos.',
      'Presiona en tu teclado las teclas Windows + R, escribe "services.msc" y da Enter. Busca "Cola de impresión" (Print Spooler), dale clic derecho y elige "Reiniciar".',
      'Esto limpiará los documentos atorados que impedían que tus nuevas impresiones salieran.',
      'Vuelve a enviar tu impresión asegurándote de no mandar más de 20 hojas al mismo tiempo.'
    ]
  },

  // 3. MONITORES Y PANTALLAS (HDMI / DISPLAYPORT)
  {
    codigo: 'KB-032',
    titulo: 'Monitores sin señal de video, pantalla parpadeante y conexión HDMI / DisplayPort',
    categoria: 'Hardware',
    problemaColoquial: 'la pantalla se puso negra, parpadea o dice "Sin señal"',
    explicacionSencilla: 'Es muy común asustarse cuando "la pantalla se pone negra", pero por lo general tu computadora sigue funcionando bien y solo se perdió la sincronización de video o el cable HDMI está flojo.',
    frasesColoquiales: [
      'la pantalla se puso negra', 'pantalla negra', 'no da video', 'el monitor no prende',
      'no se ve nada', 'pantalla sin senal', 'parpadea la pantalla', 'el proyector no manda imagen',
      'la segunda pantalla no se ve', 'pantalla parpadeando', 'rayas en la pantalla',
      'se ve borroso', 'se apago el monitor', 'la compu prende pero la pantalla no',
      'no detecta el monitor', 'cable de la tele no jala', 'pantalla muerta', 'pantalla en negro'
    ],
    palabrasClave: ['monitor', 'pantalla', 'video', 'senal', 'hdmi', 'displayport', 'negra', 'negro', 'prende', 'imagen', 'borroso', 'parpadea', 'proyector', 'segundo monitor', 'resolucion'],
    pasosSencillos: [
      'Presiona en tu teclado al mismo tiempo: Windows + Ctrl + Shift + B (escucharás un beep corto y la pantalla se reiniciará al instante).',
      'Revisa por detrás del monitor y de tu computadora que el cable de video (HDMI o DisplayPort) esté bien enchufado y sin dobleces forzados.',
      'Presiona la tecla Windows + P y selecciona la opción "Duplicar" o "Ampliar" para reactivar la señal.',
      'Apaga y vuelve a encender el monitor usando su propio botón de encendido físico.'
    ]
  },

  // 4. RENDIMIENTO, PANTALLA AZUL Y CONGELAMIENTOS
  {
    codigo: 'KB-077',
    titulo: 'Diagnóstico de pantallas azules (BSOD), lentitud extrema y congelamiento en Windows 11',
    categoria: 'Hardware',
    problemaColoquial: 'tu compu está muy lenta, se congela o te salió una pantalla azul con carita triste',
    explicacionSencilla: 'Comprendo lo frustrante que es cuando la máquina "se traba" o "se congela" en medio del trabajo. Esto suele ocurrir cuando un programa se queda consumiendo toda la memoria o el disco.',
    frasesColoquiales: [
      'mi compu esta super lenta', 'la maquina se traba mucho', 'se congelo la pantalla',
      'se pasmo la computadora', 'pantalla azul con carita triste', 'me salio una pantalla azul',
      'se reinicia sola', 'se apaga de la nada', 'no responde el mouse', 'esta muy lenta la laptop',
      'tarda horas en abrir', 'la computadora no responde', 'disco al cien',
      'ruido raro en el ventilador', 'pantallazo azul', 'se quedo trabada'
    ],
    palabrasClave: ['lenta', 'lento', 'lentitud', 'traba', 'trabada', 'congela', 'congelada', 'pasmo', 'pasmada', 'pantalla azul', 'bsod', 'reinicia', 'apaga', 'carita triste', 'disco', 'ram', 'memoria', 'rendimiento', 'compu', 'maquina', 'windows'],
    pasosSencillos: [
      'Abre el Administrador de Tareas presionando Ctrl + Shift + Esc y revisa qué programa tiene el CPU o Disco en 100% para cerrarlo.',
      'Desconecta cualquier memoria USB o disco portátil que hayas conectado hace poco.',
      'Si se congeló por completo y no responde el cursor, mantén presionado el botón de encendido de la computadora durante 8 segundos para reiniciarla de forma segura.',
      'Si te salió la pantalla azul con una carita triste, toma una foto del código de error (ej: DPC_WATCHDOG) para escalarlo con el técnico.'
    ]
  },

  // 5. SAP ERP Y FACTURACIÓN
  {
    codigo: 'KB-105',
    titulo: 'Bloqueo de documentos en SAP ERP (SM12 / VF01) y fallos de facturación',
    categoria: 'Software',
    problemaColoquial: 'no te deja facturar, timbrar o el sistema dice que otro usuario tiene abierto el documento',
    explicacionSencilla: 'En ventas y almacén una factura detenida afecta las entregas. Esto pasa cuando una sesión previa se cerró abruptamente o se fue la luz, dejando un "candado de usuario" en el servidor de SAP.',
    frasesColoquiales: [
      'no me deja facturar', 'no puedo timbrar', 'error al timbrar',
      'el sistema dice que alguien mas lo tiene abierto', 'documento bloqueado',
      'me sale un candado en sap', 'no puedo hacer remisiones', 'error en el erp',
      'se trabo la factura', 'no me deja guardar la factura', 'alguien mas esta usando el documento',
      'remision bloqueada', 'no jala sap', 'error en sap'
    ],
    palabrasClave: ['sap', 'erp', 'factura', 'facturar', 'facturas', 'timbrar', 'timbrado', 'remision', 'remisiones', 'sm12', 'vf01', 'candado', 'bloqueado', 'bloqueada', 'abierto', 'folio fiscal'],
    pasosSencillos: [
      'Cierra todas las ventanas de SAP en tu computadora (si no quieren cerrar, usa Ctrl + Shift + Esc y dale "Finalizar tarea" a SAP GUI).',
      'Espera 2 minutos: el servidor de SAP suele liberar los bloqueos huérfanos automáticamente.',
      'Si el mensaje de candado persiste con tu propio usuario, solicita al supervisor de almacén liberar el candado en la transacción SM12.',
      'Vuelve a entrar a la transacción VF01 para regenerar y timbrar la factura sin problemas.'
    ]
  },

  // 6. OUTLOOK Y CORREO INSTITUCIONAL
  {
    codigo: 'KB-045',
    titulo: 'Fallo de sincronización en Microsoft Outlook, buzón lleno y archivos OST dañados',
    categoria: 'Software',
    problemaColoquial: 'no puedes mandar correos, no te llegan mensajes o dice buzón lleno',
    explicacionSencilla: 'El correo es vital para tu comunicación diaria. Si tus correos se quedan atorados en la "Bandeja de salida" o no entran mensajes, suele deberse a un archivo adjunto que sobrepasó los 25 MB o a que se saturó el buzón.',
    frasesColoquiales: [
      'no puedo enviar correos', 'no me llegan los correos', 'no puedo mandar mail',
      'el correo no abre', 'se queda en bandeja de salida', 'dice buzon lleno',
      'no me entran los mensajes de correo', 'outlook no responde', 'outlook se traba',
      'error al mandar correo', 'el archivo es muy pesado para enviar', 'no sincroniza el correo',
      'no jala el outlook'
    ],
    palabrasClave: ['correo', 'correos', 'mail', 'email', 'outlook', 'buzon', 'bandeja', 'adjunto', 'enviar', 'recibir', 'mensajes', 'exchange', 'ost', 'pst'],
    pasosSencillos: [
      'Revisa tu "Bandeja de salida": si hay un correo con un archivo de más de 20 Megas, dale clic derecho y bórralo (esos correos pesados traban la fila).',
      'Cierra Outlook, presiona Windows + R, escribe "outlook.exe /safe" y da Enter para abrirlo a prueba de fallos.',
      'En la parte superior haz clic en "Enviar y recibir" y pulsa "Actualizar carpeta".',
      'Si tu buzón dice estar lleno, vacía la carpeta de "Elementos eliminados" y "Correo no deseado".'
    ]
  },

  // 7. MICROSOFT TEAMS (AUDIO, MICRÓFONO Y CÁMARA)
  {
    codigo: 'KB-062',
    titulo: 'Problemas de audio, micrófono y cámara web en Microsoft Teams',
    categoria: 'Software',
    problemaColoquial: 'no te escuchan en la llamada, no sirve tu micrófono o la cámara se ve negra',
    explicacionSencilla: 'Es muy incómodo entrar a una reunión y que nadie te escuche o que tu cámara no dé video. Casi siempre se debe a que Teams tomó un micrófono o bocina diferente al que tienes conectado.',
    frasesColoquiales: [
      'no me escuchan en la llamada', 'no sirve mi microfono', 'no se oye mi voz',
      'la camara se ve negra', 'no me ven en la junta', 'no los escucho en la llamada',
      'no sale el audio en teams', 'teams no detecta mis audifonos', 'fallo en la videollamada',
      'no se escucha nada en la reunion', 'camara apagada en llamada', 'no sirve el audio',
      'microfono no jala'
    ],
    palabrasClave: ['teams', 'llamada', 'videollamada', 'junta', 'reunion', 'microfono', 'audio', 'camara', 'voz', 'escuchan', 'oyen', 'bocinas', 'audifonos'],
    pasosSencillos: [
      'Dentro de la reunión de Teams, haz clic en los 3 puntitos (...) de arriba > Configuración de dispositivo y confirma qué micrófono y bocinas están seleccionados.',
      'Fíjate si el cable de tus audífonos tiene una ruedita o botón físico que esté silenciando el micrófono.',
      'Ve a Configuración de Windows > Privacidad > Micrófono y comprueba que el acceso para Teams esté en "Permitido".',
      'Desconecta tus audífonos o cámara USB y vuelve a conectarlos en otro puerto.'
    ]
  },

  // 8. CONTRASEÑAS Y ACTIVE DIRECTORY
  {
    codigo: 'KB-102',
    titulo: 'Restablecimiento de contraseña y desbloqueo de cuenta en Active Directory',
    categoria: 'Acceso',
    problemaColoquial: 'olvidaste tu contraseña, tu cuenta está bloqueada o no puedes iniciar sesión en tu compu',
    explicacionSencilla: 'No te preocupes, olvidar la clave o bloquear la cuenta le pasa a todo el mundo. Las políticas de la empresa bloquean la cuenta tras varios intentos por seguridad para proteger tu usuario.',
    frasesColoquiales: [
      'se me olvido la contrasena', 'se me olvido la clave', 'no me deja entrar a mi compu',
      'mi cuenta esta bloqueada', 'no puedo iniciar sesion', 'olvide mi contrasena',
      'no entra mi clave', 'clave incorrecta', 'cambiar mi contrasena',
      'contrasena vencida', 'usuario bloqueado', 'me dice cuenta bloqueada',
      'no me acuerdo de mi clave', 'como cambio mi clave', 'bloquee mi usuario'
    ],
    palabrasClave: ['contrasena', 'password', 'clave', 'bloqueada', 'bloqueado', 'olvide', 'olvido', 'iniciar sesion', 'acceso', 'usuario', 'dominio', 'expirada', 'vencida', 'active directory'],
    pasosSencillos: [
      'Si tu cuenta se bloqueó por ingresar la clave incorrecta varias veces, espera 15 minutos: el sistema la desbloquea automáticamente.',
      'Verifica que la tecla Bloq Mayús (Caps Lock) no esté encendida por equivocación.',
      'Para cambiarla si tienes acceso a Windows, presiona Ctrl + Alt + Supr y selecciona "Cambiar una contraseña".',
      'Si requieres acceso urgente ahora mismo, haz clic abajo en "Escalar a soporte" para que el técnico te la restablezca en 2 minutos.'
    ]
  },

  // 9. MICROSOFT AUTHENTICATOR Y MFA
  {
    codigo: 'KB-110',
    titulo: 'Configuración y resolución de problemas con Microsoft Authenticator (MFA)',
    categoria: 'Acceso',
    problemaColoquial: 'no te llega el código de verificación al celular o cambiaste de teléfono',
    explicacionSencilla: 'Cuando cambias de celular o el código de 6 números no coincide, quedas imposibilitado para ingresar a tus correos y sistemas de la empresa.',
    frasesColoquiales: [
      'no me llega el codigo al celular', 'cambie de cel y no puedo entrar', 'cambie de telefono',
      'no puedo entrar al authenticator', 'no me sale el numero de verificacion',
      'el codigo no coincide', 'perdi mi celular y no puedo iniciar sesion',
      'verificacion en dos pasos', 'token del cel no sirve', 'no me llega la notificacion al cel',
      'autenticador no abre'
    ],
    palabrasClave: ['authenticator', 'mfa', 'codigo', 'celular', 'telefono', 'token', 'dos pasos', 'verificacion', 'cambie de cel', 'doble factor'],
    pasosSencillos: [
      'Abre la app Microsoft Authenticator en tu celular y asegúrate de que la fecha y hora de tu celular estén en "Automático" (si difiere por segundos, el código fallará).',
      'Confirma que tu celular tenga señal de Wi-Fi o datos móviles activos.',
      'En la pantalla de tu computadora da clic en "Iniciar sesión de otra manera" y elige recibir llamada o mensaje SMS.',
      'Si compraste un teléfono nuevo y ya no tienes el anterior, escala tu caso para que soporte resetee tu método de autenticación.'
    ]
  },

  // 10. CARPETAS COMPARTIDAS Y PERMISOS SMB
  {
    codigo: 'KB-155',
    titulo: 'Gestión de permisos y acceso a carpetas compartidas de red (SMB)',
    categoria: 'Acceso',
    problemaColoquial: 'no puedes abrir la carpeta compartida de tu área o te dice "Acceso denegado"',
    explicacionSencilla: 'Comprendo tu necesidad de abrir los archivos compartidos del equipo. Cuando aparece "Acceso denegado" o desaparece la unidad Z, suele ser porque la sesión de red se desautenticó.',
    frasesColoquiales: [
      'no puedo entrar a la carpeta de mi area', 'acceso denegado a la carpeta',
      'no puedo ver los archivos compartidos', 'desaparecio el disco z',
      'no abre la carpeta de red', 'no tengo permisos para abrir el archivo',
      'me sale error de red al abrir archivo', 'carpeta compartida bloqueada',
      'no veo los archivos de mi equipo'
    ],
    palabrasClave: ['carpeta', 'carpetas', 'compartida', 'archivos', 'servidor', 'disco z', 'permiso', 'acceso denegado', 'red', 'smb', 'srv archivos'],
    pasosSencillos: [
      'Presiona en tu teclado Windows + R, escribe "\\\\srv-archivos\\departamentos" y da Enter.',
      'Si te pide usuario y contraseña, ingresa tu correo institucional completo y tu contraseña de Windows.',
      'Si estás trabajando fuera de la empresa, asegúrate de que tu VPN esté previamente conectada.',
      'Si cambiaste recientemente de puesto o departamento, tu jefe de área debe autorizar el alta de permisos con soporte.'
    ]
  },

  // 11. TRABAJO REMOTO Y VPN GLOBALPROTECT
  {
    codigo: 'KB-231',
    titulo: 'Acceso y configuración VPN corporativa GlobalProtect fuera de oficina',
    categoria: 'Acceso',
    problemaColoquial: 'no puedes conectar a los sistemas desde tu casa o la VPN marca error',
    explicacionSencilla: 'Es muy frustrante querer avanzar en tus labores desde casa o de viaje y que la VPN "no quiera conectar". Suele deberse a microcortes de tu Wi-Fi o a ingresar el usuario con formato incorrecto.',
    frasesColoquiales: [
      'no puedo conectar desde mi casa', 'no entra la vpn', 'no me deja entrar al sistema desde mi casa',
      'home office no conecta', 'error en la vpn', 'se cae la vpn', 'no puedo trabajar desde fuera',
      'falla la conexion remota', 'globalprotect marca error', 'no conecta el trabajo remoto',
      'la vpn se queda conectando'
    ],
    palabrasClave: ['vpn', 'globalprotect', 'casa', 'remoto', 'home office', 'fuera', 'tunel', 'conectar', 'radius'],
    pasosSencillos: [
      'Abre el programa GlobalProtect (el ícono de mundito junto al reloj de Windows).',
      'Haz clic en las 3 rayitas de la esquina > Configuración > General y selecciona "Actualizar conexión".',
      'En tu usuario de conexión ingresa únicamente tu nombre de usuario SIN "@gid.com.mx".',
      'Si tu Wi-Fi de casa tiene baja señal, acércate al módem o prueba reiniciándolo.'
    ]
  },

  // 12. RED LOCAL, INTERNET Y CABLE ETHERNET
  {
    codigo: 'KB-008',
    titulo: 'Fallo de conexión de red LAN Ethernet, Wi-Fi o conmutador de planta',
    categoria: 'Redes',
    problemaColoquial: 'no tienes internet, la red no jala o el cable dice "Sin conexión"',
    explicacionSencilla: 'Quedarse sin conexión te frena todo. Cuando la computadora dice "no hay internet" o "no jala la red", en el 90% de los casos es solo un falso contacto en el cable o la tarjeta de red desincronizada.',
    frasesColoquiales: [
      'no tengo internet', 'se fue el internet', 'no jala el internet', 'el internet no agarra',
      'no cargan las paginas', 'no me abre google', 'sin conexion', 'cable de red desconectado',
      'la compu no tiene red', 'se cayo el internet', 'no hay conexion', 'dice sin internet',
      'triangulo amarillo en red', 'el cable no agarra', 'no conecta la red', 'se fue la red',
      'no agarra el internet', 'no me puedo meter a internet', 'no entra al internet',
      'se desconecto la red'
    ],
    palabrasClave: ['internet', 'red', 'cable', 'lan', 'ethernet', 'conectar', 'conexion', 'desconectado', 'paginas', 'google', 'enlace', 'puerto', 'rj45', 'ipconfig'],
    pasosSencillos: [
      'Revisa el cable gris o azul que va de la parte trasera de tu gabinete a la pared: desconéctalo y vuelve a encajarlo hasta escuchar un "click".',
      'Verifica que las dos lucecitas en el puerto de red (verde o ámbar) estén encendidas o parpadeando.',
      'Presiona en tu teclado Windows + R, escribe "cmd", presiona Enter y en la ventana negra escribe: "ipconfig /renew" para refrescar tu conexión.',
      'Abre el navegador e intenta entrar a www.google.com para confirmar si ya navega con normalidad.'
    ]
  },

  // 13. WI-FI CORPORATIVO
  {
    codigo: 'KB-012',
    titulo: 'Conexión a la red Wi-Fi institucional (WPA2-Enterprise) y certificados',
    categoria: 'Redes',
    problemaColoquial: 'el Wi-Fi de la empresa no conecta o se desconecta a cada rato',
    explicacionSencilla: 'Sé lo tedioso que es que la red Wi-Fi se corte o no quiera enlazar tu laptop en las oficinas o salas de juntas de la empresa.',
    frasesColoquiales: [
      'no me conecta el wifi', 'se desconecta el wifi de la empresa',
      'el internet inalambrico no jala', 'cual es la clave del wifi', 'wifi muy lento',
      'no agarra la senal del wifi', 'se cae el wifi en la oficina',
      'no puedo conectar mi laptop al wifi'
    ],
    palabrasClave: ['wifi', 'inalambrico', 'senial', 'red inalambrica', 'gid corp', 'desconecta', 'wpa2'],
    pasosSencillos: [
      'Apaga el Wi-Fi de tu laptop durante 10 segundos desde la barra de tareas y vuelve a encenderlo.',
      'En la lista de redes, selecciona "GID-CORP", haz clic derecho y elige "Dejar de recordar esta red".',
      'Vuelve a conectarte escribiendo tu usuario y contraseña de Windows cuando te lo pida.',
      'Si estás en un área lejana o rodeada de maquinaria pesada, acércate a una antena del techo para mejor señal.'
    ]
  },

  // 14. ANTIVIRUS, SEGURIDAD Y ALERTAS
  {
    codigo: 'KB-180',
    titulo: 'Protocolo ante alertas de seguridad, aislamiento de endpoint y Cortex XDR',
    categoria: 'Seguridad',
    problemaColoquial: 'el antivirus bloqueó un archivo o salió una alerta de amenaza',
    explicacionSencilla: '¡Tranquilo! Si te apareció una advertencia de seguridad o el antivirus bloqueó un archivo, significa que los escudos de protección de Grupo Industrial Delnorte actuaron a tiempo para mantener tu equipo seguro.',
    frasesColoquiales: [
      'la compu dice que tiene virus', 'salio una alerta de virus', 'el antivirus bloqueo un archivo',
      'ventana roja de peligro', 'dice que el equipo fue aislado',
      'bloqueo un programa por seguridad', 'alerta de defender o cortex',
      'creo que hackearon mi compu'
    ],
    palabrasClave: ['virus', 'antivirus', 'bloqueo', 'aislado', 'alerta', 'cortex', 'defender', 'amenaza', 'peligro', 'cuarentena'],
    pasosSencillos: [
      'No te preocupes ni intentes descargar programas externos para quitar la alerta.',
      'Si el archivo bloqueado es un documento de trabajo legítimo, anota su nombre completo y ruta.',
      'Desconecta cualquier memoria USB externa conectada a tu computadora.',
      'Haz clic abajo en "Escalar a soporte" para que el equipo de ciberseguridad verifique el archivo y lo libere si es seguro.'
    ]
  },

  // 15. MEMORIAS USB BLOQUEADAS
  {
    codigo: 'KB-099',
    titulo: 'Política de seguridad NFR-08: Puertos USB bloqueados y protección DLP',
    categoria: 'Seguridad',
    problemaColoquial: 'la compu no detecta tu memoria USB o dice que el puerto está bloqueado',
    explicacionSencilla: 'Es normal que te preguntes por qué tu memoria "no se abre" o "no te deja meter archivos". En todas las computadoras de la empresa los puertos USB están restringidos intencionalmente por política de seguridad industrial.',
    frasesColoquiales: [
      'no lee mi memoria usb', 'la compu no detecta mi pendrive', 'no me deja meter mi memoria',
      'no puedo copiar archivos a mi memoria', 'el puerto usb no jala',
      'dice que la usb esta bloqueada', 'no abre mi usb', 'como paso archivos a mi memoria',
      'la computadora no reconoce el usb'
    ],
    palabrasClave: ['usb', 'memoria', 'pendrive', 'disco duro', 'copiar', 'puerto', 'bloqueada', 'reconoce', 'detecta', 'dlp', 'nfr 08'],
    pasosSencillos: [
      'Por política de ciberseguridad industrial NFR-08, los puertos USB de almacenamiento están deshabilitados para evitar virus y fuga de información.',
      'Para respaldar o transferir tus documentos de trabajo, utiliza OneDrive institucional o la carpeta compartida de red de tu departamento.',
      'Si requieres enviar archivos a un proveedor o cliente externo, compártelos mediante un enlace protegido de OneDrive por correo.',
      'Si por necesidad estricta de tu puesto requieres usar memorias USB físicas, tu gerente debe solicitar la dispensa oficial al CISO.'
    ]
  }
];

export async function askAiAssistant(
  prompt: string,
  userEmail?: string,
  ticketContext?: TicketDraftContext,
  history: ConversationTurn[] = []
): Promise<AiDiagnosticResult> {
  const cleanPrompt = prompt.trim();
  const prior = history.slice(-12).map(t=>({sender:t.sender,text:t.text.slice(0,6000),steps:t.steps,citation:t.citation}));
  // The same guarded local retrieval is used when the optional AI service is offline.
  // API credentials live on the AI server, never in this browser bundle.
  const result = runAutonomousColloquialEngine(cleanPrompt, ticketContext, prior);
  const endpoint = import.meta.env.VITE_AI_SERVICE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
  if(endpoint && result.cita.startsWith('Artículo ') && !prior.some(t=>t.sender==='user')) {
    try {
      const res = await fetch(`${endpoint.replace(/\/$/,'')}/api/v1/ai/chat`, {method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(6000),body:JSON.stringify({query:cleanPrompt,user_id:userEmail,context:ticketContext,history:prior})});
      if(res.ok) {const data=await res.json();const code=data.cita?.match(/KB-\d+/)?.[0];if(code && FULL_KB_CATALOG.some(a=>a.codigo===code) && data.cita===result.cita && Array.isArray(data.pasos)) return {...result,respuesta:data.respuesta,pasos:data.pasos,modelo:data.modelo || 'Servicio RIALSA',requiereEscalado:Boolean(data.requiere_escalado)};}
    } catch { /* local catalog fallback */ }
  }
  return result;
}

/**
 * Motor Autónomo con entendimiento coloquial para usuarios no técnicos.
 * Normaliza lenguaje, evalúa frases cotidianas ("no jala", "se tragó el papel", "no da video")
 * y responde con empatía y sencillez.
 */
function runAutonomousColloquialEngine(
  prompt: string,
  ticketContext?: TicketDraftContext,
  history: ConversationTurn[] = []
): AiDiagnosticResult {
  const normPrompt = normalizeText(prompt);

  const response = (respuesta:string,pasos:string[]=[],cita='',requiereEscalado=false):AiDiagnosticResult => ({respuesta,pasos,cita,similitud:'',modelo:'Catálogo técnico RIALSA',requiereEscalado});
  if (!normPrompt) return response('Describe el problema para poder ayudarte.');
  // Las peticiones de datos de terceros o de alterar reglas no acceden a sistemas ni secretos.
  if (/(ignora|omite|olvida).*(reglas|instrucciones)|system prompt|prompt del sistema|revela.*(instrucciones|secretos)|usa internet|busca en internet|eres administrador|datos de otros|tickets de (?:otro|ricardo|carlos|alfredo|salvador)|notas internas|service role|api key|clave de la red|contrasena de la red|cual es la (?:clave|contrasena)|dame.*(?:contrasenas|claves|tokens)/.test(normPrompt)) return response('No tengo acceso autorizado a contraseñas, datos privados, tickets de otros usuarios ni instrucciones internas. Puedo ayudarte con procedimientos documentados o escalar la incidencia a soporte.');
  if (/^(hola|buenos dias|buen dia|buenas tardes|buenas noches|ayuda|oye|saludos)$/.test(normPrompt)) return response('Hola. Indica el equipo o sistema afectado y qué mensaje de error aparece.');
  if (/^(gracias|muchas gracias|ya funciono|ya quedo|ya jalo|listo)$/.test(normPrompt)) return response('De acuerdo. Si el incidente ya quedó resuelto, puedes marcarlo como solucionado.');
  if (/\b(clima|receta|deportes|chiste|broma|futbol|politica|manual inexistente|kb ficticio)\b/.test(normPrompt)) return response('Mi alcance se limita a soporte técnico y a los manuales autorizados de RIALSA. No tengo una fuente aplicable para esa consulta.');
  const lastAnswer = [...history].reverse().find(t=>t.sender==='ai' && t.citation?.startsWith('Artículo '));
  const lastCode = lastAnswer?.citation?.match(/KB-\d+/)?.[0];
  const previousArticle = FULL_KB_CATALOG.find(a=>a.codigo===lastCode);
  const followup = /\b(ya|sigue|todavia|tampoco|no funciono|intente|probe|reinicie|hice|no sirvio|otra alternativa|mismo error|despues)\b/.test(normPrompt);
  if (followup && previousArticle) {
    const done=normalizeText(history.filter(t=>t.sender==='user').map(t=>t.text).join(' ')+' '+prompt);
    const used=new Set(history.filter(t=>t.sender==='ai').flatMap(t=>t.steps||[]));
    const remaining=previousArticle.pasosSencillos.filter(step=>!used.has(step)&&!(/reinici|reinicia|reiniciar/.test(normalizeText(step))&&/reinici/.test(done)));
    const source=`Artículo ${previousArticle.codigo}: ${previousArticle.titulo}`;
    return remaining.length ? response('Entiendo que los pasos anteriores no resolvieron la incidencia. Continuemos con las comprobaciones pendientes del mismo manual.',remaining,source) : response('Entiendo que ya intentaste las comprobaciones anteriores y el problema persiste. No repetiré esos pasos. Necesito el mensaje de error exacto, el equipo afectado y si el problema ocurre también en otros dispositivos. Si continúa, escala el caso a soporte con este historial.',[],source,true);
  }
  if(followup && history.some(t=>t.sender==='user')&&!previousArticle) return response('Entiendo que la incidencia continúa. Para avanzar, indica qué sistema o equipo falla, el mensaje exacto de error y qué comprobaciones ya realizaste. Si no hay un procedimiento aplicable, podemos escalarlo.',[],'',true);

  // Construir texto combinado si hay contexto de ticket
  const combinedRaw = ticketContext
    ? `${prompt} ${ticketContext.asunto || ''} ${ticketContext.descripcion || ''} ${ticketContext.categoria || ''}`
    : prompt;
  const combinedNorm = normalizeText(combinedRaw);

  // Algoritmo de ponderación semántica coloquial
  let bestMatch: KbArticleDefinition | null = null;
  let bestScore = 0;

  for (const art of FULL_KB_CATALOG) {
    let score = 0;

    // 1. Coincidencia de frases coloquiales exactas (+4 puntos por frase)
    for (const phrase of art.frasesColoquiales) {
      const normPhrase = normalizeText(phrase);
      if (combinedNorm.includes(normPhrase)) {
        score += 4;
      }
    }

    // 2. Coincidencia de palabras clave individuales (+1 punto por palabra)
    for (const kw of art.palabrasClave) {
      const normKw = normalizeText(kw);
      // Evitar que subcadenas muy cortas den falsos positivos
      if (normKw.length >= 3 && combinedNorm.includes(normKw)) {
        score += 1;
      }
    }

    // 3. Coincidencia de categoría si el usuario la seleccionó (+2 puntos)
    if (score > 0 && ticketContext?.categoria && normalizeText(ticketContext.categoria) === normalizeText(art.categoria)) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = art;
    }
  }

  // Si encontramos una coincidencia relevante (score >= 2)
  if (bestMatch && (bestScore >= 2 || /\b(vpn|wifi|wi fi|impresora|sap|erp|teams|outlook|zebra|monitor|contrasena)\b/.test(combinedNorm))) {
    const sim = Math.min(0.98, 0.82 + bestScore * 0.02).toFixed(2);
    const encabezado = `Según el manual aplicable, parece que ${bestMatch.problemaColoquial}.\n\n${bestMatch.explicacionSencilla}`;

    return {
      respuesta: encabezado,
      pasos: bestMatch.pasosSencillos,
      cita: `Artículo ${bestMatch.codigo}: ${bestMatch.titulo}`,
      similitud: "",
      modelo: 'Catálogo técnico RIALSA',
      requiereEscalado: false
    };
  }

  return response('No encontré un procedimiento específico en los manuales autorizados para esta incidencia. ¿Qué equipo o aplicación utilizas, qué mensaje aparece y desde cuándo sucede? Si no podemos identificar la causa, puedes escalar el caso a soporte.',[], '', true);
}
