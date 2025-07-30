import React, { useRef, useEffect } from "react";

// Get ToolBar Components
import ToolBarPanel from "./toolbar_panel";

interface WhiteboardProps {
  currentColour: string;
}


const WS_HOST = "192.168.1.119:8000";
//const WS_HOST = "localhost:8000";

const Whiteboard: React.FC<WhiteboardProps> = ({ currentColour }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const colourRef = useRef(currentColour);
  const socket = useRef<WebSocket | null>(null);

  // TEMP
  const currentStroke = useRef<{ x: number, y: number }[]>([]);


  const getRelativePos = (e: MouseEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };


  // ** START UP ** //
  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentColour;
    ctx.lineWidth = 3;
    ctxRef.current = ctx;

    

    const ws = new WebSocket(`ws://${WS_HOST}/ws`);
    socket.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!ctxRef.current) return;

      const ctx = ctxRef.current;

      if (data.type === "begin") {
        ctx.strokeStyle = data.colour || "black";
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      }

      if (data.type === "draw") {
        ctx.strokeStyle = data.colour || "black";
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      }

      if (data.type === "end") {
        ctx.closePath();
      }
    };

    return () => ws.close();
  }, []); // 👈 React will re-run this effect if the colour changes

  // AI THING
  const analyzeStrokeBackend = async (stroke: { x: number; y: number }[]) => {
    const response = await fetch(`http://${WS_HOST}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: stroke }),
    });
    const data = await response.json();
    if (data.shape === "circle") {
      alert("Detected a circle from backend!");
      // trigger your UI logic here
    }
    // handle other shapes
  };

  //**  Mouse Controls **
  const handleMouseDown = (e: React.MouseEvent) => {


    isDrawing.current = true;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { x, y } = getRelativePos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.strokeStyle = currentColour;
    socket.current?.send(JSON.stringify({ type: "begin", x, y, colour: colourRef.current }));

    // temp
    currentStroke.current = [{ x, y }];


  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current || !ctxRef.current) return;

    const ctx = ctxRef.current;
    const { x, y } = getRelativePos(e);
    ctx.strokeStyle = currentColour;
    ctx.lineTo(x, y);
    ctx.stroke();

    // TEMP
    currentStroke.current.push({ x, y });

    socket.current?.send(JSON.stringify({ type: "draw", x, y, colour: colourRef.current }));
  };

  const handleMouseUp = () => {

    // SEND TO AI
    analyzeStrokeBackend(currentStroke.current);


    isDrawing.current = false;
    if (ctxRef.current) ctxRef.current.closePath();

    socket.current?.send(JSON.stringify({ type: "end" }));
  };



  // ** Canvas Element **
  return (

    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ display: "block", background: "white", cursor: "crosshair" }}
    />
  );
};

export default Whiteboard;