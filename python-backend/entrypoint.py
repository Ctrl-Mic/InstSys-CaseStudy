import uvicorn #type: ignore
from fastapi.middleware.cors import CORSMiddleware #type: ignore
from fastapi import FastAPI, Request, HTTPException#type: ignore
from fastapi.responses import JSONResponse #type: ignore
from utils.run_ai import endpoint_connection

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------Route---------------------- 

ai_analyst = endpoint_connection()

@app.post("/v1/chat/prompt/mode/{mode}")
async def change_mode(mode: str):
    global ai_analyst, settings
    
    valid_modes = ["online", "offline"]
    if mode not in valid_modes:
        raise HTTPException(status_code=400, detail="Invalid Execution mode.")
    print(f"execution mode: {mode}")
    if ai_analyst is None:
        raise HTTPException(status_code=400, detail="AI Analyst not initialized.")
    print(f"{mode}")    

    ai_analyst.execution_mode = mode
    print(f" Execution mode set to: {mode}")
    
@app.post("/v1/chat/prompt/response")
async def ChatPrompt(request: Request):
    global ai_analyst
    print("calling chatprompt")
    if ai_analyst is None:
        raise HTTPException(status_code=400, detail="AI Analyst not configured.")
    
    data = await request.json()
    if not data or 'query' not in data:
        raise HTTPException(status_code=400, detail="Missing query")
    
    user_query, session_id = data['query'], data['session_id']
    final_answer = ai_analyst.web_start_ai_analyst(user_query=user_query, session_id=session_id)
        
    print(f"response: {final_answer}")
    return JSONResponse({"response": final_answer}, status_code=201)

# ----------------------Route----------------------

if __name__ == "__main__":
    
    uvicorn.run("entrypoint:app", port=5001, reload=True)