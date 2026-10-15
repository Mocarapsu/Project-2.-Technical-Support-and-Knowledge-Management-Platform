from fastapi import FastAPI
app = FastAPI(title='RIALSA AI RAG Service')
@app.get('/health')
def health():
    return {'status': 'AI_ONLINE', 'contingency': 'OLLAMA_READY'}
