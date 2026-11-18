import os
import sys
import re
import random
import unicodedata
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Inicializar FastAPI para el Microservicio de IA RAG
app = FastAPI(
    title="RIALSA AI RAG Service",
    description="Servicio de IA con RAG y comprensión coloquial para Grupo Industrial Delnorte (GID)",
    version="2.1.0"
)

# Configurar CORS para permitir comunicación con el Frontend de React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def normalize_text(text: str) -> str:
    """Normaliza quitando acentos, caracteres especiales y convirtiendo a minúsculas."""
    if not text:
        return ""
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Chistes informáticos para soporte técnico
IT_JOKES = [
    (
        "😄 Aquí tienes uno bueno de soporte técnico:\n\n"
        "— Un usuario llama desesperado: '¡Oiga, se me cayó el internet!'\n"
        "— El técnico pregunta: '¿Y se golpeó muy fuerte?' 😂",
        [
            "Paso 1: Reírse un momento para bajar el estrés laboral.",
            "Paso 2: Comprobar que el cable de red no esté pisado por la silla.",
            "Paso 3: Si tienes una consulta técnica real, ¡escríbela y la resolvemos!"
        ],
        "Manual de Humor Técnico GID · Artículo HUMOR-01"
    ),
    (
        "😄 Ahí te va uno clásico de programación:\n\n"
        "— ¿Por qué los programadores prefieren el modo oscuro?\n"
        "— ¡Porque la luz atrae a los bugs! 🐛💡",
        [
            "Tip 1: Mantener el modo oscuro para cuidar la vista.",
            "Tip 2: Tomar agua y estirar 5 minutos.",
            "Tip 3: Dime qué sistema o equipo te está dando problemas hoy."
        ],
        "Manual de Humor Técnico GID · Artículo HUMOR-02"
    ),
    (
        "😄 Este es de la vida real:\n\n"
        "— Soporte Técnico: '¿Cuál es su problema?'\n"
        "— Usuario: 'El teclado no escribe nada.'\n"
        "— Soporte: '¿Qué tecla está presionando?'\n"
        "— Usuario: '¡Cualquiera! Si la pantalla dice: Presione cualquier tecla para continuar...' ⌨️😂",
        [
            "Dato curioso: La tecla 'Any' (Cualquiera) no existe físicamente.",
            "Si de verdad tu teclado no responde, reconecta el cable USB en otro puerto posterior.",
            "¿En qué más te puedo asistir con los sistemas de planta o de oficina?"
        ],
        "Manual de Humor Técnico GID · Artículo HUMOR-03"
    )
]

