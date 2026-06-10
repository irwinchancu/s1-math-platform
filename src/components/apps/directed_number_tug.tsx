"use client";

import React, { useState, useEffect } from 'react';
import { Anchor, ArrowRight, ArrowLeft, RefreshCw, Star, ShieldAlert } from 'lucide-react';

export default function DirectedNumberTug() {
  const [position, setPosition] = useState(0);
  const [target, setTarget] = useState(8);
  const [history, setHistory] = useState<number[]>([0]);
  const [cards, setCards] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{msg: string, type: 'success'|'error'|'info'}>({msg: "Reach the target exactly! / 精準到達目標點！", type: 'info'});
  
  const MIN = -20;
  const MAX = 20;

  const generateLevel = () => {
    let t = Math.floor(Math.random() * 30) - 15;
    if (t === 0) t = 5;
    setTarget(t);
    setPosition(0);
    setHistory([0]);
    
    // Generate some cards
    const newCards = [];
    for(let i=0; i<6; i++) {
      let val = Math.floor(Math.random() * 11) - 5;
      if (val === 0) val = 2;
      newCards.push(val);
    }
    // ensure target is reachable (simplistic approach: just add one card that forces it closer)
    newCards.push(t > 0 ? Math.ceil(t/2) : Math.floor(t/2));
    setCards(newCards.sort(() => Math.random() - 0.5));
    setFeedback({msg: "Reach the target exactly! / 精準到達目標點！", type: 'info'});
  };

  useEffect(() => {
    generateLevel();
  }, []);

  const playCard = (val: number, index: number) => {
    if (position === target) return;
    
    const newPos = position + val;
    
    if (newPos > MAX || newPos < MIN) {
       setFeedback({msg: "Out of bounds! / 超出界線！", type: 'error'});
       return;
    }
    
    setPosition(newPos);
    setHistory([...history, newPos]);
    
    // Remove card and add a new random one
    const newCards = [...cards];
    let newCardVal = Math.floor(Math.random() * 11) - 5;
    if (newCardVal===0) newCardVal=3;
    newCards[index] = newCardVal;
    setCards(newCards);

    if (newPos === target) {
      setFeedback({msg: "Target Reached! / 成功到達目標！", type: 'success'});
      logProgress();
      setTimeout(generateLevel, 2000);
    } else {
      setFeedback({msg: `${val > 0 ? '+' : ''}${val} played. Current: ${newPos} / 出了 ${val}。目前位置: ${newPos}`, type: 'info'});
    }
  };

  const undo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setPosition(newHistory[newHistory.length - 1]);
      setFeedback({msg: "Undo! / 復原！", type: 'info'});
    }
  };

  const logProgress = async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug: 'directed-numbers', score: 100, notes: 'Completed tug-of-war' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const renderNumberLine = () => {
    const ticks = [];
    for (let i = MIN; i <= MAX; i++) {
      const isAxis = i === 0;
      const isTarget = i === target;
      const isPos = i === position;
      
      let leftPct = ((i - MIN) / (MAX - MIN)) * 100;
      
      ticks.push(
        <div key={i} className="absolute flex flex-col items-center" style={{ left: \`\${leftPct}%\`, transform: 'translateX(-50%)' }}>
          <div className={\`h-4 w-0.5 \${isAxis ? 'bg-sky-400 h-6' : 'bg-slate-600'}\`}></div>
          {i % 5 === 0 && <span className={\`text-xs mt-1 \${isAxis ? 'text-sky-400 font-bold' : 'text-slate-500'}\`}>{i}</span>}
          
          {isTarget && (
            <div className="absolute -top-8 animate-bounce">
               <Star className="text-amber-400 fill-amber-400" size={24} />
            </div>
          )}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-white font-sans max-w-5xl mx-auto">
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black flex items-center gap-2 text-sky-400">
          <Anchor /> Tug-of-War: Directed Numbers
        </h2>
        <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
           <span className="text-slate-400 font-bold">Target: </span>
           <span className="text-amber-400 font-black text-xl">{target}</span>
        </div>
      </div>

      {/* Number Line Visualizer */}
      <div className="bg-slate-950 p-10 rounded-2xl border border-slate-800 relative mt-8 mb-4 h-40 flex items-center">
         
         <div className="w-full h-1 bg-slate-700 relative">
            {renderNumberLine()}

            {/* The Rope / Progress Bar */}
            <div 
              className="absolute h-1 top-0 transition-all duration-500 ease-out z-10"
              style={{
                left: \`\${Math.min(0, position) - MIN}%\`, // Wait, absolute positioning requires proper calc.
                // width is from 0 to position.
                // actually let's just draw a line from 0 to position.
              }}
            ></div>
            
            {/* Draw from 0 to position */}
            {position !== 0 && (
              <div 
                className={\`absolute h-2 -top-0.5 rounded-full transition-all duration-500 \${position > 0 ? 'bg-emerald-500' : 'bg-rose-500'}\`}
                style={{
                  left: position > 0 ? '50%' : \`\${50 - (Math.abs(position)/(MAX-MIN))*100}%\`,
                  width: \`\${(Math.abs(position)/(MAX-MIN))*100}%\`
                }}
              ></div>
            )}

            {/* Avatar / Current Position Marker */}
            <div 
              className="absolute -top-4 w-8 h-8 rounded-full border-4 border-slate-950 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.6)] flex items-center justify-center transition-all duration-500 ease-out z-20"
              style={{ left: \`\${((position - MIN) / (MAX - MIN)) * 100}%\`, transform: 'translateX(-50%)' }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

         </div>

      </div>

      <div className={\`p-4 rounded-xl text-center font-bold text-lg \${feedback.type === 'success' ? 'bg-emerald-950 text-emerald-400' : feedback.type === 'error' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-sky-400'}\`}>
         {feedback.msg}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cards.map((val, i) => (
          <button 
            key={i}
            onClick={() => playCard(val, i)}
            disabled={position === target}
            className={\`h-24 rounded-2xl flex flex-col items-center justify-center text-3xl font-black shadow-lg transition-all transform hover:-translate-y-2 hover:scale-105 active:scale-95 \${val > 0 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'}\`}
          >
            {val > 0 ? '+' : ''}{val}
            <span className="text-xs opacity-70 font-medium mt-1">{val > 0 ? 'Add' : 'Subtract'}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={undo} disabled={history.length <= 1 || position === target} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2">
           <ArrowLeft size={18} /> Undo / 復原
        </button>
        <button onClick={generateLevel} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2">
           <RefreshCw size={18} /> Restart / 重新開始
        </button>
      </div>

    </div>
  );
}
