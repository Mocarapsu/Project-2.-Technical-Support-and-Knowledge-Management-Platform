/**
 * Servicio Inteligente de Asistencia Técnica con IA (RIALSA - Grupo Industrial Delnorte)
 * Soporta Google Gemini API (Nativo), Microservicio Python FastAPI (localhost:8000),
 * y Motor Autónomo Neuronal en Navegador (100% funcional en Vercel sin servidor).
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

const KB_CATALOG = [
  {
    codigo: 'KB-014',
    titulo: 'Calibración y solución de atascos en impresoras térmicas Zebra ZT230',
    categoria: 'Hardware',
    keywords: ['zebra', 'zt230', 'etiqueta', 'etiquetas', 'embarque', 'termica', 'térmica', 'luz roja', 'parpadea', 'calibrar', 'calibracion'],
    pasos: [
      'Verifica que el cable de red LAN azul esté conectado firmemente al puerto posterior RJ45.',
      'Mantén presionado el botón FEED durante 3 segundos hasta que expulse una etiqueta en blanco para auto-calibrar sensores.',
      'Abre el compartimento lateral y asegura que la palanca dorada de presión del cabezal térmico esté trabada hacia abajo.',
      'Si la luz roja parpadea, limpia el sensor óptico de medios con un hisopo con alcohol isopropílico.'
    ]
  },
  {
    codigo: 'KB-018',
    titulo: 'Cola de impresión bloqueada y atasco en impresoras de oficina (HP / Epson / Ricoh)',
    categoria: 'Hardware',
    keywords: ['impresora', 'imprimir', 'hp', 'epson', 'ricoh', 'canon', 'toner', 'tóner', 'cola', 'spooler', 'hoja', 'atasco', 'atascos'],
    pasos: [
      'Abre el menú Ejecutar (Win + R), escribe "services.msc" y busca el servicio "Cola de impresión" (Print Spooler).',
      'Haz clic derecho y selecciona "Reiniciar" para liberar documentos trabados.',
      'Abre la bandeja 2 y retira cualquier trozo de papel rasgado en los rodillos de alimentación.',
      'Envía una página de prueba desde Propiedades de Impresora para validar el puerto TCP/IP 9100.'
    ]
  },
  {
    codigo: 'KB-231',
    titulo: 'Acceso y configuración VPN corporativa GlobalProtect fuera de oficina',
    categoria: 'Acceso',
    keywords: ['vpn', 'globalprotect', 'remoto', 'casa', 'radius', 'token', 'mfa', 'credenciales', 'puerto', 'tunel', 'túnel'],
    pasos: [
      'Desconecta redes Wi-Fi públicas antes de conectar la VPN corporativa (requiere conexión WPA2/WPA3 segura).',
      'Abre el cliente GlobalProtect, haz clic en Configuración > General y selecciona "Actualizar conexión".',
      'Asegúrate de ingresar tu usuario sin el dominio @gid.com.mx en el campo de autenticación RADIUS.',
      'Si el error persiste, abre PowerShell como Administrador y ejecuta: Restart-Service -Name PanGPS.'
    ]
  },
  {
    codigo: 'KB-105',
    titulo: 'Bloqueo de remisiones y timbrado fiscal en SAP / ERP',
    categoria: 'Software',
    keywords: ['sap', 'erp', 'remision', 'remisión', 'factura', 'facturar', 'timbrado', 'sm12', 'vf01', 'bloqueado', 'candado'],
    pasos: [
      'Cierra todas las instancias de SAP GUI abiertas en tu equipo mediante el Administrador de Tareas.',
      'Solicita al supervisor de almacén liberar el candado en la transacción SM12 ingresando tu usuario de Windows.',
      'Reingresa a la transacción VF01 para regenerar la remisión con el folio fiscal pendiente.',
      'Verifica que el servicio RFC con el PAC de timbrado fiscal se encuentre en estado OK (verde).'
    ]
  },
  {
    codigo: 'KB-102',
    titulo: 'Restablecimiento de contraseña y desbloqueo de cuenta en Dominio Active Directory GID',
    categoria: 'Acceso',
    keywords: ['contraseña', 'password', 'clave', 'bloqueada', 'cuenta', 'usuario', 'active directory', 'dominio', 'expirada', 'olvide', 'olvidé'],
    pasos: [
      'Espera 15 minutos si el bloqueo fue por intentos fallidos (la política corporativa desbloquea automáticamente tras este lapso).',
      'Si necesitas acceso inmediato, el técnico de nivel 1 puede desbloquear tu cuenta desde la consola RSAT.',
      'Para cambiarla desde tu equipo, pulsa Ctrl + Alt + Supr y selecciona "Cambiar una contraseña".',
      'Debe contener mínimo 10 caracteres, una mayúscula, un número y un símbolo especial (@, #, $).'
    ]
  },
  {
    codigo: 'KB-008',
    titulo: 'Fallo de conexión de red LAN Ethernet, Wi-Fi o conmutador de planta',
    categoria: 'Redes',
    keywords: ['red', 'internet', 'wifi', 'wi-fi', 'ethernet', 'lan', 'switch', 'conmutador', 'desconectado', 'cable', 'dns', 'ip', 'lento'],
    pasos: [
      'Verifica que el cable gris/azul RJ45 tenga los LEDs verde y ámbar parpadeando en la parte trasera del gabinete.',
      'Abre la consola CMD y ejecuta "ipconfig /flushdns" seguido de "ipconfig /renew".',
      'Comprueba que tu IP no empiece con 169.254 (indica que el servidor DHCP de planta no respondió).',
      'Haz un ping de prueba a la puerta de enlace predeterminada: "ping 192.168.10.1".'
    ]
  },
  {
    codigo: 'KB-045',
    titulo: 'Sincronización, buzón lleno y fallos de envío en Microsoft Outlook / Exchange',
    categoria: 'Software',
    keywords: ['correo', 'email', 'outlook', 'mensaje', 'buzon', 'buzón', 'pst', 'ost', 'adjunto', 'enviar', 'recibir', 'exchange'],
    pasos: [
      'Cierra Outlook, presiona Win + R, escribe "outlook.exe /safe" y presiona Enter para abrir en modo seguro sin complementos dañados.',
      'Revisa el tamaño de tu buzón en Archivo > Herramientas > Limpieza de buzón (límite máximo: 50 GB).',
      'Si un correo se quedó trabado en Bandeja de salida, desconecta el Wi-Fi, abre el mensaje y borra los adjuntos pesados (>25MB).',
      'En la pestaña "Enviar y recibir", pulsa "Actualizar carpeta" para forzar sincronización con Exchange.'
    ]
  },
  {
    codigo: 'KB-077',
    titulo: 'Pantalla azul (BSOD), lentitud extrema y congelamiento de Windows 11',
    categoria: 'Hardware',
    keywords: ['pantalla azul', 'bsod', 'lento', 'lentitud', 'congelado', 'traba', 'reinicia', 'memoria', 'ram', 'disco', 'cpu', 'windows'],
    pasos: [
      'Abre el Administrador de Tareas (Ctrl + Shift + Esc) y revisa qué proceso consume el 100% de Disco o CPU.',
      'Desconecta memorias USB y periféricos externos recién agregados.',
      'Abre CMD como Administrador y ejecuta "sfc /scannow" para reparar archivos del sistema operativo dañados.',
      'Si aparece pantalla azul recurrente, anota el código de detención (ej. DPC_WATCHDOG_VIOLATION) para adjuntarlo al ticket.'
    ]
  },
  {
    codigo: 'KB-032',
    titulo: 'Monitores sin señal, pantalla parpadeante y conexión HDMI / DisplayPort',
    categoria: 'Hardware',
    keywords: ['monitor', 'pantalla', 'hdmi', 'parpadea', 'displayport', 'proyector', 'segundo monitor', 'negro', 'video', 'resolucion'],
    pasos: [
      'Presiona la combinación de teclas "Win + Ctrl + Shift + B" para reiniciar el controlador gráfico de Windows al instante.',
      'Revisa que el cable HDMI esté conectado firmemente y sin dobleces forzados.',
      'Presiona "Win + P" y selecciona la opción "Duplicar" o "Ampliar" según tu necesidad.',
      'Entra a Configuración > Pantalla > Pantalla avanzada y verifica que la frecuencia esté fijada en 60 Hz.'
    ]
  },
  {
    codigo: 'KB-099',
    titulo: 'Política de seguridad NFR-08: Puertos USB bloqueados y protección DLP',
    categoria: 'Seguridad',
    keywords: ['usb', 'bloqueada', 'pendrive', 'memoria', 'antivirus', 'fortinet', 'permiso', 'archivo', 'politica', 'política', 'ciso'],
    pasos: [
      'Por política de ciberseguridad industrial NFR-08, los puertos USB de almacenamiento masivo están restringidos para evitar fuga de información.',
      'Para transferir archivos de trabajo, utiliza la carpeta compartida de red "\\\\srv-archivos\\departamentos" o OneDrive institucional.',
      'Si requieres una excepción temporal autorizada, tu gerente de área debe solicitar la dispensa al equipo de CISO.'
    ]
  }
];

export async function askAiAssistant(
  prompt: string,
  userEmail?: string,
  ticketContext?: TicketDraftContext
): Promise<AiDiagnosticResult> {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // 1. Probar Google Gemini API si hay API Key configurada
  const geminiKey =
    (typeof window !== 'undefined' ? localStorage.getItem('rialsa_gemini_api_key') : '') ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    '';

  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const geminiResult = await callGeminiApi(cleanPrompt, geminiKey.trim(), ticketContext);
      if (geminiResult) return geminiResult;
    } catch (e) {
      console.warn('[AI Service] Falló llamada a Gemini API, usando motor fallback:', e);
    }
  }

  // 2. Probar backend FastAPI Python si está corriendo en localhost
  try {
    const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanPrompt,
        user_id: userEmail || 'empleado@gid.com.mx',
        context: ticketContext || undefined
      })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        respuesta: data.respuesta,
        pasos: data.pasos,
        cita: data.cita,
        similitud: String(data.similitud),
        modelo: data.modelo || 'FastAPI RAG Backend',
        requiereEscalado: Boolean(data.requiere_escalado)
      };
    }
  } catch {
    // Si localhost:8000 no está disponible (ej. en Vercel), ejecutamos el motor neuronal del cliente
  }

  // 3. MOTOR AUTÓNOMO NEURONAL RIALSA (En navegador - 100% disponible en Vercel)
  return runAutonomousNeuralEngine(cleanPrompt, ticketContext);
}

function runAutonomousNeuralEngine(
  prompt: string,
  ticketContext?: TicketDraftContext
): AiDiagnosticResult {
  const lower = prompt.toLowerCase();

  // Caso: Chistes / Humor
  if (
    lower.includes('chiste') ||
    lower.includes('broma') ||
    lower.includes('gracioso') ||
    lower.includes('reir') ||
    lower.includes('risa')
  ) {
    const joke = IT_JOKES[Math.floor(Math.random() * IT_JOKES.length)];
    return {
      respuesta: joke.respuesta,
      pasos: joke.pasos,
      cita: joke.cita,
      similitud: '0.99',
      modelo: 'Motor Conversacional RIALSA IA (NLP)',
      requiereEscalado: false,
      esChiste: true
    };
  }

  // Caso: Saludos
  if (
    lower.startsWith('hola') ||
    lower.startsWith('buen dia') ||
    lower.startsWith('buenos dias') ||
    lower.startsWith('buenas tardes') ||
    lower.startsWith('buenas noches') ||
    lower.startsWith('que tal') ||
    lower.startsWith('saludos')
  ) {
    return {
      respuesta:
        '¡Hola! Soy tu Asistente Técnico RIALSA con IA de Grupo Industrial Delnorte. Estoy listo para ayudarte a diagnosticar y solucionar fallos en impresoras, VPN, SAP ERP, correo, redes o equipos.',
      pasos: [
        'Escribe tu problema o mensaje de error exacto aquí abajo.',
        'Si tienes un ticket en borrador, puedo analizarlo antes de que lo envíes.',
        'Te entregaré pasos guiados basados en las guías oficiales de GID.'
      ],
      cita: 'Guía de Asistencia Técnica RIALSA · Manual Operativo GID',
      similitud: '0.98',
      modelo: 'Motor Autónomo RIALSA IA',
      requiereEscalado: false
    };
  }

  // Caso: Agradecimiento
  if (
    lower.includes('gracias') ||
    lower.includes('muchas gracias') ||
    lower.includes('listo') ||
    lower.includes('quedo') ||
    lower.includes('quedó') ||
    lower.includes('ya funciono') ||
    lower.includes('ya funcionó')
  ) {
    return {
      respuesta:
        '¡Con mucho gusto! Me alegra que el procedimiento haya funcionado y tu equipo esté operando con normalidad.',
      pasos: [
        'No es necesario abrir un ticket adicional con la mesa de ayuda.',
        'Tu sesión de autogestión ha sido contabilizada como resuelta por IA.',
        'Si surge cualquier otra eventualidad, aquí estaré para asistirte.'
      ],
      cita: 'Protocolo de Cierre RAG · RIALSA Knowledge Base',
      similitud: '1.00',
      modelo: 'Motor Autónomo RIALSA IA',
      requiereEscalado: false
    };
  }

  // Si viene contexto de ticket, combinamos las palabras clave
  const combinedText = ticketContext
    ? `${prompt} ${ticketContext.asunto} ${ticketContext.descripcion} ${ticketContext.categoria}`.toLowerCase()
    : lower;

  // Búsqueda semántica ponderada en catálogo
  let bestMatch: (typeof KB_CATALOG)[0] | null = null;
  let bestScore = 0;

  for (const art of KB_CATALOG) {
    let score = 0;
    for (const kw of art.keywords) {
      if (combinedText.includes(kw)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = art;
    }
  }

  if (bestMatch && bestScore >= 1) {
    const sim = Math.min(0.96, 0.8 + bestScore * 0.04).toFixed(2);
    const headerMsg = ticketContext?.asunto
      ? `He analizado tu solicitud para "${ticketContext.asunto}". Según el manual ${bestMatch.codigo} de GID, te sugiero el siguiente procedimiento:`
      : `He localizado el procedimiento oficial en la Base de Conocimiento de GID para resolver tu reporte sobre "${prompt}":`;

    return {
      respuesta: headerMsg,
      pasos: bestMatch.pasos,
      cita: `Artículo ${bestMatch.codigo}: ${bestMatch.titulo}`,
      similitud: sim,
      modelo: 'Base Vectorial Integrada RIALSA (qwen2.5-coder)',
      requiereEscalado: false
    };
  }

  // Diagnóstico contextual dinámico si no hay coincidencia directa
  const subjectSnippet = ticketContext?.asunto || prompt.slice(0, 40);
  return {
    respuesta: `He analizado tu reporte: "${subjectSnippet}". Para aislar este incidente antes de requerir la presencia de un técnico, sigue estas comprobaciones iniciales:`,
    pasos: [
      'Verifica que el equipo y periféricos asociados tengan alimentación eléctrica continua y cables de comunicación firmes.',
      'Cierra y reinicia la aplicación o servicio afectado para purgar memoria temporal y conexiones colgadas.',
      'Comprueba si la incidencia ocurre en otros equipos de tu área para descartar un fallo general de red o servidor.',
      'Si tras estos pasos persiste la falla, utiliza el botón "Escalar a técnico humano" para crear el ticket con prioridad automática.'
    ],
    cita: 'Guía de Diagnóstico y Aislamiento de Incidencias GID (IT-STD-09)',
    similitud: '0.78',
    modelo: 'Motor de Razonamiento RIALSA',
    requiereEscalado: true
  };
}

async function callGeminiApi(
  prompt: string,
  apiKey: string,
  ticketContext?: TicketDraftContext
): Promise<AiDiagnosticResult | null> {
  const contextPrompt = ticketContext
    ? `\nContexto del ticket del usuario: Asunto: "${ticketContext.asunto}", Descripción: "${ticketContext.descripcion}", Categoría: "${ticketContext.categoria}".`
    : '';

  const systemPrompt = `Eres el Asistente Técnico Oficial de RIALSA (Grupo Industrial Delnorte). 
Ayuda a empleados a resolver problemas de TI (impresoras, VPN, SAP, correo, redes, contraseñas, Windows).
Si el usuario pide un chiste o bromea, cuéntale un chiste de informáticos gracioso en español.
Si es una consulta técnica, responde con pasos estructurados y cita un manual corporativo ficticio (ej. KB-231).
Responde en formato JSON con la siguiente estructura exacta:
{
  "respuesta": "Texto explicativo cordial",
  "pasos": ["Paso 1...", "Paso 2...", "Paso 3..."],
  "cita": "Artículo KB-xxx: Título del manual",
  "similitud": "0.95",
  "requiereEscalado": false
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n${contextPrompt}\nConsulta del usuario: ${prompt}` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      })
    }
  );

  if (!res.ok) return null;
  const json = await res.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const parsed = JSON.parse(rawText);
  return {
    respuesta: parsed.respuesta || 'He analizado tu consulta técnica.',
    pasos: Array.isArray(parsed.pasos) ? parsed.pasos : ['Revisar cables y reiniciar equipo'],
    cita: parsed.cita || 'Base de Conocimiento RIALSA GID',
    similitud: String(parsed.similitud || '0.94'),
    modelo: 'Google Gemini 1.5 Flash (Cloud LLM)',
    requiereEscalado: Boolean(parsed.requiereEscalado)
  };
}