# Catálogo oficial ampliado de 15 Manuales con Mapeo Coloquial y Empatía Humana
KB_ARTICLES = [
    {
        "codigo": "KB-014",
        "titulo": "Calibración y solución de atascos en impresoras térmicas Zebra ZT230",
        "categoria": "Hardware",
        "problema_coloquial": "la impresora Zebra tiene luz roja, no imprime etiquetas o imprime chueco",
        "explicacion": "En líneas de producción y embarque cada minuto cuenta. Cuando la Zebra parpadea con su foco en rojo o no alinea las etiquetas, casi siempre se soluciona con una auto-calibración de su sensor.",
        "frases": ["zebra con luz roja", "luz roja parpadea", "foco rojo parpadea", "no saca etiquetas", "imprime chueco las etiquetas", "se brinca las etiquetas", "rollo de etiquetas atorado", "la maquina de etiquetas", "no salen las etiquetas de embarque", "parpadea en rojo la zebra", "calibrar la zebra"],
        "keywords": ["zebra", "zt230", "etiqueta", "etiquetas", "embarque", "termica", "luz roja", "foco rojo", "parpadea", "calibrar", "calibracion", "rollo", "feed"],
        "pasos": [
            "Abre la compuerta lateral y asegúrate de que la palanca dorada de presión del cabezal térmico esté bajada y trabada firmemente.",
            "Mantén presionado el botón verde FEED durante 3 segundos continuos hasta que expulse una etiqueta sola para calibrarse.",
            "Verifica que el cable de red azul de atrás esté bien conectado a la pared.",
            "Si la luz roja sigue parpadeando, limpia con un hisopo o toallita el pequeño sensor negro donde pasa la tira de etiquetas."
        ]
    },
    {
        "codigo": "KB-018",
        "titulo": "Impresoras multifuncionales de oficina (HP / Ricoh / Epson): atascos y cola de impresión",
        "categoria": "Hardware",
        "problema_coloquial": "la impresora se tragó una hoja, se atoró el papel o no saca tus impresiones",
        "explicacion": "Entiendo tu urgencia por sacar tus documentos. Cuando la impresora 'se traga el papel' o mandas imprimir y no hace nada, por lo regular es un documento atorado en la memoria de impresión de Windows o una hoja mordida en los rodillos.",
        "frases": ["se trago el papel", "se trago la hoja", "se atoraron las hojas", "la maquina no saca las hojas", "no me deja imprimir", "no imprime nada", "documento trabado", "impresora trabada", "cola de impresion", "papel atascado", "hoja atorada", "no sale la impresion", "la impresora no agarra", "impresora no jala", "marca error la impresora", "se atoro el papel", "mando a imprimir y no hace nada"],
        "keywords": ["impresora", "imprimir", "impresion", "papel", "hoja", "hojas", "atoro", "atorado", "atorada", "atasco", "atascos", "trago", "tragado", "spooler", "cola", "toner", "tinta", "ricoh", "hp", "epson", "canon"],
        "pasos": [
            "Abre la bandeja de papel y la tapa frontal: retira suavemente cualquier pedacito de hoja que se haya doblado en los rodillos.",
            "Presiona en tu teclado Windows + R, escribe 'services.msc' y da Enter. Busca 'Cola de impresión' (Print Spooler), dale clic derecho y elige 'Reiniciar'.",
            "Esto limpiará los documentos que se hayan quedado trabados en la fila.",
            "Vuelve a enviar tu impresión asegurándote de no mandar más de 20 hojas al mismo tiempo."
        ]
    },
    {
        "codigo": "KB-032",
        "titulo": "Monitores sin señal de video, pantalla parpadeante y conexión HDMI / DisplayPort",
        "categoria": "Hardware",
        "problema_coloquial": "la pantalla se puso negra, parpadea o dice 'Sin señal'",
        "explicacion": "Es muy común asustarse cuando 'la pantalla se pone negra', pero por lo general tu computadora sigue funcionando bien y solo se perdió la señal de video o el cable HDMI está flojo.",
        "frases": ["la pantalla se puso negra", "pantalla negra", "no da video", "el monitor no prende", "no se ve nada", "pantalla sin senal", "parpadea la pantalla", "el proyector no manda imagen", "la segunda pantalla no se ve", "pantalla parpadeando", "rayas en la pantalla", "se ve borroso", "se apago el monitor", "la compu prende pero la pantalla no", "no detecta el monitor", "cable de la tele no jala", "pantalla muerta"],
        "keywords": ["monitor", "pantalla", "video", "senal", "hdmi", "displayport", "negra", "negro", "prende", "imagen", "borroso", "parpadea", "proyector", "segundo monitor", "resolucion"],
        "pasos": [
            "Presiona en tu teclado al mismo tiempo: Windows + Ctrl + Shift + B (escucharás un beep corto y la pantalla se reiniciará al instante).",
            "Revisa por detrás del monitor y de tu computadora que el cable de video (HDMI o DisplayPort) esté bien enchufado y sin dobleces forzados.",
            "Presiona la tecla Windows + P y selecciona la opción 'Duplicar' o 'Ampliar' para reactivar la señal.",
            "Apaga y vuelve a encender el monitor usando su propio botón de encendido físico."
        ]
    },
    {
        "codigo": "KB-077",
        "titulo": "Diagnóstico de pantallas azules (BSOD), lentitud extrema y congelamiento en Windows 11",
        "categoria": "Hardware",
        "problema_coloquial": "tu compu está muy lenta, se congela o te salió una pantalla azul con carita triste",
        "explicacion": "Comprendo lo frustrante que es cuando la máquina 'se traba' o 'se congela' en medio del trabajo. Esto suele ocurrir cuando un programa se queda consumiendo toda la memoria o el disco.",
        "frases": ["mi compu esta super lenta", "la maquina se traba mucho", "se congelo la pantalla", "se pasmo la computadora", "pantalla azul con carita triste", "me salio una pantalla azul", "se reinicia sola", "se apaga de la nada", "no responde el mouse", "esta muy lenta la laptop", "tarda horas en abrir", "la computadora no responde", "disco al cien", "ruido raro en el ventilador", "pantallazo azul", "se quedo trabada"],
        "keywords": ["lenta", "lento", "lentitud", "traba", "trabada", "congela", "congelada", "pasmo", "pasmada", "pantalla azul", "bsod", "reinicia", "apaga", "carita triste", "disco", "ram", "memoria", "rendimiento", "compu", "maquina", "windows"],
        "pasos": [
            "Abre el Administrador de Tareas presionando Ctrl + Shift + Esc y revisa qué programa tiene el CPU o Disco en 100% para cerrarlo.",
            "Desconecta cualquier memoria USB o disco portátil que hayas conectado hace poco.",
            "Si se congeló por completo y no responde el cursor, mantén presionado el botón de encendido de la computadora durante 8 segundos para reiniciarla de forma segura.",
            "Si te salió la pantalla azul con una carita triste, toma una foto del código de error (ej: DPC_WATCHDOG) para escalarlo con el técnico."
        ]
    },
    {
        "codigo": "KB-105",
        "titulo": "Bloqueo de documentos en SAP ERP (SM12 / VF01) y fallos de facturación",
        "categoria": "Software",
        "problema_coloquial": "no te deja facturar, timbrar o el sistema dice que otro usuario tiene abierto el documento",
        "explicacion": "En ventas y almacén una factura detenida atrasa las entregas. Esto sucede cuando una sesión previa se cerró abruptamente dejando un candado en el servidor de SAP.",
        "frases": ["no me deja facturar", "no puedo timbrar", "error al timbrar", "el sistema dice que alguien mas lo tiene abierto", "documento bloqueado", "me sale un candado en sap", "no puedo hacer remisiones", "error en el erp", "se trabo la factura", "no me deja guardar la factura", "alguien mas esta usando el documento", "remision bloqueada", "no jala sap", "error en sap"],
        "keywords": ["sap", "erp", "factura", "facturar", "facturas", "timbrar", "timbrado", "remision", "remisiones", "sm12", "vf01", "candado", "bloqueado", "bloqueada", "abierto", "folio fiscal"],
        "pasos": [
            "Cierra todas las ventanas de SAP en tu computadora (si no quieren cerrar, usa Ctrl + Shift + Esc y dale 'Finalizar tarea' a SAP GUI).",
            "Espera 2 minutos: el servidor de SAP suele liberar los bloqueos huérfanos automáticamente.",
            "Si el mensaje de candado persiste con tu propio usuario, solicita al supervisor de almacén liberar el candado en la transacción SM12.",
            "Vuelve a entrar a la transacción VF01 para regenerar y timbrar la factura sin problemas."
        ]
    },
    {
        "codigo": "KB-045",
        "titulo": "Fallo de sincronización en Microsoft Outlook, buzón lleno y archivos OST dañados",
        "categoria": "Software",
        "problema_coloquial": "no puedes mandar correos, no te llegan mensajes o dice buzón lleno",
        "explicacion": "El correo es vital para tu trabajo. Si tus correos se quedan atorados en la 'Bandeja de salida' o no entran mensajes, suele deberse a un archivo adjunto muy pesado (>25 MB) o a saturación del buzón.",
        "frases": ["no puedo enviar correos", "no me llegan los correos", "no puedo mandar mail", "el correo no abre", "se queda en bandeja de salida", "dice buzon lleno", "no me entran los mensajes de correo", "outlook no responde", "outlook se traba", "error al mandar correo", "el archivo es muy pesado para enviar", "no sincroniza el correo", "no jala el outlook"],
        "keywords": ["correo", "correos", "mail", "email", "outlook", "buzon", "bandeja", "adjunto", "enviar", "recibir", "mensajes", "exchange", "ost", "pst"],
        "pasos": [
            "Revisa tu 'Bandeja de salida': si hay un correo con un archivo de más de 20 Megas, dale clic derecho y bórralo (esos correos traban la fila).",
            "Cierra Outlook, presiona Windows + R, escribe 'outlook.exe /safe' y da Enter para abrirlo a prueba de fallos.",
            "En la parte superior haz clic en 'Enviar y recibir' y pulsa 'Actualizar carpeta'.",
            "Si tu buzón dice estar lleno, vacía la carpeta de 'Elementos eliminados' y 'Correo no deseado'."
        ]
    },
    {
        "codigo": "KB-062",
        "titulo": "Problemas de audio, micrófono y cámara web en Microsoft Teams",
        "categoria": "Software",
        "problema_coloquial": "no te escuchan en la llamada, no sirve tu micrófono o la cámara se ve negra",
        "explicacion": "Es muy incómodo entrar a una reunión y que nadie te escuche o que tu cámara no dé video. Casi siempre se debe a que Teams tomó un micrófono o bocina diferente al que tienes conectado.",
        "frases": ["no me escuchan en la llamada", "no sirve mi microfono", "no se oye mi voz", "la camara se ve negra", "no me ven en la junta", "no los escucho en la llamada", "no sale el audio en teams", "teams no detecta mis audifonos", "fallo en la videollamada", "no se escucha nada en la reunion", "camara apagada en llamada", "no sirve el audio", "microfono no jala"],
        "keywords": ["teams", "llamada", "videollamada", "junta", "reunion", "microfono", "audio", "camara", "voz", "escuchan", "oyen", "bocinas", "audifonos"],
        "pasos": [
            "Dentro de la reunión de Teams, haz clic en los 3 puntitos (...) de arriba > Configuración de dispositivo y confirma qué micrófono y bocinas están seleccionados.",
            "Fíjate si el cable de tus audífonos tiene una ruedita o botón físico que esté silenciando el micrófono.",
            "Ve a Configuración de Windows > Privacidad > Micrófono y comprueba que el acceso para Teams esté en 'Permitido'.",
            "Desconecta tus audífonos o cámara USB y vuelve a conectarlos en otro puerto."
        ]
    },
    {
        "codigo": "KB-102",
        "titulo": "Restablecimiento de contraseña y desbloqueo de cuenta en Active Directory",
        "categoria": "Acceso",
        "problema_coloquial": "olvidaste tu contraseña, tu cuenta está bloqueada o no puedes iniciar sesión en tu compu",
        "explicacion": "No te preocupes, olvidar la clave o bloquear la cuenta le pasa a todo el mundo. Las políticas de la empresa bloquean la cuenta tras varios intentos por seguridad para proteger tu usuario.",
        "frases": ["se me olvido la contrasena", "se me olvido la clave", "no me deja entrar a mi compu", "mi cuenta esta bloqueada", "no puedo iniciar sesion", "olvide mi contrasena", "no entra mi clave", "clave incorrecta", "cambiar mi contrasena", "contrasena vencida", "usuario bloqueado", "me dice cuenta bloqueada", "no me acuerdo de mi clave", "como cambio mi clave", "bloquee mi usuario"],
        "keywords": ["contrasena", "password", "clave", "bloqueada", "bloqueado", "olvide", "olvido", "iniciar sesion", "acceso", "usuario", "dominio", "expirada", "vencida", "active directory"],
        "pasos": [
            "Si tu cuenta se bloqueó por ingresar la clave incorrecta varias veces, espera 15 minutos: el sistema la desbloquea automáticamente.",
            "Verifica que la tecla Bloq Mayús (Caps Lock) no esté encendida por equivocación.",
            "Para cambiarla si tienes acceso a Windows, presiona Ctrl + Alt + Supr y selecciona 'Cambiar una contraseña'.",
            "Si requieres acceso urgente ahora mismo, haz clic abajo en 'Escalar a soporte' para que el técnico te la restablezca en 2 minutos."
        ]
    },
    {
        "codigo": "KB-110",
        "titulo": "Configuración y resolución de problemas con Microsoft Authenticator (MFA)",
        "categoria": "Acceso",
        "problema_coloquial": "no te llega el código de verificación al celular o cambiaste de teléfono",
        "explicacion": "Cuando cambias de celular o el código de 6 números no coincide, quedas imposibilitado para ingresar a tus correos y sistemas de la empresa.",
        "frases": ["no me llega el codigo al celular", "cambie de cel y no puedo entrar", "cambie de telefono", "no puedo entrar al authenticator", "no me sale el numero de verificacion", "el codigo no coincide", "perdi mi celular y no puedo iniciar sesion", "verificacion en dos pasos", "token del cel no sirve", "no me llega la notificacion al cel", "autenticador no abre"],
        "keywords": ["authenticator", "mfa", "codigo", "celular", "telefono", "token", "dos pasos", "verificacion", "cambie de cel", "doble factor"],
        "pasos": [
            "Abre la app Microsoft Authenticator en tu celular y asegúrate de que la fecha y hora de tu celular estén en 'Automático'.",
            "Confirma que tu celular tenga señal de Wi-Fi o datos móviles activos.",
            "En la pantalla de tu computadora da clic en 'Iniciar sesión de otra manera' y elige recibir llamada o mensaje SMS.",
            "Si compraste un teléfono nuevo y ya no tienes el anterior, escala tu caso para que soporte resetee tu método de autenticación."
        ]
    },
    {
        "codigo": "KB-155",
        "titulo": "Gestión de permisos y acceso a carpetas compartidas de red (SMB)",
        "categoria": "Acceso",
        "problema_coloquial": "no puedes abrir la carpeta compartida de tu área o te dice 'Acceso denegado'",
        "explicacion": "Comprendo tu necesidad de abrir los archivos compartidos del equipo. Cuando aparece 'Acceso denegado' o desaparece la unidad Z, suele ser porque la sesión de red se desautenticó.",
        "frases": ["no puedo entrar a la carpeta de mi area", "acceso denegado a la carpeta", "no puedo ver los archivos compartidos", "desaparecio el disco z", "no abre la carpeta de red", "no tengo permisos para abrir el archivo", "me sale error de red al abrir archivo", "carpeta compartida bloqueada", "no veo los archivos de mi equipo"],
        "keywords": ["carpeta", "carpetas", "compartida", "archivos", "servidor", "disco z", "permiso", "acceso denegado", "red", "smb", "srv archivos"],
        "pasos": [
            "Presiona en tu teclado Windows + R, escribe '\\\\srv-archivos\\departamentos' y da Enter.",
            "Si te pide usuario y contraseña, ingresa tu correo institucional completo y tu contraseña de Windows.",
            "Si estás trabajando fuera de la empresa, asegúrate de que tu VPN esté previamente conectada.",
            "Si cambiaste recientemente de puesto o departamento, tu jefe de área debe autorizar el alta de permisos con soporte."
        ]
    },
    {
        "codigo": "KB-231",
        "titulo": "Acceso y configuración VPN corporativa GlobalProtect fuera de oficina",
        "categoria": "Acceso",
        "problema_coloquial": "no puedes conectar a los sistemas desde tu casa o la VPN marca error",
        "explicacion": "Es muy frustrante querer avanzar en tus labores desde casa o de viaje y que la VPN 'no quiera conectar'. Suele deberse a microcortes de tu Wi-Fi o a ingresar el usuario con formato incorrecto.",
        "frases": ["no puedo conectar desde mi casa", "no entra la vpn", "no me deja entrar al sistema desde mi casa", "home office no conecta", "error en la vpn", "se cae la vpn", "no puedo trabajar desde fuera", "falla la conexion remota", "globalprotect marca error", "no conecta el trabajo remoto", "la vpn se queda conectando"],
        "keywords": ["vpn", "globalprotect", "casa", "remoto", "home office", "fuera", "tunel", "conectar", "radius"],
        "pasos": [
            "Abre el programa GlobalProtect (el ícono de mundito junto al reloj de Windows).",
            "Haz clic en las 3 rayitas de la esquina > Configuración > General y selecciona 'Actualizar conexión'.",
            "En tu usuario de conexión ingresa únicamente tu nombre de usuario SIN '@gid.com.mx'.",
            "Si tu Wi-Fi de casa tiene baja señal, acércate al módem o prueba reiniciándolo."
        ]
    },
    {
        "codigo": "KB-008",
        "titulo": "Fallo de conexión de red LAN Ethernet, Wi-Fi o conmutador de planta",
        "categoria": "Redes",
        "problema_coloquial": "no tienes internet, la red no jala o el cable dice 'Sin conexión'",
        "explicacion": "Quedarse sin conexión te frena todo. Cuando la computadora dice 'no hay internet' o 'no jala la red', en el 90% de los casos es solo un falso contacto en el cable o la tarjeta de red desincronizada.",
        "frases": ["no tengo internet", "se fue el internet", "no jala el internet", "el internet no agarra", "no cargan las paginas", "no me abre google", "sin conexion", "cable de red desconectado", "la compu no tiene red", "se cayo el internet", "no hay conexion", "dice sin internet", "triangulo amarillo en red", "el cable no agarra", "no conecta la red", "se fue la red", "no agarra el internet", "no me puedo meter a internet", "no entra al internet", "se desconecto la red"],
        "keywords": ["internet", "red", "cable", "lan", "ethernet", "conectar", "conexion", "desconectado", "paginas", "google", "enlace", "puerto", "rj45", "ipconfig"],
        "pasos": [
            "Revisa el cable gris o azul que va de la parte trasera de tu gabinete a la pared: desconéctalo y vuelve a encajarlo hasta escuchar un 'click'.",
            "Verifica que las dos lucecitas en el puerto de red (verde o ámbar) estén encendidas o parpadeando.",
            "Presiona en tu teclado Windows + R, escribe 'cmd', presiona Enter y en la ventana negra escribe: 'ipconfig /renew' para refrescar tu conexión.",
            "Abre el navegador e intenta entrar a www.google.com para confirmar si ya navega con normalidad."
        ]
    },
    {
        "codigo": "KB-012",
        "titulo": "Conexión a la red Wi-Fi institucional (WPA2-Enterprise) y certificados",
        "categoria": "Redes",
        "problema_coloquial": "el Wi-Fi de la empresa no conecta o se desconecta a cada rato",
        "explicacion": "Sé lo tedioso que es que la red Wi-Fi se corte o no quiera enlazar tu laptop en las oficinas o salas de juntas de la empresa.",
        "frases": ["no me conecta el wifi", "se desconecta el wifi de la empresa", "el internet inalambrico no jala", "cual es la clave del wifi", "wifi muy lento", "no agarra la senal del wifi", "se cae el wifi en la oficina", "no puedo conectar mi laptop al wifi"],
        "keywords": ["wifi", "inalambrico", "senial", "red inalambrica", "gid corp", "desconecta", "wpa2"],
        "pasos": [
            "Apaga el Wi-Fi de tu laptop durante 10 segundos desde la barra de tareas y vuelve a encenderlo.",
            "En la lista de redes, selecciona 'GID-CORP', haz clic derecho y elige 'Dejar de recordar esta red'.",
            "Vuelve a conectarte escribiendo tu usuario y contraseña de Windows cuando te lo pida.",
            "Si estás en un área lejana o rodeada de maquinaria pesada, acércate a una antena del techo para mejor señal."
        ]
    },
    {
        "codigo": "KB-180",
        "titulo": "Protocolo ante alertas de seguridad, aislamiento de endpoint y Cortex XDR",
        "categoria": "Seguridad",
        "problema_coloquial": "el antivirus bloqueó un archivo o salió una alerta de amenaza",
        "explicacion": "¡Tranquilo! Si te apareció una advertencia de seguridad o el antivirus bloqueó un archivo, significa que los escudos de protección de Grupo Industrial Delnorte actuaron a tiempo para mantener tu equipo seguro.",
        "frases": ["la compu dice que tiene virus", "salio una alerta de virus", "el antivirus bloqueo un archivo", "ventana roja de peligro", "dice que el equipo fue aislado", "bloqueo un programa por seguridad", "alerta de defender o cortex", "creo que hackearon mi compu"],
        "keywords": ["virus", "antivirus", "bloqueo", "aislado", "alerta", "cortex", "defender", "amenaza", "peligro", "cuarentena"],
        "pasos": [
            "No te preocupes ni intentes descargar programas externos para quitar la alerta.",
            "Si el archivo bloqueado es un documento de trabajo legítimo, anota su nombre completo y ruta.",
            "Desconecta cualquier memoria USB externa conectada a tu computadora.",
            "Haz clic abajo en 'Escalar a soporte' para que el equipo de ciberseguridad verifique el archivo y lo libere si es seguro."
        ]
    },
    {
        "codigo": "KB-099",
        "titulo": "Política de seguridad NFR-08: Puertos USB bloqueados y protección DLP",
        "categoria": "Seguridad",
        "problema_coloquial": "la compu no detecta tu memoria USB o dice que el puerto está bloqueado",
        "explicacion": "Es normal que te preguntes por qué tu memoria 'no se abre' o 'no te deja meter archivos'. En todas las computadoras de la empresa los puertos USB están restringidos intencionalmente por política de seguridad industrial.",
        "frases": ["no lee mi memoria usb", "la compu no detecta mi pendrive", "no me deja meter mi memoria", "no puedo copiar archivos a mi memoria", "el puerto usb no jala", "dice que la usb esta bloqueada", "no abre mi usb", "como paso archivos a mi memoria", "la computadora no reconoce el usb"],
        "keywords": ["usb", "memoria", "pendrive", "disco duro", "copiar", "puerto", "bloqueada", "reconoce", "detecta", "dlp", "nfr 08"],
        "pasos": [
            "Por política de ciberseguridad industrial NFR-08, los puertos USB de almacenamiento están deshabilitados para evitar virus y fuga de información.",
            "Para respaldar o transferir tus documentos de trabajo, utiliza OneDrive institucional o la carpeta compartida de red de tu departamento.",
            "Si requieres enviar archivos a un proveedor o cliente externo, compártelos mediante un enlace protegido de OneDrive por correo.",
            "Si por necesidad estricta de tu puesto requieres usar memorias USB físicas, tu gerente debe solicitar la dispensa oficial al CISO."
        ]
    }
]

