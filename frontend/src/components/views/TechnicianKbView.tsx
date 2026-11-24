import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Search, Eye, X, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { KbArticle } from '../../types/figma-tickets';

export const KB_ARTICLES: KbArticle[] = [
  // 1. HARDWARE
  {
    id: 'kb-1',
    codigo: 'KB-014',
    titulo: 'Calibración y solución de atascos en impresoras térmicas Zebra ZT230',
    categoria: 'Hardware',
    resumen: 'Procedimiento operativo estándar para calibrar sensores térmicos, resolver LED rojo parpadeante y bloqueo de cabezal en líneas de embarque.',
    vistas: 168,
    actualizado: 'Hace 2 días',
    tags: ['Zebra', 'Embarque', 'Hardware', 'Térmica'],
    pasos: [
      'Verificar que el cable de red LAN azul esté conectado firmemente al puerto posterior RJ45.',
      'Mantener presionado el botón FEED durante 3 segundos hasta que expulse una etiqueta en blanco para auto-calibrar sensores.',
      'Abrir el compartimento lateral y asegurar que la palanca dorada de presión del cabezal térmico esté trabada hacia abajo.',
      'Si el LED rojo parpadea, limpiar el sensor óptico de medios y el rodillo con un hisopo impregnado de alcohol isopropílico.'
    ]
  },
  {
    id: 'kb-2',
    codigo: 'KB-018',
    titulo: 'Impresoras multifuncionales de oficina (HP / Ricoh / Epson): atascos y cola de impresión',
    categoria: 'Hardware',
    resumen: 'Solución a documentos retenidos en cola, reinicio del servicio Print Spooler de Windows y despeje de rodillos.',
    vistas: 215,
    actualizado: 'Hace 3 días',
    tags: ['Impresora', 'HP', 'Spooler', 'Atasco'],
    pasos: [
      'Presionar Win + R, escribir "services.msc" y localizar el servicio "Cola de impresión" (Print Spooler).',
      'Hacer clic derecho y seleccionar "Reiniciar" para liberar archivos temporales en cola.',
      'Abrir la cubierta frontal y bandeja 2 para extraer cualquier fragmento de papel atascado en los rodillos de arrastre.',
      'Enviar una página de diagnóstico desde las propiedades de impresora para validar el puerto TCP/IP 9100.'
    ]
  },
  {
    id: 'kb-3',
    codigo: 'KB-032',
    titulo: 'Monitores sin señal de video, pantalla parpadeante y conexión HDMI / DisplayPort',
    categoria: 'Hardware',
    resumen: 'Diagnóstico rápido para pantallas secundarias que parpadean en negro o pierden sincronización tras conectar proyectores.',
    vistas: 184,
    actualizado: 'Hace 5 días',
    tags: ['Monitor', 'HDMI', 'Video', 'DisplayPort'],
    pasos: [
      'Presionar la combinación de teclas "Win + Ctrl + Shift + B" para reiniciar el controlador de gráficos de Windows en caliente.',
      'Revisar que el cable HDMI o DisplayPort no tenga curvaturas forzadas y esté conectado al puerto principal de la GPU.',
      'Pulsar "Win + P" y seleccionar "Duplicar" o "Ampliar" según el escenario de trabajo.',
      'Acceder a Configuración > Sistema > Pantalla > Pantalla avanzada y fijar la frecuencia de actualización exactamente a 60 Hz.'
    ]
  },
  {
    id: 'kb-4',
    codigo: 'KB-077',
    titulo: 'Diagnóstico de pantallas azules (BSOD), lentitud extrema y congelamiento en Windows 11',
    categoria: 'Hardware',
    resumen: 'Protocolo de aislamiento para fallos de memoria RAM, disco saturado al 100% y reparación de archivos del sistema con SFC.',
    vistas: 340,
    actualizado: 'Hace 1 semana',
    tags: ['Windows', 'BSOD', 'Rendimiento', 'RAM'],
    pasos: [
      'Abrir el Administrador de Tareas (Ctrl + Shift + Esc) y verificar qué proceso mantiene el disco o CPU en 100%.',
      'Desconectar dispositivos externos USB, discos duros portátiles o adaptadores añadidos recientemente.',
      'Ejecutar Símbolo del sistema como Administrador e ingresar el comando: "sfc /scannow" para reparar corrupción del sistema.',
      'Si se produce pantalla azul recurrente, documentar el código de paro (ej. MEMORY_MANAGEMENT o DPC_WATCHDOG) para escalado.'
    ]
  },
  {
    id: 'kb-5',
    codigo: 'KB-089',
    titulo: 'Mantenimiento y re-emparejamiento de lectores de código de barras industriales',
    categoria: 'Hardware',
    resumen: 'Configuración de cunas inalámbricas Bluetooth y escaneo de códigos de reinicio de fábrica para lectores en almacén.',
    vistas: 122,
    actualizado: 'Hace 4 días',
    tags: ['Almacén', 'Escáner', 'Barcode', 'Honeywell'],
    pasos: [
      'Colocar el escáner sobre la base o cuna durante 10 segundos hasta escuchar el tono doble de sincronización.',
      'Escanear el código de barras maestro "Reset to Factory Defaults" ubicado en la etiqueta posterior de la base.',
      'Comprobar la configuración de emulación de teclado USB conectando el receptor a un puerto posterior USB 3.0.',
      'Realizar un escaneo de prueba en un documento de Bloc de notas para certificar la inserción automática del retorno de carro (CR/LF).'
    ]
  },

  // 2. SOFTWARE & ERP
  {
    id: 'kb-6',
    codigo: 'KB-105',
    titulo: 'Bloqueo de remisiones, facturación y liberación de sesiones en SAP ERP (SM12 / VF01)',
    categoria: 'Software',
    resumen: 'Procedimiento para desbloquear transacciones colgadas por desconexión de red en el módulo SD de facturación y remisiones.',
    vistas: 410,
    actualizado: 'Ayer',
    tags: ['SAP', 'ERP', 'Facturación', 'SM12'],
    pasos: [
      'Cerrar todas las ventanas activas de SAP GUI desde la barra de tareas de Windows.',
      'Contactar al supervisor de turno o mesa de ayuda para ingresar a la transacción SM12 con tu usuario de red.',
      'Seleccionar los candados de bloqueo asociados a tu número de usuario y pulsar "Eliminar bloqueo".',
      'Ingresar nuevamente a la transacción VF01 o VL02N para completar la remisión o timbrado fiscal pendiente.'
    ]
  },
  {
    id: 'kb-7',
    codigo: 'KB-045',
    titulo: 'Sincronización, buzón lleno y reparación de archivos PST/OST en Microsoft Outlook / 365',
    categoria: 'Software',
    resumen: 'Recuperación de correos atrapados en Bandeja de salida, compactación de base de datos y apertura en modo seguro.',
    vistas: 295,
    actualizado: 'Hace 3 días',
    tags: ['Outlook', 'Correo', 'Office365', 'Exchange'],
    pasos: [
      'Presionar Win + R, escribir "outlook.exe /safe" y presionar Enter para iniciar Outlook sin complementos defectuosos.',
      'Revisar el tamaño del buzón en Archivo > Herramientas > Limpieza de buzón (el límite empresarial es de 50 GB).',
      'Si un correo pesado está atorado en Bandeja de salida, activar el Modo Avión en Windows y eliminar el mensaje con adjunto.',
      'En la pestaña "Enviar y recibir", pulsar "Actualizar carpeta" para forzar sincronización con el servidor Exchange.'
    ]
  },
  {
    id: 'kb-8',
    codigo: 'KB-052',
    titulo: 'Instalación autorizada y licenciamiento de software de ingeniería (AutoCAD / SolidWorks)',
    categoria: 'Software',
    resumen: 'Validación de licencias de red corporativas en el servidor FlexLM y configuración de variables de entorno de sistema.',
    vistas: 175,
    actualizado: 'Hace 1 semana',
    tags: ['AutoCAD', 'SolidWorks', 'Licencias', 'Ingeniería'],
    pasos: [
      'Comprobar que el equipo esté conectado a la red local GID-Corp mediante cable Ethernet o VPN activa.',
      'Verificar que la variable de entorno del sistema "ADSKFLEX_LICENSE_FILE" apunte al servidor "@licencias-gid.delnorte.com.mx".',
      'Abrir la consola de comando y ejecutar "ping licencias-gid" para asegurar respuesta en el puerto TCP 2080 y 27000.',
      'Si la licencia marca "Network license not available", reiniciar el servicio de Autodesk Desktop Licensing en services.msc.'
    ]
  },
  {
    id: 'kb-9',
    codigo: 'KB-064',
    titulo: 'Configuración de audio, micrófono y cámara en Microsoft Teams para salas de juntas',
    categoria: 'Software',
    resumen: 'Solución a problemas de micrófono silenciado, selección de altavoces de sala y permisos de cámara en Windows 11.',
    vistas: 198,
    actualizado: 'Hace 4 días',
    tags: ['Teams', 'Audio', 'Micrófono', 'Videollamadas'],
    pasos: [
      'Dentro de Teams, hacer clic en Configuración > Dispositivos y confirmar que el dispositivo de audio seleccionado sea la barra de sala.',
      'Ir a Configuración de Windows > Privacidad y seguridad > Micrófono y verificar que el interruptor de Microsoft Teams esté activado.',
      'Hacer una llamada de prueba desde Teams pulsando "Realizar una llamada de prueba" para verificar entrada y salida.',
      'Desconectar y reconectar el cable USB de la consola central de la sala de conferencias para refrescar controladores de audio.'
    ]
  },

  // 3. ACCESO & CUENTAS
  {
    id: 'kb-10',
    codigo: 'KB-102',
    titulo: 'Restablecimiento de contraseña y desbloqueo de cuentas en Dominio Active Directory GID',
    categoria: 'Acceso',
    resumen: 'Guía rápida para la mesa de ayuda para desbloqueo de usuarios con bloqueo por intentos fallidos en terminales de planta.',
    vistas: 480,
    actualizado: 'Ayer',
    tags: ['Active Directory', 'Cuentas', 'Contraseñas', 'Seguridad'],
    pasos: [
      'Esperar 15 minutos: la directiva de seguridad corporativa desbloquea automáticamente cuentas tras 3 intentos fallidos.',
      'Para desbloqueo inmediato, el analista de soporte debe abrir la consola RSAT > Usuarios de Active Directory y desmarcar "Account is locked out".',
      'Para actualizar la clave en el equipo, presionar Ctrl + Alt + Supr y seleccionar "Cambiar una contraseña".',
      'Requisitos obligatorios: mínimo 10 caracteres, una mayúscula, un número y un símbolo especial (@, $, #, !).'
    ]
  },
  {
    id: 'kb-11',
    codigo: 'KB-231',
    titulo: 'Acceso VPN corporativo y errores de credenciales en GlobalProtect v2',
    categoria: 'Acceso',
    resumen: 'Pasos de diagnóstico para resolver fallos de validación RADIUS/Active Directory en laptops de usuarios fuera de oficina.',
    vistas: 520,
    actualizado: 'Hoy',
    tags: ['VPN', 'GlobalProtect', 'RADIUS', 'Remoto'],
    pasos: [
      'Desconectar cualquier red Wi-Fi pública o abierta antes de establecer la conexión VPN.',
      'Abrir el cliente GlobalProtect, hacer clic en Configuración > General y pulsar "Actualizar conexión".',
      'Ingresar el nombre de usuario sin el sufijo de dominio (ej. "carlos.mendez" en lugar de "carlos.mendez@gid.com.mx").',
      'Si el túnel no levanta, abrir PowerShell como Administrador y ejecutar: "Restart-Service -Name PanGPS".'
    ]
  },
  {
    id: 'kb-12',
    codigo: 'KB-110',
    titulo: 'Configuración y enrolamiento de autenticación multifactor (MFA / Microsoft Authenticator)',
    categoria: 'Acceso',
    resumen: 'Registro de nuevo teléfono para notificaciones push de inicio de sesión seguro y códigos de verificación temporales.',
    vistas: 230,
    actualizado: 'Hace 6 días',
    tags: ['MFA', 'Seguridad', 'Authenticator', 'Móvil'],
    pasos: [
      'Ingresar desde una computadora corporativa a https://aka.ms/mfasetup con tu correo y contraseña institucional.',
      'Descargar e instalar la app "Microsoft Authenticator" en tu teléfono móvil desde Google Play Store o Apple App Store.',
      'En la app del teléfono, seleccionar "Agregar cuenta de trabajo o escuela" y escanear el código QR mostrado en pantalla.',
      'Ingresar el código de 6 dígitos de prueba para certificar el método principal de verificación en dos pasos.'
    ]
  },

  // 4. REDES & TELECOMUNICACIONES
  {
    id: 'kb-13',
    codigo: 'KB-008',
    titulo: 'Diagnóstico de tormentas de broadcast y reboot de puertos en switch de planta',
    categoria: 'Redes',
    resumen: 'Instrucciones para operadores de soporte al identificar caídas de enlace Ethernet en quioscos y líneas de ensamble.',
    vistas: 145,
    actualizado: 'Hace 3 días',
    tags: ['Cisco', 'Switches', 'LAN', 'Planta 2'],
    pasos: [
      'Identificar el switch de distribución correspondiente en el rack de comunicaciones del área afectada.',
      'Observar los LEDs frontales: parpadeo ámbar sincronizado y continuo indica tormenta de broadcast o bucle de red.',
      'Desconectar los cables de parcheo conectados a quioscos secundarios uno por uno para aislar el bucle físico.',
      'Si el puerto fue deshabilitado por seguridad (err-disabled), ingresar a la CLI del switch y ejecutar "shutdown" seguido de "no shutdown".'
    ]
  },
  {
    id: 'kb-14',
    codigo: 'KB-025',
    titulo: 'Conexión segura a la red Wi-Fi industrial GID-Corp y resolución de IP 169.254 (APIPA)',
    categoria: 'Redes',
    resumen: 'Protocolo para resolver problemas de conexión inalámbrica cuando el adaptador no recibe dirección válida del servidor DHCP.',
    vistas: 310,
    actualizado: 'Hace 2 días',
    tags: ['Wi-Fi', 'DHCP', 'IP', 'Conectividad'],
    pasos: [
      'Olvidar la red "GID-Corp" desde Configuración de red de Windows y volver a conectar seleccionando autenticación WPA2-Enterprise.',
      'Abrir CMD y ejecutar "ipconfig": si la dirección IPv4 comienza con 169.254.x.x, significa que el servidor DHCP de planta no respondió.',
      'Ejecutar en la consola: "ipconfig /release" y posteriormente "ipconfig /renew".',
      'Verificar que se haya asignado una dirección dentro del segmento corporativo 192.168.10.x con puerta de enlace 192.168.10.1.'
    ]
  },

  // 5. SEGURIDAD & POLÍTICAS
  {
    id: 'kb-15',
    codigo: 'KB-099',
    titulo: 'Política de seguridad NFR-08: Bloqueo de puertos USB y excepciones autorizadas DLP',
    categoria: 'Seguridad',
    resumen: 'Explicación del bloqueo institucional de memorias USB en equipos de planta y trámite de permisos ante la dirección CISO.',
    vistas: 388,
    actualizado: 'Hace 1 semana',
    tags: ['Seguridad', 'USB', 'DLP', 'CISO'],
    pasos: [
      'Por directiva corporativa de ciberseguridad industrial NFR-08, los puertos USB de almacenamiento masivo están deshabilitados contra fuga de datos.',
      'Para transferir archivos de ingeniería o planta, utilizar exclusivamente la carpeta de red compartida "\\\\srv-archivos\\departamento".',
      'Si se requiere autorización temporal para mantenimiento de maquinaria, solicitar el formato F-SEC-04 con la firma del gerente de planta.',
      'El equipo CISO habilitará el número de serie de la memoria USB autorizada en la consola central de DLP por un periodo máximo de 48 horas.'
    ]
  }
];

