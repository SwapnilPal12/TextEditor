import { useState, useRef, useEffect } from 'react';
import { 
  Plus, Undo, Redo, 
  Bold, Italic, Underline, 
  Trash2, Type 
} from 'lucide-react';

const TextEditor = () => {
  // State to manage text elements
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  
  // Undo/Redo history
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Text input state
  const [newText, setNewText] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontFamily: 'Arial',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000'
  });

  // Fonts list with some grouped categories
  const fontCategories = {
    'Sans Serif': ['Arial', 'Helvetica', 'Verdana', 'Trebuchet MS'],
    'Serif': ['Times New Roman', 'Georgia', 'Palatino', 'Garamond'],
    'Monospace': ['Courier New', 'Lucida Console'],
    'Cursive': ['Comic Sans MS', 'Brush Script MT']
  };

  // Add new text element
  const addTextElement = () => {
    if (!newText) return;

    const newElement = {
      id: Date.now(),
      text: newText,
      x: Math.random() * 400, // Randomize initial position
      y: Math.random() * 300,
      style: { ...textStyle }
    };

    // Update state and history
    setTextElements(prev => [...prev, newElement]);
    updateHistory([...textElements, newElement]);
    setNewText('');
  };

  // Delete selected text element
  const deleteTextElement = (id) => {
    const updatedElements = textElements.filter(el => el.id !== id);
    setTextElements(updatedElements);
    updateHistory(updatedElements);
    setSelectedElement(null);
  };

  // Update history for undo/redo
  const updateHistory = (newState) => {
    setHistory(prev => [...prev, newState]);
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  // Undo action
  const handleUndo = () => {
    if (history.length <= 1) return;

    const currentState = history[history.length - 1];
    const previousState = history[history.length - 2];

    setTextElements(previousState);
    setRedoStack(prev => [currentState, ...prev]);
    setHistory(prev => prev.slice(0, -1));
  };

  // Redo action
  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const stateToRedo = redoStack[0];
    setTextElements(stateToRedo);
    setHistory(prev => [...prev, stateToRedo]);
    setRedoStack(prev => prev.slice(1));
  };

  // Mouse down handler for dragging
  const handleMouseDown = (e, element) => {
    setSelectedElement(element);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  // Mouse move handler
  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const containerRect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    setTextElements(prev => 
      prev.map(el => 
        el.id === selectedElement.id 
          ? { ...el, x: newX, y: newY } 
          : el
      )
    );
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (isDragging) {
      updateHistory(textElements);
    }
    setIsDragging(false);
    setSelectedElement(null);
  };

  // Toggle text style
  const toggleTextStyle = (style) => {
    const styleMap = {
      fontWeight: { normal: 'bold', bold: 'normal' },
      fontStyle: { normal: 'italic', italic: 'normal' },
      textDecoration: { none: 'underline', underline: 'none' }
    };

    setTextStyle(prev => ({
      ...prev,
      [style]: styleMap[style][prev[style]] || 'normal'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 shadow-md">
          <div className="flex items-center space-x-4">
            {/* Text Input */}
            <div className="flex-grow flex items-center space-x-2">
              <input 
                type="text" 
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter text here..."
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button 
                onClick={addTextElement} 
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Font Family Dropdown */}
            <div className="relative group">
              <select 
                value={textStyle.fontFamily}
                onChange={(e) => setTextStyle(prev => ({
                  ...prev, 
                  fontFamily: e.target.value
                }))}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.entries(fontCategories).map(([category, fonts]) => (
                  <optgroup key={category} label={category}>
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Type size={20} />
              </div>
            </div>

            {/* Font Size Dropdown */}
            <select 
              value={textStyle.fontSize}
              onChange={(e) => setTextStyle(prev => ({
                ...prev, 
                fontSize: e.target.value
              }))}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {['12px', '16px', '20px', '24px', '32px', '48px'].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            {/* Text Style Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={() => toggleTextStyle('fontWeight')}
                className={`p-2 rounded-full ${textStyle.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition`}
              >
                <Bold size={20} />
              </button>
              <button 
                onClick={() => toggleTextStyle('fontStyle')}
                className={`p-2 rounded-full ${textStyle.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition`}
              >
                <Italic size={20} />
              </button>
              <button 
                onClick={() => toggleTextStyle('textDecoration')}
                className={`p-2 rounded-full ${textStyle.textDecoration === 'underline' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-80 transition`}
              >
                <Underline size={20} />
              </button>
            </div>

            {/* Color Picker */}
            <div className="relative">
              <input 
                type="color" 
                value={textStyle.color}
                onChange={(e) => setTextStyle(prev => ({
                  ...prev, 
                  color: e.target.value
                }))}
                className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer"
              />
            </div>

            {/* Undo/Redo Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={handleUndo} 
                disabled={history.length <= 1}
                className="bg-gray-200 p-2 rounded-full disabled:opacity-50 hover:bg-gray-300 transition"
              >
                <Undo size={20} />
              </button>
              <button 
                onClick={handleRedo} 
                disabled={redoStack.length === 0}
                className="bg-gray-200 p-2 rounded-full disabled:opacity-50 hover:bg-gray-300 transition"
              >
                <Redo size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="relative bg-white h-[600px] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {textElements.map((element) => (
            <div
              key={element.id}
              className={`absolute group cursor-move transition-all duration-200 ease-in-out 
                ${selectedElement?.id === element.id ? 'z-50 scale-105 shadow-2xl' : 'hover:scale-105'}`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                ...element.style
              }}
              onMouseDown={(e) => handleMouseDown(e, element)}
            >
              {/* Text with delete button */}
              <div className="relative inline-block">
                {element.text}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTextElement(element.id);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;