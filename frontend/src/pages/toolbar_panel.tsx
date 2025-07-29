import { useState, type SetStateAction } from 'react';

import {
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Switch,
  FormGroup,
  FormControlLabel

} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AISummaryIcon from '@mui/icons-material/AutoFixHigh';
import BrushColor from '@mui/icons-material/Square';
import EraserIcon from '@mui/icons-material/Dock';


interface ToolBarPanelProps {
  onColorChange: (color: string) => void;
  onEraseToggle: () => void;
  onSummarize: () => void;
  onClear: () => void;
}



// MAIN
const ToolBarPanel: React.FC<ToolBarPanelProps> = ({
  onColorChange,
  onEraseToggle,
  onSummarize,
  onClear
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);


  // Current Brush Icon Colour
  const [currentIconColour, setIconColour] = useState('black');

  const handleColorClick = (event: { currentTarget: SetStateAction<null>; }) => {
    setAnchorEl(event.currentTarget);
  };

  // ** Color Handler **
  const handleColorSelect = (color: string) => {

    // change icon colour 
    setIconColour(color)

    onColorChange(color);
    setAnchorEl(null);
  };


  // ** Delete Board Handler **
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the board? This cannot be undone.')) {
      onClear();
    }
  };


  // ** REACT COMPONENTS **
  return (
    <Toolbar
      sx={{
        bgcolor: '#f5f5f5',
        borderRadius: 2,
        boxShadow: 2,
        gap: 8,
        mt: 2,
        justifyContent: 'Center',
        flexWrap: 'wrap'
      }}
    >
      {/* Color Selector */}
      <Tooltip title="Select Pen Color">
        <IconButton onClick={handleColorClick} sx={{ color: currentIconColour }}>
          <BrushColor />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {['black', 'red', 'blue', 'green', 'orange', 'purple'].map((color) => (
          <MenuItem key={color} onClick={() => handleColorSelect(color)}>
            <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: '50%' }} />
            <span style={{ marginLeft: 8 }}>{color}</span>
          </MenuItem>
        ))}
      </Menu>

      {/* Eraser */}
      <Tooltip title="Toggle Eraser">
        <IconButton onClick={onEraseToggle} color="primary">

          <EraserIcon />
        </IconButton>
      </Tooltip>

      {/* AI Summarize */}
      <Tooltip title="Summarise Board with AI">
        <IconButton onClick={onSummarize} color="primary">
          <AISummaryIcon />
        </IconButton>
      </Tooltip>

      {/* Clear Canvas */}
      <Tooltip title="Clear Board">
        <IconButton onClick={handleClear} color="error">
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      {/* Toggle AI Completion */}
      <FormGroup>
        <FormControlLabel control={<Switch defaultChecked />} label="AI Draw Autocomplete" />
      </FormGroup>
    </Toolbar>
  );
};

export default ToolBarPanel;