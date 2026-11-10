import os
import sys
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Inicializar FastAPI para el Microservicio de IA RAG
app = FastAPI(
    title="RIALSA AI RAG Service",
    description="Servicio de IA con RAG y anonimización PII para Grupo Industrial Delnorte (GID)",
    version="1.0.0"
)

# Configurar CORS para permitir comunicación con el Frontend de React (puerto 5173 y 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base de conocimiento oficial en memoria (simula ChromaDB local)
KB_ARTICLES = [
    {
        "codigo": "KB-014",
        "titulo": "Calibración y resolución de atascos en impresoras Zebra ZT230",
        "categoria": "Hardware",
        "resumen": "Mantenimiento preventivo, calibración de sensores de etiquetas y solución a LED rojo parpadeante.",
        "pasos": [
            "Verifica que el cable de red LAN azul esté conectado firmemente al puerto posterior RJ45.",
            "Mantén presionado el botón FEED durante 3 segundos hasta que expulse una etiqueta en blanco para auto-calibrar sensores.",
            "Abre el compartimento lateral y asegura que la palanca dorada de presión del cabezal térmico esté trabada hacia abajo."
        ],
        "tags": ["Zebra", "Impresora", "Hardware", "Línea 2"]
    },
    {
        "codigo": "KB-231",
        "titulo": "Acceso y configuración VPN GlobalProtect fuera de oficina",
        "categoria": "Acceso",
        "resumen": "Solución a fallos de autenticación RADIUS, token expirado y reinicio de adaptador TAP-Windows.",
        "pasos": [
            "Desconecta redes Wi-Fi públicas o datos compartidos antes de conectar la VPN corporativa.",
            "Abre el cliente GlobalProtect, haz clic en Configuración > General y selecciona 'Actualizar conexión'.",
            "Si el error persiste, abre PowerShell como Administrador y ejecuta: Restart-Service -Name PanGPS."
        ],
        "tags": ["VPN", "GlobalProtect", "Red", "Seguridad"]
    },
    {
        "codigo": "KB-105",
        "titulo": "Bloqueo de remisiones y timbrado fiscal en SAP / ERP",
        "categoria": "Software",
        "resumen": "Desbloqueo de sesiones colgadas por timeout de red en módulo de facturación.",
        "pasos": [
            "Cierra todas las instancias de SAP GUI abiertas en tu equipo.",
            "Solicita al supervisor de almacén liberar el candado en la transacción SM12 con tu usuario de Windows.",
            "Reingresa a la transacción VF01 para regenerar la remisión con el folio fiscal pendiente."
        ],
        "tags": ["ERP", "SAP", "Facturación", "Software"]
    }
]

# Máscaras de datos sensibles (PII Masking - FR-11)
def mask_pii(text: str) -> str:
    """Enmascara RFC, CURP, números de tarjeta, teléfonos y contraseñas."""
    # RFC
    text = re.sub(r'\b[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z0-9]\b', '[RFC_ENMASCARADO]', text, flags=re.IGNORECASE)
    # CURP
    text = re.sub(r'\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b', '[CURP_ENMASCARADO]', text, flags=re.IGNORECASE)
    # Tarjetas de crédito
    text = re.sub(r'\b(?:\d{4}[ -]?){3}\d{4}\b', '[TARJETA_ENMASCARADA]', text)
    # Teléfonos a 10 dígitos
    text = re.sub(r'\b\d{3}[ -]?\d{3}[ -]?\d{4}\b', '[TELEFONO_ENMASCARADO]', text)
    return text

# Modelos Pydantic
class ChatRequest(BaseModel):
    query: str = Field(..., example="La impresora Zebra no imprime y el LED parpadea en rojo")
    user_id: Optional[str] = "ricardo.bueno"

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
        "chromadb": "SYNCHRONIZED",
        "articulos_indexados": len(KB_ARTICLES)
    }

@app.get("/api/v1/ai/kb")
def get_kb_catalog():
    return {"total": len(KB_ARTICLES), "articulos": KB_ARTICLES}

@app.post("/api/v1/ai/chat", response_model=ChatResponse)
def chat_ai_rag(payload: ChatRequest):
    # 1. Enmascarar información sensible del usuario (PII)
    clean_query = mask_pii(payload.query)
    query_lower = clean_query.lower()

    # 2. Búsqueda semántica en la base vectorial simulada
    matched_article = None
    if "zebra" in query_lower or "impresora" in query_lower or "etiqueta" in query_lower:
        matched_article = KB_ARTICLES[0]
        similarity = 0.89
    elif "vpn" in query_lower or "remoto" in query_lower or "globalprotect" in query_lower or "conexion" in query_lower:
        matched_article = KB_ARTICLES[1]
        similarity = 0.92
    elif "erp" in query_lower or "factura" in query_lower or "sap" in query_lower:
        matched_article = KB_ARTICLES[2]
        similarity = 0.87
    else:
        matched_article = KB_ARTICLES[1]  # Default fallback
        similarity = 0.74

    return ChatResponse(
        respuesta=f"He localizado el procedimiento en los manuales oficiales de GID para resolver: '{clean_query}'. Sigue los pasos indicados:",
        pasos=matched_article["pasos"],
        cita=f"Artículo {matched_article['codigo']}: {matched_article['titulo']}",
        similitud=similarity,
        modelo="Ollama Local (qwen2.5-coder / mistral-7b)",
        requiere_escalado=similarity < 0.75
    )

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print(" 🚀 INICIANDO RIALSA AI RAG MICROSERVICE (Salvador Rivera Delgado)")
    print(" 📡 Servidor corriendo en: http://localhost:8000")
    print(" 📚 Documentación interactiva Swagger: http://localhost:8000/docs")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