export const TechnicianKbView: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activeArticle, setActiveArticle] = useState<KbArticle | null>(null);

  // Soporte para cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeArticle) {
        setActiveArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeArticle]);

  const categories = ['Todas', 'Hardware', 'Software', 'Acceso', 'Redes', 'Seguridad'];

  const filtered = KB_ARTICLES.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.titulo.toLowerCase().includes(term) ||
      a.codigo.toLowerCase().includes(term) ||
      a.resumen.toLowerCase().includes(term) ||
      a.tags.some((t) => t.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'Todas' || a.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200  space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Base de Conocimiento Técnica
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manuales técnicos oficiales, procedimientos de contingencia y guías autorizadas de Grupo Industrial Delnorte ({KB_ARTICLES.length} manuales indexados).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200/60 flex items-center gap-1.5 ">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Índice RAG Sincronizado ({KB_ARTICLES.length} artículos)</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const count = cat === 'Todas' ? KB_ARTICLES.length : KB_ARTICLES.filter((a) => a.categoria === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white '
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === cat ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, título, síntoma o tag..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArticle(art)}
            className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                  {art.codigo}
                </span>
                <span className="text-xs text-slate-600 font-semibold uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                  {art.categoria}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                {art.titulo}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {art.resumen}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-1">
                {art.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-white text-slate-600 text-xs font-medium px-1.5 py-0.2 rounded border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Eye className="w-3 h-3" />
                <span>{art.vistas}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center text-slate-500 text-xs italic bg-slate-50 rounded-lg border border-slate-200">
          No se encontraron manuales técnicos que coincidan con "{searchTerm}" en la categoría "{selectedCategory}".
        </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          onClick={() => setActiveArticle(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200 cursor-default max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 font-mono bg-blue-50 px-2.5 py-1 rounded border border-blue-200/60">
                  {activeArticle.codigo} · {activeArticle.categoria}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2.5 leading-snug">
                  {activeArticle.titulo}
                </h2>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Actualizado: {activeArticle.actualizado}</span>
                  <span>·</span>
                  <span>{activeArticle.vistas} consultas registradas</span>
                </div>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <strong className="block text-slate-900 mb-1 font-bold text-xs uppercase tracking-wider">
                  Resumen Operativo del Manual:
                </strong>
                <p className="text-slate-600">{activeArticle.resumen}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Procedimiento Técnico Autorizado Paso a Paso:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-700 bg-white p-4 rounded-lg border border-slate-200">
                  {(activeArticle.pasos || [
                    'Verificar los registros de eventos de Windows y comprobar la conectividad en el puerto TCP correspondiente.',
                    'Comprobar si el usuario cuenta con el certificado de equipo vigente emitido por la CA interna de GID.',
                    'Si el problema persiste, restablecer la configuración de red y reiniciar el adaptador correspondiente.'
                  ]).map((paso, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      <span className="font-medium text-slate-800">{paso}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-3.5 bg-amber-50 text-amber-900 rounded-lg border border-amber-200/80 text-xs space-y-1">
                <strong>Nota de seguridad NFR-08:</strong> Este documento contiene especificaciones técnicas internas de Grupo Industrial Delnorte (GID). Queda prohibida su reproducción o divulgación fuera de la red corporativa.
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {activeArticle.tags.map((t) => (
                  <span key={t} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                    #{t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-black transition cursor-pointer"
              >
                Cerrar manual
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
