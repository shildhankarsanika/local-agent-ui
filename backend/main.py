import os
import json
import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Enable CORS so your Next.js app (running on a different port) can talk to it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE_DIR = os.path.abspath("./workspace")
if not os.path.exists(WORKSPACE_DIR):
    os.makedirs(WORKSPACE_DIR)

def safe_path(relative_path: str) -> str:
    target = os.path.abspath(os.path.join(WORKSPACE_DIR, relative_path))
    if not target.startswith(WORKSPACE_DIR):
        raise PermissionError("Access Denied.")
    return target

def list_directory_files():
    try:
        return json.dumps({"files": os.listdir(WORKSPACE_DIR)})
    except Exception as e:
        return json.dumps({"error": str(e)})

def read_workspace_file(path: str):
    try:
        with open(safe_path(path), "r", encoding="utf-8") as f:
            return json.dumps({"content": f.read()})
    except Exception as e:
        return json.dumps({"error": str(e)})

def write_workspace_file(path: str, content: str):
    try:
        with open(safe_path(path), "w", encoding="utf-8") as f:
            f.write(content)
        return json.dumps({"status": "success", "message": f"Successfully wrote to {path}"})
    except Exception as e:
        return json.dumps({"error": str(e)})

TOOL_MAP = {
    "list_directory_files": list_directory_files,
    "read_workspace_file": read_workspace_file,
    "write_workspace_file": write_workspace_file
}

class ChatPayload(BaseModel):
    messages: List[dict]

@app.post("/api/agent")
async def run_agent(payload: ChatPayload):
    local_client = ollama.Client(host='http://127.0.0.1:11434', timeout=60.0)
    model_name = "llama3.1"
    
    current_messages = payload.messages.copy()

    user_prompt = next((m["content"] for m in reversed(current_messages) if m["role"] == "user"), "Unknown Prompt")
    print(f"\n🚀 [Backend] Agent triggered with prompt: '{user_prompt}'")
    print("🧠 Thinking...")
    
    # Run the ReAct execution loop until the model stops calling tools
    while True:
        try:
            response = local_client.chat(
                model=model_name,
                messages=current_messages,
                tools=[list_directory_files, read_workspace_file, write_workspace_file]
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")
        
        # Append assistant's thoughts/tool requests
        current_messages.append(response.message)
        
        if response.message.tool_calls:
            for call in response.message.tool_calls:
                func_name = call.function.name
                func_args = call.function.arguments
                
                tool_func = TOOL_MAP.get(func_name)
                execution_result = tool_func(**func_args) if tool_func else json.dumps({"error": "Not found"})
                
                current_messages.append({
                    "role": "tool",
                    "content": execution_result,
                    "name": func_name
                })
            continue
        else:
            # Loop ends when assistant delivers its final verbal text output
            return {"messages": current_messages, "final_reply": response.message.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)