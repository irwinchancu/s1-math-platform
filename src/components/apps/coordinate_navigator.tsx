"use client";

import React, { useState, useEffect } from 'react';
import { Crosshair, Navigation, Repeat, ShieldCheck, Zap } from 'lucide-react';

type Point = { x: number; y: number };

export default function CoordinateNavigator() {
  const [mode, setMode] = useState<'learn' | 'target' | 'reflect'>('learn');
  const [userPoint, setUserPoint] = useState<Point>({ x: 0, y: 0 });
  
  // Target Mode
  const [targetPoint, setTargetPoint] = useState<Point>({ x: 3, y: -4 });
  const [targetScore, setTargetScore] = useState(0);
  
  // Reflect Mode
  const [reflectBase, setReflectBase] = useState<Point>({ x: 4, y: 5 });
  const [reflectAxis, setReflectAxis] = useState<'x' | 'y'>('y');
  
  const [feedback, setFeedback] = useState<{msg: string; type: 'success'|'error'|'info'}>({msg: '', type: 'info'});

  // SVG Config
  const gridSize = 400;
  const padding = 30;
  const range = 10; // -10 to 10
  const unit = (gridSize - 2 * padding) / (range * 2);
  const center = gridSize / 2;

  const toSVG = (x: number, y: number) => ({
    cx: center + x * unit,
    cy: center - y * unit // y is inverted in SVG
  });

  const generateTarget = () => {
    let x = Math.floor(Math.random() * 19) - 9;
    let y = Math.floor(Math.random() * 19) - 9;
    if (x === 0) x = 1;
    if (y === 0) y = 1;
    setTargetPoint({ x, y });
    setUserPoint({ x: 0, y: 0 });
    setFeedback({ msg: `Find (${x}, ${y})! / 找出 (${x}, ${y})！`, type: 'info' });
  };

  const generateReflect = () => {
    const axes: ('x'|'y')[] = ['x', 'y'];
    setReflectAxis(axes[Math.floor(Math.random() * 2)]);
    let x = Math.floor(Math.random() * 17) - 8;
    let y = Math.floor(Math.random() * 17) - 8;
    if (x===0) x=2; if(y===0) y=2;
    setReflectBase({ x, y });
    setUserPoint({ x: 0, y: 0 });
    setFeedback({ msg: `Reflect across ${reflectAxis}-axis / 沿 ${reflectAxis} 軸反射`, type: 'info' });
  };

  useEffect(() => {
    if (mode === 'target') generateTarget();
    else if (mode === 'reflect') generateReflect();
    else setFeedback({ msg: 'Click anywhere to see coordinates! / 點擊任意位置查看坐標！', type: 'info' });
  }, [mode]);

  const handleGridClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Calculate raw SVG coordinates regardless of scaling
    const scaleX = gridSize / rect.width;
    const scaleY = gridSize / rect.height;
    
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    let mathX = Math.round((svgX - center) / unit);
    let mathY = Math.round((center - svgY) / unit);

    // Clamp to boundaries
    mathX = Math.max(-10, Math.min(10, mathX));
    mathY = Math.max(-10, Math.min(10, mathY));

    setUserPoint({ x: mathX, y: mathY });

    if (mode === 'target') {
      if (mathX === targetPoint.x && mathY === targetPoint.y) {
        setFeedback({ msg: 'Target Hit! / 命中目標！', type: 'success' });
        setTargetScore(s => s + 1);
        logProgress('coordinate-target');
        setTimeout(generateTarget, 1500);
      } else {
        setFeedback({ msg: `Miss! You clicked (${mathX}, ${mathY}). / 偏了！你點擊了 (${mathX}, ${mathY})`, type: 'error' });
      }
    } else if (mode === 'reflect') {
      const correctX = reflectAxis === 'y' ? -reflectBase.x : reflectBase.x;
      const correctY = reflectAxis === 'x' ? -reflectBase.y : reflectBase.y;
      
      if (mathX === correctX && mathY === correctY) {
        setFeedback({ msg: 'Perfect Reflection! / 完美反射！', type: 'success' });
        logProgress('coordinate-reflect');
        setTimeout(generateReflect, 1500);
      } else {
        setFeedback({ msg: `Wrong. The reflection of (${reflectBase.x}, ${reflectBase.y}) is (${correctX}, ${correctY}). / 錯誤！反射點應該是 (${correctX}, ${correctY})`, type: 'error' });
      }
    } else {
       setFeedback({ msg: `Point set to (${mathX}, ${mathY}) / 坐標設置為 (${mathX}, ${mathY})`, type: 'info' });
    }
  };

  const logProgress = async (slug: string) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug: slug, score: 100, notes: 'Completed interactive puzzle' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const renderGridLines = () => {
    const lines = [];
    for (let i = -range; i <= range; i++) {
      const pos = center + i * unit;
      const isAxis = i === 0;
      // Verticals
      lines.push(<line key={`v${i}`} x1={pos} y1={padding} x2={pos} y2={gridSize - padding} stroke={isAxis ? "#94a3b8" : "rgba(148, 163, 184, 0.2)"} strokeWidth={isAxis ? 2 : 1} />);
      // Horizontals
      lines.push(<line key={`h${i}`} x1={padding} y1={pos} x2={gridSize - padding} y2={pos} stroke={isAxis ? "#94a3b8" : "rgba(148, 163, 184, 0.2)"} strokeWidth={isAxis ? 2 : 1} />);
      
      // Numbers
      if (i !== 0 && i % 2 === 0) {
        lines.push(<text key={`tx${i}`} x={pos} y={center + 15} fill="#64748b" fontSize="10" textAnchor="middle">{i}</text>);
        lines.push(<text key={`ty${i}`} x={center - 10} y={pos + 4} fill="#64748b" fontSize="10" textAnchor="end">{-i}</text>); // Inverted y loop value
      }
    }
    return lines;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-white font-sans max-w-5xl mx-auto">
      
      {/* Left Panel: Applet */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="text-sky-400" />
            <span>Coordinate Radar <span className="text-slate-400 text-sm font-normal">| 坐標雷達</span></span>
          </h2>
          
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button onClick={() => setMode('learn')} className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${mode==='learn'?'bg-sky-600':'text-slate-400 hover:text-white'}`}>Learn</button>
            <button onClick={() => setMode('target')} className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${mode==='target'?'bg-rose-600':'text-slate-400 hover:text-white'}`}>Target</button>
            <button onClick={() => setMode('reflect')} className={`px-3 py-1 text-sm font-bold rounded-md transition-all ${mode==='reflect'?'bg-emerald-600':'text-slate-400 hover:text-white'}`}>Reflect</button>
          </div>
        </div>

        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 w-full max-w-[400px]" style={{ aspectRatio: '1/1' }}>
          <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="w-full h-full cursor-crosshair" onClick={handleGridClick}>
            {/* Grid */}
            {renderGridLines()}
            
            {/* Axis Labels */}
            <text x={gridSize - 20} y={center - 10} fill="#94a3b8" fontSize="14" fontWeight="bold">x</text>
            <text x={center + 10} y={25} fill="#94a3b8" fontSize="14" fontWeight="bold">y</text>

            {/* Target Mode Target */}
            {mode === 'target' && (
              <g className="animate-pulse opacity-50">
                <circle cx={toSVG(targetPoint.x, targetPoint.y).cx} cy={toSVG(targetPoint.x, targetPoint.y).cy} r="15" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx={toSVG(targetPoint.x, targetPoint.y).cx} cy={toSVG(targetPoint.x, targetPoint.y).cy} r="2" fill="#f43f5e" />
              </g>
            )}

            {/* Reflect Mode Base Point */}
            {mode === 'reflect' && (
              <g>
                <circle cx={toSVG(reflectBase.x, reflectBase.y).cx} cy={toSVG(reflectBase.x, reflectBase.y).cy} r="6" fill="#3b82f6" />
                <text x={toSVG(reflectBase.x, reflectBase.y).cx + 10} y={toSVG(reflectBase.x, reflectBase.y).cy - 10} fill="#3b82f6" fontSize="12" fontWeight="bold">P({reflectBase.x}, {reflectBase.y})</text>
              </g>
            )}

            {/* User Point */}
            {(userPoint.x !== 0 || userPoint.y !== 0 || mode === 'learn') && (
              <g className="transition-all duration-300">
                <circle cx={toSVG(userPoint.x, userPoint.y).cx} cy={toSVG(userPoint.x, userPoint.y).cy} r="6" fill="#10b981" />
                <text x={toSVG(userPoint.x, userPoint.y).cx + 10} y={toSVG(userPoint.x, userPoint.y).cy - 10} fill="#10b981" fontSize="14" fontWeight="bold">({userPoint.x}, {userPoint.y})</text>
                
                {/* Connecting lines to axes */}
                <line x1={toSVG(userPoint.x, userPoint.y).cx} y1={toSVG(userPoint.x, userPoint.y).cy} x2={toSVG(userPoint.x, userPoint.y).cx} y2={center} stroke="#10b981" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
                <line x1={toSVG(userPoint.x, userPoint.y).cx} y1={toSVG(userPoint.x, userPoint.y).cy} x2={center} y2={toSVG(userPoint.x, userPoint.y).cy} stroke="#10b981" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
              </g>
            )}
            
            {/* Reflection Line indicator */}
            {mode === 'reflect' && userPoint.x !== 0 && userPoint.y !== 0 && feedback.type === 'success' && (
               <line 
                x1={toSVG(reflectBase.x, reflectBase.y).cx} y1={toSVG(reflectBase.x, reflectBase.y).cy} 
                x2={toSVG(userPoint.x, userPoint.y).cx} y2={toSVG(userPoint.x, userPoint.y).cy} 
                stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" opacity="0.7" 
              />
            )}

          </svg>
        </div>
      </div>

      {/* Right Panel: Controls & Feedback */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        
        <div className="bg-slate-800/50 p-5 rounded-2xl flex flex-col gap-4 flex-1 border border-slate-700">
          
          {mode === 'learn' && (
             <div className="mb-4">
               <h3 className="text-lg font-bold text-sky-400 mb-2 flex items-center gap-2"><Navigation size={20}/> Learn Mode</h3>
               <p className="text-sm text-slate-300">Click anywhere on the radar to reveal its coordinates. Notice how the signs (positive/negative) change in different quadrants!</p>
             </div>
          )}

          {mode === 'target' && (
             <div className="mb-4">
               <h3 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-2"><Crosshair size={20}/> Target Practice</h3>
               <p className="text-sm text-slate-300">Click exactly on the coordinate requested. Be fast and accurate!</p>
               <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-rose-900 text-center">
                  <div className="text-sm text-slate-500 font-bold mb-1">TARGET COORDINATE</div>
                  <div className="text-3xl font-black text-rose-500">({targetPoint.x}, {targetPoint.y})</div>
               </div>
               <div className="mt-4 text-center">
                 <span className="text-slate-400 font-bold">Score: </span>
                 <span className="text-rose-400 font-bold text-xl">{targetScore}</span>
               </div>
             </div>
          )}

          {mode === 'reflect' && (
             <div className="mb-4">
               <h3 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2"><Repeat size={20}/> Reflection</h3>
               <p className="text-sm text-slate-300">Reflect point P across the specified axis to find the new point.</p>
               <div className="mt-4 p-4 bg-slate-900 rounded-xl border border-emerald-900 text-center">
                  <div className="text-sm text-slate-500 font-bold mb-1">AXIS OF REFLECTION</div>
                  <div className="text-2xl font-black text-emerald-500 uppercase">{reflectAxis}-axis</div>
               </div>
             </div>
          )}

          {/* Feedback Box */}
          <div className={`mt-auto p-4 rounded-xl flex items-start gap-3 transition-colors ${feedback.type === 'success' ? 'bg-emerald-950/50 border border-emerald-900 text-emerald-400' : feedback.type === 'error' ? 'bg-rose-950/50 border border-rose-900 text-rose-400' : 'bg-slate-900 border border-slate-700 text-slate-300'}`}>
            <Zap className="shrink-0 mt-0.5" size={18} />
            <span className="font-bold text-sm">{feedback.msg}</span>
          </div>

        </div>
      </div>

    </div>
  );
}
