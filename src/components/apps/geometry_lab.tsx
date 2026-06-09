import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, PenTool, CheckCircle2, Maximize2, Hash } from 'lucide-react';

const App = () => {
  const [mode, setMode] = useState('M'); 
  const [problem, setProblem] = useState(null);
  const [showAux, setShowAux] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Colors for sub-angles to distinguish them clearly
  const COLORS = {
    top: '#9333ea',    // Purple
    mid: '#0d9488',    // Teal
    bottom: '#ea580c', // Orange
    target: '#ef4444', // Red
    aux: '#10b981',    // Emerald
    line: '#1e293b'    // Slate 800
  };

  // Helper to convert polar to cartesian coordinates
  const getPoint = (x, y, angleDeg, length) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: x + length * Math.cos(angleRad),
      y: y + length * Math.sin(angleRad)
    };
  };

  // Improved SVG Arc Generator (always sweeps clockwise from startAngle to endAngle)
  const getArcPath = (cx, cy, startAngle, endAngle, radius) => {
    let diff = endAngle - startAngle;
    while (diff <= 0) diff += 360;
    while (diff > 360) diff -= 360;
    
    const largeArcFlag = diff > 180 ? "1" : "0";
    
    const start = getPoint(cx, cy, startAngle, radius);
    const end = getPoint(cx, cy, startAngle + diff, radius);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const generateProblem = useCallback(() => {
    if (mode === 'M') {
      let a1 = Math.floor(Math.random() * 25) + 35; 
      let b = Math.floor(Math.random() * 25) + 35; 
      let a2 = 180 - b; 

      setProblem({
        angles: [a1, a2],
        b: b,
        target: a1 + b,
      });
    } else {
      let a1 = Math.floor(Math.random() * 20) + 30; // Angle at A
      let a2 = Math.floor(Math.random() * 20) + 30; // Sub-angle b & c
      let a3 = Math.floor(Math.random() * 20) + 30; // Angle at B
      setProblem({
        angles: [a1, a2, a3],
        targetX: a1 + a2, // Known reflex angle at P
        targetY: a2 + a3  // Unknown angle at Q to find
      });
    }
    setShowAux(false);
    setShowAnswer(false);
  }, [mode]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-6 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h1 className="text-2xl font-black text-slate-800 leading-tight">
              GEOMETRY LAB <br/>
              <span className="text-blue-600 font-bold text-lg">HK Syllabus / 香港課程</span>
            </h1>
            <div className="flex bg-slate-100 p-1 rounded-xl mt-5">
              <button 
                onClick={() => setMode('M')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'M' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                M-Shape
              </button>
              <button 
                onClick={() => setMode('W')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'W' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                W-Shape
              </button>
            </div>
          </header>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PenTool size={16} className="text-blue-500" /> 輔助工具面板
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => setShowAux(!showAux)}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${showAux ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'}`}
              >
                <Hash size={16} /> {showAux ? '移除平行輔助線' : '繪製輔助線 (||)'}
              </button>
              <button 
                onClick={() => setShowAnswer(!showAnswer)}
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${showAnswer ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50'}`}
              >
                <Maximize2 size={16} /> {showAnswer ? '隱藏解法' : '顯示幾何證明步驟'}
              </button>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-md">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} /> 幾何理由 (Reasons)
            </h2>
            <div className="text-xs opacity-90 leading-relaxed space-y-2">
              <p><span className="font-bold text-yellow-300">alt. ∠s, L1 // L3</span><br/>內錯角，L1平行L3 (Z-shape)</p>
              <p><span className="font-bold text-yellow-300">int. ∠s, L3 // L2</span><br/>同側內角，L3平行L2 (C-shape)</p>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[680px]">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Precision Geometry Visualization
              </h2>
              <button onClick={generateProblem} className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg">
                <RefreshCw size={14} /> 重新生成圖形
              </button>
            </div>

            <div className="flex-grow bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
              {problem && (
                <svg viewBox="0 0 800 520" className="w-full h-full drop-shadow-sm p-4">
                  {/* Common Parallel Lines and Endpoints */}
                  <g>
                    <line x1="80" y1="100" x2="720" y2="100" stroke={COLORS.line} strokeWidth="3" />
                    <path d="M 390 90 L 405 100 L 390 110 M 410 90 L 425 100 L 410 110" fill="none" stroke={COLORS.line} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    
                    <circle cx="80" cy="100" r="4" fill="#64748b" />
                    <text x="60" y="105" className="text-[14px] font-bold fill-slate-500">C</text>
                    <circle cx="720" cy="100" r="4" fill="#64748b" />
                    <text x="735" y="105" className="text-[14px] font-bold fill-slate-500">D</text>
                    <text x="735" y="90" className="text-[12px] font-black fill-slate-600 italic">L1</text>
                  </g>
                  <g>
                    <line x1="80" y1="420" x2="720" y2="420" stroke={COLORS.line} strokeWidth="3" />
                    <path d="M 390 410 L 405 420 L 390 430 M 410 410 L 425 420 L 410 430" fill="none" stroke={COLORS.line} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    
                    <circle cx="80" cy="420" r="4" fill="#64748b" />
                    <text x="60" y="425" className="text-[14px] font-bold fill-slate-500">E</text>
                    <circle cx="720" cy="420" r="4" fill="#64748b" />
                    <text x="735" y="425" className="text-[14px] font-bold fill-slate-500">F</text>
                    <text x="735" y="440" className="text-[12px] font-black fill-slate-600 italic">L2</text>
                  </g>

                  {mode === 'M' ? (() => {
                    const startX = 220, startY = 100;
                    const a1 = problem.angles[0]; 
                    const a2 = problem.angles[1]; 
                    const b = problem.b; 
                    
                    const p = getPoint(startX, startY, a1, 280);
                    const dy = 420 - p.y;
                    const Bx = p.x - (dy / Math.tan(b * Math.PI / 180));

                    const label_a1 = getPoint(startX, startY, a1 / 2, 55);
                    const label_a2 = getPoint(Bx, 420, 270 - b / 2, 60); 
                    const label_x = getPoint(p.x, p.y, 180 + (a1 - b) / 2, 60); 
                    
                    const l_sub_a = getPoint(p.x, p.y, 180 + a1 / 2, 45);
                    const l_sub_b = getPoint(p.x, p.y, 180 - b / 2, 45);

                    return (
                      <g>
                        {/* Known Angles Arcs */}
                        <path d={getArcPath(startX, startY, 0, a1, 40)} fill="none" stroke={COLORS.top} strokeWidth="3" />
                        <path d={getArcPath(Bx, 420, 180, 360 - b, 40)} fill="none" stroke={COLORS.bottom} strokeWidth="3" />
                        
                        {/* Target Angle Arc at P */}
                        <path d={getArcPath(p.x, p.y, 180 - b, 180 + a1, 35)} fill="none" stroke={COLORS.target} strokeWidth="3" strokeDasharray={showAux ? "4,4" : "none"} opacity={showAux ? 0.2 : 1} />

                        {/* Main Geometric Lines */}
                        <path d={`M ${startX} ${startY} L ${p.x} ${p.y} L ${Bx} 420`} fill="none" stroke={COLORS.line} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        
                        <circle cx={startX} cy={startY} r="5" fill="#2563eb" />
                        <text x={startX - 15} y={startY - 15} className="text-[18px] font-bold fill-blue-800">A</text>
                        
                        <circle cx={Bx} cy={420} r="5" fill="#2563eb" />
                        <text x={Bx + 15} y={420 + 25} className="text-[18px] font-bold fill-blue-800">B</text>

                        <circle cx={p.x} cy={p.y} r="7" fill={COLORS.target} />
                        <text x={p.x + 20} y={p.y + 5} className="text-[22px] font-black fill-slate-800 italic">P</text>

                        {/* Labels */}
                        <text x={label_a1.x} y={label_a1.y + 5} textAnchor="middle" fill={COLORS.top} className="text-[18px] font-black">{a1}°</text>
                        <text x={label_a2.x} y={label_a2.y + 5} textAnchor="middle" fill={COLORS.bottom} className="text-[18px] font-black">{a2}°</text>
                        
                        {!showAux && (
                          <text x={label_x.x} y={label_x.y + 8} textAnchor="middle" fill={COLORS.target} className="text-[28px] font-black">x</text>
                        )}

                        {/* Auxiliary Line */}
                        {showAux && (
                          <g className="animate-in fade-in zoom-in-95 duration-500">
                            <line x1="80" y1={p.y} x2="720" y2={p.y} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8,6" />
                            <text x="735" y={p.y + 4} className="text-[12px] font-black fill-slate-500 italic">L3</text>
                            
                            <path d={getArcPath(p.x, p.y, 180, 180 + a1, 35)} fill={COLORS.top} fillOpacity="0.15" stroke={COLORS.top} strokeWidth="3" />
                            <path d={getArcPath(p.x, p.y, 180 - b, 180, 35)} fill={COLORS.bottom} fillOpacity="0.15" stroke={COLORS.bottom} strokeWidth="3" />

                            <text x={l_sub_a.x} y={l_sub_a.y + 5} textAnchor="middle" fill={COLORS.top} className="text-[15px] font-black">∠a</text>
                            <text x={l_sub_b.x} y={l_sub_b.y + 5} textAnchor="middle" fill={COLORS.bottom} className="text-[15px] font-black">∠b</text>
                          </g>
                        )}
                      </g>
                    );
                  })() : (() => {
                    const a1 = problem.angles[0];
                    const a2 = problem.angles[1];
                    const a3 = problem.angles[2];

                    const startX = 250, startY = 100;
                    const p_dy = 120;
                    const Px = startX + p_dy / Math.tan(a1 * Math.PI / 180);
                    const Py = startY + p_dy;

                    const q_dy = 100;
                    const Qx = Px - q_dy / Math.tan(a2 * Math.PI / 180);
                    const Qy = Py + q_dy;

                    const end_dy = 420 - Qy;
                    const Bx = Qx + end_dy / Math.tan(a3 * Math.PI / 180);

                    const l_a1 = getPoint(startX, startY, a1 / 2, 45);
                    const l_a3 = getPoint(Bx, 420, 180 + a3 / 2, 45); 
                    const l_x = getPoint(Px, Py, 180 + (a1 - a2) / 2, 55);
                    const l_y = getPoint(Qx, Qy, (a3 - a2) / 2, 55); 

                    const l_sub_a = getPoint(Px, Py, 180 + a1 / 2, 45);
                    const l_sub_b = getPoint(Px, Py, 180 - a2 / 2, 45);
                    const l_sub_c = getPoint(Qx, Qy, 360 - a2 / 2, 45);
                    const l_sub_d = getPoint(Qx, Qy, a3 / 2, 45);

                    return (
                      <g>
                        {/* Angles at A and B */}
                        <path d={getArcPath(startX, startY, 0, a1, 35)} fill="none" stroke={COLORS.top} strokeWidth="3" />
                        <path d={getArcPath(Bx, 420, 180, 180 + a3, 35)} fill="none" stroke={COLORS.bottom} strokeWidth="3" />
                        
                        {/* Angle at P (Given Target X) */}
                        <path d={getArcPath(Px, Py, 180 - a2, 180 + a1, 35)} fill="none" stroke={COLORS.target} strokeWidth="3" strokeDasharray={showAux ? "4,4" : "none"} opacity={showAux ? 0.2 : 1} />
                        
                        {/* Angle at Q (Unknown Y) */}
                        <path d={getArcPath(Qx, Qy, 360 - a2, 360 + a3, 35)} fill="none" stroke={COLORS.target} strokeWidth="3" strokeDasharray={showAux ? "4,4" : "none"} opacity={showAux ? 0.2 : 1} />

                        {/* Zig Zag Lines */}
                        <path d={`M ${startX} ${startY} L ${Px} ${Py} L ${Qx} ${Qy} L ${Bx} 420`} fill="none" stroke={COLORS.line} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        
                        <circle cx={startX} cy={startY} r="5" fill="#2563eb" />
                        <text x={startX - 15} y={startY - 15} className="text-[18px] font-bold fill-blue-800">A</text>
                        <circle cx={Bx} cy={420} r="5" fill="#2563eb" />
                        <text x={Bx + 15} y={420 + 25} className="text-[18px] font-bold fill-blue-800">B</text>

                        <circle cx={Px} cy={Py} r="7" fill={COLORS.target} />
                        <text x={Px + 20} y={Py} className="text-[20px] font-black fill-slate-800 italic">P</text>
                        <circle cx={Qx} cy={Qy} r="7" fill={COLORS.target} />
                        <text x={Qx - 25} y={Qy + 5} className="text-[20px] font-black fill-slate-800 italic">Q</text>

                        {/* Text values */}
                        <text x={l_a1.x} y={l_a1.y+5} textAnchor="middle" fill={COLORS.top} className="text-[16px] font-black">{a1}°</text>
                        <text x={l_a3.x} y={l_a3.y+5} textAnchor="middle" fill={COLORS.bottom} className="text-[16px] font-black">{a3}°</text>
                        
                        <text x={l_x.x} y={l_x.y+6} textAnchor="middle" fill={COLORS.target} className="text-[20px] font-black">{problem.targetX}°</text>
                        
                        {!showAux && (
                          <text x={l_y.x} y={l_y.y+8} textAnchor="middle" fill={COLORS.target} className="text-[24px] font-black">y</text>
                        )}

                        {/* Auxiliary Splitting */}
                        {showAux && (
                          <g className="animate-in fade-in duration-500">
                            <line x1="80" y1={Py} x2="720" y2={Py} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8,6" />
                            <text x="735" y={Py + 4} className="text-[12px] font-black fill-slate-500 italic">L3</text>

                            <line x1="80" y1={Qy} x2="720" y2={Qy} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8,6" />
                            <text x="735" y={Qy + 4} className="text-[12px] font-black fill-slate-500 italic">L4</text>
                            
                            {/* Color Coded Sub Arcs */}
                            <path d={getArcPath(Px, Py, 180, 180 + a1, 35)} fill={COLORS.top} fillOpacity="0.15" stroke={COLORS.top} strokeWidth="3" />
                            <path d={getArcPath(Px, Py, 180 - a2, 180, 35)} fill={COLORS.mid} fillOpacity="0.15" stroke={COLORS.mid} strokeWidth="3" />
                            
                            <path d={getArcPath(Qx, Qy, 360 - a2, 360, 35)} fill={COLORS.mid} fillOpacity="0.15" stroke={COLORS.mid} strokeWidth="3" />
                            <path d={getArcPath(Qx, Qy, 0, a3, 35)} fill={COLORS.bottom} fillOpacity="0.15" stroke={COLORS.bottom} strokeWidth="3" />

                            <text x={l_sub_a.x} y={l_sub_a.y+5} textAnchor="middle" fill={COLORS.top} className="text-[14px] font-black">∠a</text>
                            <text x={l_sub_b.x} y={l_sub_b.y+5} textAnchor="middle" fill={COLORS.mid} className="text-[14px] font-black">∠b</text>
                            <text x={l_sub_c.x} y={l_sub_c.y+5} textAnchor="middle" fill={COLORS.mid} className="text-[14px] font-black">∠c</text>
                            <text x={l_sub_d.x} y={l_sub_d.y+5} textAnchor="middle" fill={COLORS.bottom} className="text-[14px] font-black">∠d</text>
                          </g>
                        )}
                      </g>
                    );
                  })()}
                </svg>
              )}
            </div>

            {/* Solution Panel - HK Textbook Style */}
            <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1 bg-[#1e293b] rounded-2xl p-6 text-white shadow-inner min-h-[140px] flex flex-col justify-center border-l-4 border-blue-500">
                <p className="text-[11px] text-slate-400 font-mono uppercase mb-4 tracking-widest">Logic & Deductive Proof / 幾何演繹證明</p>
                {showAnswer ? (
                  <div className="text-[15px] font-mono space-y-3">
                    {mode === 'M' ? (
                      <>
                        <p className="text-slate-300">Draw a line L3 through P such that L1 // L3 // L2.</p>
                        <p style={{ color: COLORS.top }}>∠a = {problem.angles[0]}° <span className="text-slate-400 ml-2">(alt. ∠s, L1 // L3)</span></p>
                        <p style={{ color: COLORS.bottom }}>∠b + {problem.angles[1]}° = 180° <span className="text-slate-400 ml-2">(int. ∠s, L3 // L2)</span></p>
                        <p style={{ color: COLORS.bottom }}>∠b = {problem.b}°</p>
                        <div className="text-white font-bold text-xl mt-3 pt-3 border-t border-slate-700/50">
                          x = ∠a + ∠b = {problem.angles[0]}° + {problem.b}° = <span className="text-yellow-400">{problem.target}°</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-300">Draw lines L3 through P, L4 through Q such that L1 // L3 // L4 // L2.</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p style={{ color: COLORS.top }}>∠a = {problem.angles[0]}° <span className="text-slate-400 block text-xs">(alt. ∠s, L1 // L3)</span></p>
                            <p style={{ color: COLORS.mid }}>∠b = {problem.targetX}° - ∠a = <span className="font-bold">{problem.angles[1]}°</span></p>
                            <p style={{ color: COLORS.mid }}>∠c = ∠b = {problem.angles[1]}° <span className="text-slate-400 block text-xs">(alt. ∠s, L3 // L4)</span></p>
                            <p style={{ color: COLORS.bottom }}>∠d = {problem.angles[2]}° <span className="text-slate-400 block text-xs">(alt. ∠s, L4 // L2)</span></p>
                          </div>
                          <div className="border-l border-slate-700/50 pl-4 flex flex-col justify-center">
                            <p className="text-white text-lg">y = ∠c + ∠d</p>
                            <p className="text-white text-lg">y = {problem.angles[1]}° + {problem.angles[2]}°</p>
                            <p className="text-yellow-400 font-bold text-2xl border-t border-slate-700/50 pt-2 mt-2">y = {problem.targetY}°</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">開啟「輔助線」並點擊「顯示幾何證明步驟」查看標準作答格式...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;