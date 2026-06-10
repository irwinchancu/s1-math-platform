"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Activity, ShieldQuestion } from 'lucide-react';

const REASONS = [
  { id: 'alt', en: 'alt. ∠s, AB // CD', zh: '錯角，AB // CD' },
  { id: 'corr', en: 'corr. ∠s, AB // CD', zh: '同位角，AB // CD' },
  { id: 'int', en: 'int. ∠s, AB // CD', zh: '同旁內角，AB // CD' },
  { id: 'vert', en: 'vert. opp. ∠s', zh: '對頂角' },
  { id: 'adj', en: 'adj. ∠s on st. line', zh: '直線上的鄰角' },
];

export default function ParallelAngleDetective() {
  const [mode, setMode] = useState<'discover' | 'detective'>('discover');
  const [transversalAngle, setTransversalAngle] = useState(60);
  
  // Detective Mode State
  const [knownAngleId, setKnownAngleId] = useState<number>(0);
  const [unknownAngleId, setUnknownAngleId] = useState<number>(4);
  const [userValue, setUserValue] = useState<string>('');
  const [userReason, setUserReason] = useState<string>('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error' | null, msgEn: string, msgZh: string}>({type: null, msgEn: '', msgZh: ''});

  // SVG dimensions
  const width = 500;
  const height = 350;
  const y1 = 120; // Top parallel line AB
  const y2 = 230; // Bottom parallel line CD
  const cx = width / 2;
  const cy = height / 2;

  // Calculate transversal intersections
  // SVG y-axis points downwards, so standard angle geometry is inverted
  const thetaRad = (transversalAngle * Math.PI) / 180;
  
  // Transversal line equation (passing through cx, cy):
  // y - cy = Math.tan(thetaRad) * (x - cx)
  // x = cx + (y - cy) / Math.tan(thetaRad)
  const getX = (y: number) => cx + (y - cy) / Math.tan(thetaRad);

  const tx1 = getX(y1); // Intersection with AB
  const tx2 = getX(y2); // Intersection with CD

  // Generate a new puzzle
  const generatePuzzle = () => {
    const known = Math.floor(Math.random() * 8);
    let unknown = Math.floor(Math.random() * 8);
    while (unknown === known) {
      unknown = Math.floor(Math.random() * 8);
    }
    setKnownAngleId(known);
    setUnknownAngleId(unknown);
    setUserValue('');
    setUserReason('');
    setFeedback({type: null, msgEn: '', msgZh: ''});
    
    // Pick a random angle between 30 and 150
    setTransversalAngle(Math.floor(Math.random() * 120) + 30);
  };

  useEffect(() => {
    if (mode === 'detective') {
      generatePuzzle();
    } else {
      setFeedback({type: null, msgEn: '', msgZh: ''});
    }
  }, [mode]);

  const handleCheck = async () => {
    if (!userValue || !userReason) {
      setFeedback({
        type: 'error',
        msgEn: 'Please enter a value and select a reason!',
        msgZh: '請輸入角度數值並選擇理由！'
      });
      return;
    }

    // Determine correct value
    const isKnownAcute = knownAngleId === 0 || knownAngleId === 2 || knownAngleId === 4 || knownAngleId === 6;
    const isUnknownAcute = unknownAngleId === 0 || unknownAngleId === 2 || unknownAngleId === 4 || unknownAngleId === 6;
    const knownVal = isKnownAcute ? transversalAngle : 180 - transversalAngle;
    const correctVal = isUnknownAcute ? transversalAngle : 180 - transversalAngle;

    // Determine correct reason (simplified logic for demonstration)
    let correctReasons: string[] = [];
    if ((knownAngleId % 4) === (unknownAngleId % 4)) {
      if (Math.abs(knownAngleId - unknownAngleId) === 4) correctReasons.push('corr');
      else if (Math.abs(knownAngleId - unknownAngleId) === 2) correctReasons.push('vert');
    }
    if ((knownAngleId === 2 && unknownAngleId === 4) || (knownAngleId === 4 && unknownAngleId === 2) || 
        (knownAngleId === 3 && unknownAngleId === 5) || (knownAngleId === 5 && unknownAngleId === 3)) {
      correctReasons.push('alt');
    }
    if ((knownAngleId === 2 && unknownAngleId === 5) || (knownAngleId === 5 && unknownAngleId === 2) || 
        (knownAngleId === 3 && unknownAngleId === 4) || (knownAngleId === 4 && unknownAngleId === 3)) {
      correctReasons.push('int');
    }
    // Adjacent on straight line
    if (Math.floor(knownAngleId / 4) === Math.floor(unknownAngleId / 4)) {
      if ((knownAngleId % 2) !== (unknownAngleId % 2)) {
         correctReasons.push('adj');
      }
    }

    // Some puzzles might require multiple steps, which is harder for a 1-step dropdown.
    // If there is no direct 1-step reason in our basic list, we just accept the value or any valid reason if it's a 2-step.
    // For S1 S2, we usually only quiz 1-step. Let's strictly validate if it's a 1-step.
    
    if (parseFloat(userValue) !== correctVal) {
      setFeedback({
        type: 'error',
        msgEn: `Incorrect value. Think about if the angles are acute or obtuse!`,
        msgZh: `數值錯誤。想想這兩個角是銳角還是鈍角！`
      });
      return;
    }

    if (correctReasons.length > 0 && !correctReasons.includes(userReason)) {
       setFeedback({
        type: 'error',
        msgEn: `Value is correct, but the reason is wrong.`,
        msgZh: `數值正確，但幾何理由錯誤。`
      });
      return;
    }

    setFeedback({
      type: 'success',
      msgEn: 'Excellent! You found the missing angle!',
      msgZh: '太棒了！你找出了未知角！'
    });

    // Log progress
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicSlug: 'geometry-parallel-lines',
          score: 100,
          notes: `Solved angle puzzle (known: ${knownAngleId}, unknown: ${unknownAngleId}, angle: ${transversalAngle})`
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to draw an angle arc and label
  const drawAngle = (cx: number, cy: number, quadrant: number, id: number) => {
    // Quadrants: 0=top-right, 1=top-left, 2=bottom-left, 3=bottom-right
    // For AB intersection: 0, 1, 2, 3
    // For CD intersection: 4, 5, 6, 7
    const r = 30;
    const isAcute = quadrant === 0 || quadrant === 2;
    const val = isAcute ? transversalAngle : 180 - transversalAngle;
    
    // Determine start/end angles for the SVG arc
    // Transversal angle is relative to the positive x-axis.
    // In SVG, positive y is down.
    const theta = transversalAngle;
    let startAngle = 0, endAngle = 0;
    
    if (quadrant === 0) { startAngle = 360 - theta; endAngle = 360; }
    if (quadrant === 1) { startAngle = 180; endAngle = 360 - theta; }
    if (quadrant === 2) { startAngle = 180 - theta; endAngle = 180; }
    if (quadrant === 3) { startAngle = 0; endAngle = 180 - theta; }

    const sr = (startAngle * Math.PI) / 180;
    const er = (endAngle * Math.PI) / 180;
    
    const x1 = cx + r * Math.cos(sr);
    const y1 = cy + r * Math.sin(sr); // y is down, wait, standard trig is y up. SVG needs y inverted.
    
    // Inverting y for SVG drawing
    const svgY1 = cy - r * Math.sin(sr);
    const x2 = cx + r * Math.cos(er);
    const svgY2 = cy - r * Math.sin(er);

    // Large arc flag is 0 for all these angles since they are <= 180
    const path = `M ${cx} ${cy} L ${x1} ${svgY1} A ${r} ${r} 0 0 0 ${x2} ${svgY2} Z`;

    const midRad = (startAngle + endAngle) / 2 * Math.PI / 180;
    const labelX = cx + (r + 15) * Math.cos(midRad);
    const labelY = cy - (r + 15) * Math.sin(midRad);

    const isHovered = false; // Add hover logic for Discover mode
    const isKnown = mode === 'detective' && id === knownAngleId;
    const isUnknown = mode === 'detective' && id === unknownAngleId;

    let fillColor = 'transparent';
    let strokeColor = 'rgba(255,255,255,0.2)';
    let textStr = '';

    if (mode === 'discover') {
      fillColor = 'rgba(59, 130, 246, 0.2)'; // blue-500
      strokeColor = '#3b82f6';
      textStr = `${val}°`;
    } else {
      if (isKnown) {
        fillColor = 'rgba(16, 185, 129, 0.3)'; // emerald-500
        strokeColor = '#10b981';
        textStr = `${val}°`;
      } else if (isUnknown) {
        fillColor = 'rgba(244, 63, 94, 0.3)'; // rose-500
        strokeColor = '#f43f5e';
        textStr = `x`;
      }
    }

    return (
      <g key={id} className="transition-all duration-300">
        <path d={path} fill={fillColor} stroke={strokeColor} strokeWidth="2" className="transition-all duration-300 hover:fill-blue-400/50" />
        {(mode === 'discover' || isKnown || isUnknown) && (
          <text x={labelX} y={labelY} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            {textStr}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 text-white font-sans max-w-5xl mx-auto">
      
      {/* Left Panel: Applet */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-blue-400" />
            <span>Parallel Lines Engine <span className="text-slate-400 text-sm font-normal">| 平行線系統</span></span>
          </h2>
          
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setMode('discover')}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'discover' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Discover 探索
            </button>
            <button 
              onClick={() => setMode('detective')}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${mode === 'detective' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Detective 挑戰
            </button>
          </div>
        </div>

        <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 w-full" style={{ aspectRatio: '500/350' }}>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Parallel Lines AB and CD */}
            <line x1="50" y1={y1} x2={width - 50} y2={y1} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1={y2} x2={width - 50} y2={y2} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            
            {/* Arrows for parallel indication */}
            <polygon points={`${width/2 + 30},${y1-6} ${width/2 + 40},${y1} ${width/2 + 30},${y1+6}`} fill="#94a3b8" />
            <polygon points={`${width/2 + 30},${y2-6} ${width/2 + 40},${y2} ${width/2 + 30},${y2+6}`} fill="#94a3b8" />
            
            <text x="30" y={y1 + 5} fill="#94a3b8" fontSize="16" fontWeight="bold">A</text>
            <text x={width - 25} y={y1 + 5} fill="#94a3b8" fontSize="16" fontWeight="bold">B</text>
            <text x="30" y={y2 + 5} fill="#94a3b8" fontSize="16" fontWeight="bold">C</text>
            <text x={width - 25} y={y2 + 5} fill="#94a3b8" fontSize="16" fontWeight="bold">D</text>

            {/* Transversal Line */}
            {/* Find endpoints of transversal extending off canvas */}
            <line 
              x1={getX(-50)} y1="-50" 
              x2={getX(height + 50)} y2={height + 50} 
              stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" 
            />

            {/* Angles at top intersection (AB) */}
            {drawAngle(tx1, y1, 0, 0)}
            {drawAngle(tx1, y1, 1, 1)}
            {drawAngle(tx1, y1, 2, 2)}
            {drawAngle(tx1, y1, 3, 3)}

            {/* Angles at bottom intersection (CD) */}
            {drawAngle(tx2, y2, 0, 4)}
            {drawAngle(tx2, y2, 1, 5)}
            {drawAngle(tx2, y2, 2, 6)}
            {drawAngle(tx2, y2, 3, 7)}
            
            {/* Intersection Points */}
            <circle cx={tx1} cy={y1} r="4" fill="#fbbf24" />
            <circle cx={tx2} cy={y2} r="4" fill="#fbbf24" />
          </svg>
        </div>

        {/* Controls */}
        {mode === 'discover' && (
          <div className="mt-6 w-full flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300">
              Drag to change Transversal Angle / 拖動改變截線角度: <span className="text-amber-400 font-bold">{transversalAngle}°</span>
            </label>
            <input 
              type="range" 
              min="30" max="150" 
              value={transversalAngle} 
              onChange={(e) => setTransversalAngle(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Right Panel: Controls & Feedback */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        {mode === 'discover' ? (
          <div className="bg-blue-950/30 border border-blue-900/50 p-5 rounded-xl h-full flex flex-col justify-center">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Discovery Mode</h3>
            <p className="text-sm text-slate-300 mb-4">
              Move the slider to see how the angles relate to each other. Notice which angles are always equal to each other!
            </p>
            <p className="text-sm text-slate-400">
              拖動滑桿，觀察各個角度之間的關係。留意哪些角度總是相等的！
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/50 p-5 rounded-xl flex flex-col gap-4 flex-1">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <ShieldQuestion size={20} />
              Find the Unknown x!
            </h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400 font-medium">1. Value of x / x 的數值</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="e.g. 60"
                  value={userValue}
                  onChange={(e) => setUserValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500"
                />
                <span className="text-xl text-slate-400 font-light">°</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400 font-medium">2. Geometric Reason / 幾何理由</label>
              <select 
                value={userReason}
                onChange={(e) => setUserReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-rose-500"
              >
                <option value="">Select a reason...</option>
                {REASONS.map(r => (
                  <option key={r.id} value={r.id}>{r.en} | {r.zh}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleCheck}
              className="mt-2 w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Check Answer / 檢查答案
            </button>

            <button 
              onClick={generatePuzzle}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              New Puzzle / 新題目
            </button>

            {/* Feedback Box */}
            {feedback.type && (
              <div className={`mt-auto p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-bottom-2 ${feedback.type === 'success' ? 'bg-emerald-950/50 border border-emerald-900' : 'bg-rose-950/50 border border-rose-900'}`}>
                {feedback.type === 'success' ? <CheckCircle2 className="text-emerald-500 mt-0.5" /> : <XCircle className="text-rose-500 mt-0.5" />}
                <div className="flex flex-col">
                  <span className={`font-bold ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {feedback.msgEn}
                  </span>
                  <span className={`text-sm ${feedback.type === 'success' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                    {feedback.msgZh}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
