# server.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import json

from pydantic import BaseModel
from typing import List

# Start Websocket API
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://192.168.1.119:5173",  # 👈 add this
    "http://127.0.0.1:5173",      # 👈 add this too, if relevant
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # allow this origin to access backend
    allow_credentials=True,
    allow_methods=["*"],     # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],     # allow all headers
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def get():
    return FileResponse("static/index.html")

connected_clients = set()
canvas_state = []  # stores all strokes


# REMOVE THIS LATER IN A DIFFERENT FILE
class Point(BaseModel):
    x: float
    y: float

class Stroke(BaseModel):
    points: List[Point]

# AI Drawing Analysis
@app.post("/analyze")
async def analyze_stroke(stroke: Stroke):
    points = stroke.points

    # Simple heuristic: if start and end close, and enough points, it's a circle
    start, end = points[0], points[-1]
    dist = ((start.x - end.x)**2 + (start.y - end.y)**2)**0.5
    if dist < 20 and len(points) > 30:
        return {"shape": "circle"}

    # Add your table detection or more here...

    return {"shape": "unknown"}



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("web socket established")
    await websocket.accept()
    connected_clients.add(websocket)

    # Step 1: Send existing canvas state to this client
    for stroke in canvas_state:
        await websocket.send_text(json.dumps(stroke))

    try:
        while True:
            data = await websocket.receive_text()
            # Step 2: Store new stroke
            stroke = json.loads(data)
            canvas_state.append(stroke)

            # 🧠 Step 3: Broadcast to all other clients
            for client in connected_clients:
                if client != websocket:
                    await client.send_text(json.dumps(stroke))
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