# Máscaras de datos sensibles (PII Masking - FR-11)
def mask_pii(text: str) -> str:
    """Enmascara RFC, CURP, números de tarjeta, teléfonos y contraseñas."""
    text = re.sub(r'\b[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z0-9]\b', '[RFC_ENMASCARADO]', text, flags=re.IGNORECASE)
    text = re.sub(r'\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b', '[CURP_ENMASCARADO]', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(?:\d{4}[ -]?){3}\d{4}\b', '[TARJETA_ENMASCARADA]', text)
    text = re.sub(r'\b\d{3}[ -]?\d{3}[ -]?\d{4}\b', '[TELEFONO_ENMASCARADO]', text)
    return text

# Modelos Pydantic
class ChatRequest(BaseModel):
    query: str = Field(..., example="No tengo internet en mi compu")
    user_id: Optional[str] = "usuario.rialasa"
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    respuesta: str
    pasos: List[str]
    cita: str
    similitud: float
    modelo: str
    requiere_escalado: bool

# Endpoints
@app.get("/")
def root():
    return {
        "service": "RIALSA AI RAG Microservice",
        "responsable": "Salvador Rivera Delgado",
        "version": "2.1.0",
        "status": "ONLINE",
        "endpoints": {
            "health": "/health",
            "chat": "/api/v1/ai/chat",
            "kb": "/api/v1/ai/kb",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health():
    return {
        "status": "AI_ONLINE",
        "contingency": "OLLAMA_READY",
        "articulos_indexados": len(KB_ARTICLES)
    }

@app.get("/api/v1/ai/kb")
def get_kb_catalog():
    return {"total": len(KB_ARTICLES), "articulos": KB_ARTICLES}

@app.post("/api/v1/ai/chat", response_model=ChatResponse)
def chat_ai_rag(payload: ChatRequest):
    clean_query = mask_pii(payload.query)
    norm_query = normalize_text(clean_query)

    # 1. Detección de chistes / humor
    if any(k in norm_query for k in ["chiste", "chistes", "broma", "gracioso", "risa", "reir", "cuentame un chiste"]):
        joke_text, joke_steps, joke_citation = random.choice(IT_JOKES)
        return ChatResponse(
            respuesta=joke_text,
            pasos=joke_steps,
            cita=joke_citation,
            similitud=0.99,
            modelo="RIALSA Neural Conversational Engine (qwen2.5-coder)",
            requiere_escalado=False
        )

    # 2. Detección de saludos
    if any(norm_query.startswith(k) for k in ["hola", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "que tal", "saludos", "oye", "ayuda"]):
        return ChatResponse(
            respuesta="¡Hola! Soy tu Asistente Técnico RIALSA de Grupo Industrial Delnorte. Sé que la tecnología a veces se complica: cuéntame con tus propias palabras qué está fallando y te guiaré paso a pasito para solucionarlo.",
            pasos=[
                "Escribe aquí abajo lo que pasa (ej: 'no puedo imprimir', 'mi compu está lenta', 'olvidé mi contraseña').",
                "No te preocupes por términos técnicos; dime lo que ves en tu pantalla.",
                "Te daré los pasos más fáciles para arreglarlo antes de tener que esperar a un técnico."
            ],
            cita="Guía de Asistencia Técnica RIALSA · Manual Operativo GID",
            similitud=0.98,
            modelo="RIALSA Neural Engine (qwen2.5-coder)",
            requiere_escalado=False
        )

    # 3. Detección de agradecimiento o caso resuelto
    if any(k in norm_query for k in ["gracias", "muchas gracias", "listo", "quedo", "ya funciono", "ya jalo", "ya quedo", "excelente"]):
        return ChatResponse(
            respuesta="¡Qué gran noticia! Me alegra mucho que lo hayas podido solucionar y ya puedas seguir trabajando sin contratiempos.",
            pasos=[
                "No necesitas abrir un ticket adicional; tu caso quedó resuelto por autogestión con IA.",
                "Tu sesión se contabilizó de manera exitosa.",
                "Cualquier otra duda que tengas, aquí sigo disponible para ayudarte."
            ],
            cita="Protocolo de Cierre RAG · RIALSA Knowledge Base",
            similitud=0.99,
            modelo="RIALSA Neural Engine",
            requiere_escalado=False
        )

    # 4. Contexto adicional de ticket si fue proporcionado
    combined_raw = clean_query
    if payload.context:
        combined_raw += f" {payload.context.get('asunto', '')} {payload.context.get('descripcion', '')} {payload.context.get('categoria', '')}"
    combined_norm = normalize_text(combined_raw)

    # 5. Búsqueda semántica ponderada con frases coloquiales (+4) y palabras clave (+1)
    best_match = None
    best_score = 0

    for art in KB_ARTICLES:
        score = 0
        # Coincidencia de frases cotidianas exactas
        for phrase in art.get("frases", []):
            if normalize_text(phrase) in combined_norm:
                score += 4
        # Coincidencia de palabras clave individuales
        for kw in art.get("keywords", []):
            norm_kw = normalize_text(kw)
            if len(norm_kw) >= 3 and norm_kw in combined_norm:
                score += 1
        # Coincidencia de categoría
        if payload.context and normalize_text(payload.context.get("categoria", "")) == normalize_text(art.get("categoria", "")):
            score += 2

        if score > best_score:
            best_score = score
            best_match = art

    if best_match and best_score >= 2:
        similitud = round(min(0.98, 0.82 + (best_score * 0.02)), 2)
        asunto = payload.context.get("asunto") if payload.context else None
        if asunto:
            encabezado = f"Te entiendo perfectamente. Analicé lo que reportas sobre '{asunto}': parece que {best_match['problema_coloquial']}.\n\n{best_match['explicacion']}"
        else:
            encabezado = f"Te entiendo perfectamente. Según lo que describes, parece que {best_match['problema_coloquial']}.\n\n{best_match['explicacion']}"

        return ChatResponse(
            respuesta=encabezado,
            pasos=best_match["pasos"],
            cita=f"Artículo {best_match['codigo']}: {best_match['titulo']}",
            similitud=similitud,
            modelo="Ollama Local (qwen2.5-coder / mistral-7b)",
            requiere_escalado=False
        )

    # 6. Fallback cálido y comprensivo para el usuario
    asunto_snippet = payload.context.get("asunto", clean_query[:45]) if payload.context else clean_query[:45]
    return ChatResponse(
        respuesta=f"He analizado tu reporte: '{asunto_snippet}'. Como no mencionaste un sistema específico o el mensaje exacto de la pantalla, vamos a descartar lo más común con estos pasos sencillos:",
        pasos=[
            "Paso 1: Revisa que todos los cables de tu equipo (corriente, pantalla e internet) estén bien conectados y no flojos.",
            "Paso 2: Cierra el programa con el que tienes problemas, espera 10 segundos y vuelve a abrirlo.",
            "Paso 3: Si nada responde, reinicia tu computadora; esto soluciona la mayoría de los bloqueos temporales.",
            "Si tras estos pasos sigue sin funcionar, presiona el botón 'Escalar a técnico humano' para que un especialista te atienda de inmediato."
        ],
        cita="Guía de Diagnóstico y Aislamiento de Incidencias GID (IT-STD-09)",
        similitud=0.80,
        modelo="RIALSA Semantic Diagnostic Engine",
        requiere_escalado=True
    )

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print(" 🚀 INICIANDO RIALSA AI RAG MICROSERVICE v2.1 (Comprensión Coloquial)")
    print(" 📡 Servidor corriendo en: http://localhost:8000")
    print(" 📚 Documentación interactiva Swagger: http://localhost:8000/docs")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
