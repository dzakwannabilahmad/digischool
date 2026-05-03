import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text, Image as KonvaImage, Rect } from 'react-konva';
import { Note, DrawingElement } from '../types';
import { 
  ArrowLeft, Save, Pencil, Eraser, MousePointer2, 
  Sparkles, Type, Minus, Plus, ChevronDown, Download, HelpCircle,
  X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askAi } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onBack: () => void;
}

export default function NoteEditor({ note, onSave, onBack }: NoteEditorProps) {
  const [elements, setElements] = useState<DrawingElement[]>(JSON.parse(note.content));
  const [tool, setTool] = useState<'pen' | 'eraser' | 'lasso' | 'text'>('pen');
  const [color, setColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [title, setTitle] = useState(note.title);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);

  // Scaling logic
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 80 });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight - 80 });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: any) => {
    if (tool === 'text') {
      const pos = e.target.getStage().getPointerPosition();
      const newText: DrawingElement = {
        id: Date.now().toString(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Type here...',
        color: color,
      };
      setElements([...elements, newText]);
      setTool('pen');
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    
    if (tool === 'lasso') {
      setElements([...elements, {
        id: 'lasso-current',
        type: 'line',
        points: [pos.x, pos.y],
        color: '#ffffff',
        strokeWidth: 1,
        isAiGenerated: false
      }]);
    } else {
      setElements([...elements, { 
        id: Date.now().toString(),
        type: 'line', 
        points: [pos.x, pos.y], 
        color: tool === 'eraser' ? '#000000' : color, 
        strokeWidth: tool === 'eraser' ? 20 : strokeWidth 
      }]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastElement = elements[elements.length - 1];

    if (lastElement && lastElement.type === 'line') {
      const newPoints = lastElement.points!.concat([point.x, point.y]);
      const newElements = elements.slice(0, elements.length - 1);
      setElements([...newElements, { ...lastElement, points: newPoints }]);
    }
  };

  const handleMouseUp = async (e: any) => {
    isDrawing.current = false;
    
    if (tool === 'lasso') {
      const lastElement = elements[elements.length - 1];
      if (lastElement && lastElement.id === 'lasso-current') {
        setAiLoading(true);
        setIsAiOpen(true);
        
        // Take a crop of the lassoed area
        const points = lastElement.points!;
        const minX = Math.min(...points.filter((_, i) => i % 2 === 0));
        const maxX = Math.max(...points.filter((_, i) => i % 2 === 0));
        const minY = Math.min(...points.filter((_, i) => i % 2 === 1));
        const maxY = Math.max(...points.filter((_, i) => i % 2 === 1));

        try {
          const dataUrl = stageRef.current.toDataURL({
            x: minX - 10,
            y: minY - 10,
            width: (maxX - minX) + 20,
            height: (maxY - minY) + 20,
            pixelRatio: 2
          });

          // Send to AI
          const result = await askAi("Analyze this part of my notes and tell me what it is or solve the problem if it's math.", dataUrl);
          
          if (result) {
            handleAiResult(result, maxX + 20, minY);
          }
        } catch (err) {
          console.error("Lasso error", err);
        } finally {
          setElements(elements.filter(el => el.id !== 'lasso-current'));
          setAiLoading(false);
          setTool('pen');
        }
      }
    }
  };

  const handleAiResult = (text: string, x: number, y: number) => {
    setIsWriting(true);
    const words = text.split(' ');
    let currentText = '';
    
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: 'text',
      x: x,
      y: y,
      text: '',
      color: '#ffffff',
      isAiGenerated: true
    };

    setElements([...elements, newElement]);

    // Simulate "Writing" effect
    let i = 0;
    const interval = setInterval(() => {
      if (i >= words.length) {
        clearInterval(interval);
        setIsWriting(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        return;
      }
      currentText += words[i] + ' ';
      setElements(prev => prev.map(el => el.id === newElement.id ? { ...el, text: currentText } : el));
      i++;
    }, 50);
  };

  const handleSave = () => {
    const preview = stageRef.current.toDataURL({ pixelRatio: 0.2 });
    onSave({
      ...note,
      title,
      content: JSON.stringify(elements),
      updatedAt: Date.now(),
      previewImage: preview
    });
    alert('Note saved!');
  };

  const handleAskAiText = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const result = await askAi(aiPrompt);
    setAiPrompt('');
    if (result) {
       handleAiResult(result, 100, 100);
    }
    setAiLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-black h-screen">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-bottom border-zinc-800 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none outline-none text-xl font-semibold w-64 focus:border-b border-zinc-700"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 rounded-full px-2 py-1 mr-4">
             <button 
              onClick={() => setTool('pen')} 
              className={`p-2 rounded-full ${tool === 'pen' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
             >
                <Pencil size={18} />
             </button>
             <button 
              onClick={() => setTool('eraser')} 
              className={`p-2 rounded-full ${tool === 'eraser' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
             >
                <Eraser size={18} />
             </button>
             <button 
              onClick={() => setTool('lasso')} 
              className={`p-2 rounded-full ${tool === 'lasso' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
             >
                <MousePointer2 size={18} />
             </button>
             <button 
              onClick={() => setTool('text')} 
              className={`p-2 rounded-full ${tool === 'text' ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-400'}`}
             >
                <Type size={18} />
             </button>
          </div>
          
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-semibold"
          >
            <Save size={18} /> Save
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative canvas-container overflow-hidden">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          className="cursor-crosshair"
        >
          <Layer>
            {elements.map((el, i) => (
              el.type === 'line' ? (
                <Line
                  key={el.id}
                  points={el.points}
                  stroke={el.color}
                  strokeWidth={el.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  dash={el.id === 'lasso-current' ? [5, 5] : []}
                />
              ) : (
                <Text
                  key={el.id}
                  x={el.x}
                  y={el.y}
                  text={el.text}
                  fill={el.color}
                  fontSize={20}
                  fontFamily={el.isAiGenerated ? "'Gochi Hand', cursive" : "'Poppins', sans-serif"}
                  width={400}
                />
              )
            ))}
          </Layer>
        </Stage>

        {/* AI Mascot Floating Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl z-40"
        >
          <div className="relative">
             <svg viewBox="0 0 24 24" className="w-12 h-12 fill-black">
              <path d="M12,2C10.89,2 10,2.89 10,4C10,5.11 10.89,6 12,6C13.11,6 14,5.11 14,4C14,2.89 13.11,2 12,2M12,8C9.79,8 8,9.79 8,12C8,14.21 9.79,16 12,16C14.21,16 16,14.21 16,12C16,9.79 14.21,8 12,8M12,18C10.34,18 9,19.34 9,21C9,22.66 10.34,24 12,24C13.66,24 15,22.66 15,21C15,19.34 13.66,18 12,18Z" />
            </svg>
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" 
            />
          </div>
        </motion.button>

        {/* AI Interaction Modal */}
        <AnimatePresence>
          {isAiOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-32 right-10 w-96 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 z-50 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-400" />
                  <h3 className="font-bold text-lg">DigiSchool AI</h3>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-800 p-4 rounded-2xl text-sm leading-relaxed">
                  {aiLoading ? (
                    <div className="flex items-center gap-2">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Sparkles size={14} />
                      </motion.div>
                      Thinking...
                    </div>
                  ) : (
                    "Halo! Saya asisten DigiSchool. Kamu bisa menanyakan apa saja, atau gunakan fitur 'AI Lasso' (ikon mouse) untuk menganalisis catatanmu secara langsung!"
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAiText()}
                    placeholder="Tanya sesuatu..."
                    className="flex-1 bg-zinc-800 border-none outline-none px-4 py-3 rounded-xl text-sm"
                  />
                  <button 
                    onClick={handleAskAiText}
                    className="p-3 bg-white text-black rounded-xl hover:bg-zinc-200"
                  >
                    <Send size={18} />
                  </button>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-center gap-4">
                   <button 
                    onClick={() => setTool('lasso')}
                    className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                   >
                     <MousePointer2 size={14} /> Gunakan Lasso AI
                   </button>
                   <button className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                     <HelpCircle size={14} /> Tutorial
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Indication for writing */}
        {isWriting && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/20"
            >
               <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
               <span className="text-sm font-medium tracking-wide">DigiSchool AI is writing...</span>
            </motion.div>
          </div>
        )}
      </main>

      {/* Floating Toolbar (Optional secondary) */}
      <div className="absolute left-6 bottom-10 flex flex-col gap-3 z-30">
        <div className="bg-zinc-900 p-2 rounded-2xl border border-zinc-800 flex flex-col gap-2">
           {['#ffffff', '#ff4444', '#44ff44', '#4444ff', '#ffff44'].map(c => (
              <button 
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-110 border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
           ))}
        </div>
        <div className="bg-zinc-900 p-2 rounded-2xl border border-zinc-800 flex flex-col gap-2 items-center">
           <button onClick={() => setStrokeWidth(prev => Math.min(prev + 2, 20))} className="p-1 hover:bg-zinc-800 rounded"><Plus size={16}/></button>
           <div className="h-1 bg-zinc-700 w-4 rounded" style={{ height: (strokeWidth / 2) + 'px' }} />
           <button onClick={() => setStrokeWidth(prev => Math.max(prev - 2, 2))} className="p-1 hover:bg-zinc-800 rounded"><Minus size={16}/></button>
        </div>
      </div>
    </div>
  );
}
