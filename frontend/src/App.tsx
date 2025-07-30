// src/App.tsx
import { useState } from 'react';
import Whiteboard from './pages/whiteboard';
import ToolBarPanel from './pages/toolbar_panel';
import './App.css'

const App: React.FC = () => {


// Drawing Settings
const [currentBrushColour, setBrushColour] = useState('black');
const [isEraser, setEraser] = useState(false);

  return (
    <>
      <div>
        <h1>BoardRoom</h1>
        <ToolBarPanel
          onColorChange={(color: any) => {
            setBrushColour(color)
            console.log("changed color to", color)
          }}
          onEraseToggle={() => {
            
            isEraser ? setEraser(false) : setEraser(true);
            console.log("Toggled eraser");
          }}
          onSummarize={() => console.log("Summarize initiated")}
          onClear={() => console.log("Clear canvas")}
        />

        <Whiteboard currentColour={currentBrushColour} />

      </div>
    </>

  );
};

export default App;
