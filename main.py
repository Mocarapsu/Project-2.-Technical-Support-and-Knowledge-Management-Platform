#!/usr/bin/env python3
"""
RIALSA - Entrypoint Principal del Microservicio de IA (Salvador Rivera Delgado)
Ejecuta el servidor FastAPI con Uvicorn en el puerto 8000 (o 8001 si 8000 está ocupado).
"""

import os
import sys
import socket

current_dir = os.path.dirname(os.path.abspath(__file__))
ai_service_dir = os.path.join(current_dir, "ai-service")
ai_app_dir = os.path.join(ai_service_dir, "app")

for path in [ai_service_dir, ai_app_dir]:
    if os.path.exists(path) and path not in sys.path:
        sys.path.insert(0, path)

def is_port_available(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("0.0.0.0", port))
            return True
        except OSError:
            return False

try:
    import uvicorn
    from app.main import app

    target_port = 8000
    if not is_port_available(target_port):
        print(f"⚠️ El puerto {target_port} está ocupado. Verificando puerto alternativo 8001...")
        if is_port_available(8001):
            target_port = 8001
        else:
            print(f"❌ Los puertos 8000 y 8001 están ocupados.")

    print("\n" + "=" * 65)
    print(" 🤖 SISTEMA RIALSA - SERVICIO DE IA RAG (FASTAPI)")
    print(" 👤 Desarrollador responsable: Salvador Rivera Delgado")
    print(" 📁 Ruta del proyecto:", current_dir)
    print(f" 📡 Servidor escuchando en: http://localhost:{target_port}")
    print(f" 📖 Documentación Swagger UI: http://localhost:{target_port}/docs")
    print(f" 🩺 Endpoint de salud: http://localhost:{target_port}/health")
    print("=" * 65 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=target_port)

except ImportError as e:
    print(f"\n❌ Error al importar dependencias: {e}")
    print("💡 Asegúrate de tener instaladas las librerías necesarias:")
    print("   pip install fastapi uvicorn pydantic chromadb\n")
    sys.exit(1)
