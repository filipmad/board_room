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
    #"http://localhost:5173",
    "http://192.168.1.119:5173",  # 👈 add this
    #"http://127.0.0.1:5173",      # 👈 add this too, if relevant
    "https://main.d3ok75ez5dlq8f.amplifyapp.com"
]

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["https://main.d3ok75ez5dlq8f.amplifyapp.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    # Check that the lines intersect

    return {"shape": "unknown"}


# Websocket functionality
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("web socket established")
    await websocket.accept()

    
    connected_clients.add(websocket)

    # Send existing canvas state to this client
    for stroke in canvas_state:
        await websocket.send_text(json.dumps(stroke))

    try:
        while True:
            data = await websocket.receive_text()
            # Store new stroke
            stroke = json.loads(data)
            canvas_state.append(stroke)

            # Broadcast to all other clients
            disconnected = set()
            for client in connected_clients:
                if client != websocket:
                    try:
                        await client.send_text(json.dumps(stroke))
                    except Exception as e:
                        # This client is dead
                        print("EXCEPTION: ",e)
                        disconnected.add(client)

            # Clean up dead clients
            for dc in disconnected:
                connected_clients.remove(dc)
    
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
