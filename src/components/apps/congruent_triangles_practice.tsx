import React, { useState, useEffect, useCallback } from 'react';

// --- 數學與幾何輔助函數 ---
const getRandomLetters = (count) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  return alphabet.slice(0, count);
};

// 產生一個不會太扁平的隨機三角形
const generateGoodTriangle = (cx, cy, r) => {
  let attempts = 0;
  while (attempts < 100) {
    let angles = [
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI
    ].sort((a, b) => a - b);
    
    let diff1 = angles[1] - angles[0];
    let diff2 = angles[2] - angles[1];
    let diff3 = angles[0] + 2 * Math.PI - angles[2];
    
    // 確保角度分佈更平均，避免太尖或太扁的三角形
    if (diff1 > 0.8 && diff2 > 0.8 && diff3 > 0.8) {
      return angles.map(a => ({
        x: cx + (r * 0.8 + r * 0.2 * Math.random()) * Math.cos(a),
        y: cy + (r * 0.8 + r * 0.2 * Math.random()) * Math.sin(a)
      }));
    }
    attempts++;
  }
  return [
    { x: cx, y: cy - r },
    { x: cx - r * 0.8, y: cy + r * 0.6 },
    { x: cx + r * 0.8, y: cy + r * 0.6 }
  ];
};

// 計算右側三角形 T2 目前的點位
const getT2Points = (t1Pts, transform) => {
  return t1Pts.map(p => {
    let dx = p.x - 250;
    let dy = p.y - 250;
    dx = dx * transform.scaleX;
    let rx = dx * Math.cos(transform.rotation) - dy * Math.sin(transform.rotation);
    let ry = dx * Math.sin(transform.rotation) + dy * Math.cos(transform.rotation);
    return { x: transform.cx + rx, y: transform.cy + ry };
  });
};

const SYMBOL_COLORS = ['#EF4444', '#10B981', '#8B5CF6'];
const COLOR_NAMES_EN = ['red', 'green', 'purple'];
const COLOR_NAMES_ZH = ['紅色', '綠色', '紫色'];

export default function App() {
  const [score, setScore] = useState(0);
  const [showGuidance, setShowGuidance] = useState(true);
  const [allowTransforms, setAllowTransforms] = useState(true);
  
  const [triangle1, setTriangle1] = useState(null);
  const [t2Letters, setT2Letters] = useState([]);
  const [t2Transform, setT2Transform] = useState({ cx: 750, cy: 250, rotation: 0, scaleX: 1 });
  
  const [questionOrder, setQuestionOrder] = useState([]);
  const [answers, setAnswers] = useState(['', '', '']);
  const [feedback, setFeedback] = useState({ type: '' });
  const [isChecking, setIsChecking] = useState(false);

  const generateProblem = useCallback(() => {
    setIsChecking(false);
    setAnswers(['', '', '']);
    setFeedback({ type: '' });

    const pts1 = generateGoodTriangle(250, 250, 180);
    let rotationAngle = allowTransforms ? (Math.random() * 2 * Math.PI) : 0;
    let sx = allowTransforms ? (Math.random() > 0.5 ? -1 : 1) : 1;
    
    const letters = getRandomLetters(6);
    const l1 = [letters[0], letters[1], letters[2]];
    const l2 = [letters[3], letters[4], letters[5]];
    const order = [0, 1, 2].sort(() => Math.random() - 0.5);

    setTriangle1({ points: pts1, letters: l1 });
    setT2Letters(l2);
    setT2Transform({ cx: 750, cy: 250, rotation: rotationAngle, scaleX: sx });
    setQuestionOrder(order);
  }, [allowTransforms]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleSelect = (index, value) => {
    if (isChecking) return;
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    if (newAnswers.every(ans => ans !== '')) {
      setIsChecking(true);
      const correctAnswers = questionOrder.map(idx => t2Letters[idx]);
      const isCorrect = newAnswers.every((ans, i) => ans === correctAnswers[i]);

      if (isCorrect) {
        setFeedback({ type: 'success' });
        setScore(s => s + 10);
        
        const startTransform = { ...t2Transform };
        const endTransform = { cx: 250, cy: 250, rotation: 0, scaleX: 1 };
        
        let startRot = startTransform.rotation;
        let endRot = 0;
        if (startRot > Math.PI) endRot = 2 * Math.PI;

        let startTime = null;
        const duration = 1500;

        const animate = (time) => {
          if (!startTime) startTime = time;
          const progress = Math.min((time - startTime) / duration, 1);
          const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          setT2Transform({
            cx: startTransform.cx + (endTransform.cx - startTransform.cx) * ease,
            cy: startTransform.cy + (endTransform.cy - startTransform.cy) * ease,
            rotation: startRot + (endRot - startRot) * ease,
            scaleX: startTransform.scaleX + (endTransform.scaleX - startTransform.scaleX) * ease
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setTimeout(() => generateProblem(), 800);
          }
        };
        requestAnimationFrame(animate);

      } else {
        setFeedback({ type: 'error' });
        setTimeout(() => {
          setIsChecking(false);
          setAnswers(['', '', '']);
          setFeedback({ type: '' });
        }, 2000);
      }
    }
  };

  const renderAngleMarks = (p1, center, p2, count, keyPrefix, color) => {
    let a1 = Math.atan2(p1.y - center.y, p1.x - center.x);
    let a2 = Math.atan2(p2.y - center.y, p2.x - center.x);
    let diff = a2 - a1;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    if (Math.abs(diff) < 0.01) return null;

    let dist1 = Math.hypot(p1.x - center.x, p1.y - center.y);
    let dist2 = Math.hypot(p2.x - center.x, p2.y - center.y);
    let minSide = Math.min(dist1, dist2);
    let baseR = Math.min(24, minSide * 0.25);
    let step = Math.min(7, minSide * 0.08);

    const paths = [];
    for (let c = 0; c < count; c++) {
      let r = baseR + c * step; 
      let pts = [];
      for (let i = 0; i <= 10; i++) {
        let angle = a1 + diff * (i / 10);
        pts.push(`${center.x + Math.cos(angle) * r},${center.y + Math.sin(angle) * r}`);
      }
      paths.push(
        <polyline key={`${keyPrefix}-${c}`} points={pts.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      );
    }
    return paths;
  };

  const renderSideMarks = (p1, p2, count, keyPrefix, color) => {
    let midX = (p1.x + p2.x) / 2;
    let midY = (p1.y + p2.y) / 2;
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let len = Math.hypot(dx, dy);
    if (len < 0.1) return null;
    let ux = dx / len;
    let uy = dy / len;
    let nx = -uy;
    let ny = ux;
    const tickLen = Math.min(9, len * 0.15);
    const spacing = Math.min(8, len * 0.12);
    const lines = [];
    let startOffset = -((count - 1) * spacing) / 2;
    for (let c = 0; c < count; c++) {
      let offset = startOffset + c * spacing;
      let cx = midX + offset * ux;
      let cy = midY + offset * uy;
      lines.push(
        <line key={`${keyPrefix}-${c}`} x1={cx + nx * tickLen} y1={cy + ny * tickLen} x2={cx - nx * tickLen} y2={cy - ny * tickLen} stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      );
    }
    return lines;
  };

  const renderSymbols = (pts, isT1) => {
    return pts.map((p, i) => {
      let prev = pts[(i + 2) % 3];
      let next = pts[(i + 1) % 3];
      let markCount = i + 1; 
      let color = SYMBOL_COLORS[i];
      let prefix = isT1 ? `t1-sym-${i}` : `t2-sym-${i}`;
      return (
        <g key={prefix}>
          {renderAngleMarks(prev, p, next, markCount, `${prefix}-arc`, color)}
          {renderSideMarks(p, next, markCount, `${prefix}-tick`, color)}
        </g>
      );
    });
  };

  const renderLabels = (pts, letters) => {
    const cx = pts.reduce((s, pt) => s + pt.x, 0) / 3;
    const cy = pts.reduce((s, pt) => s + pt.y, 0) / 3;
    return pts.map((p, i) => {
      let dx = p.x - cx;
      let dy = p.y - cy;
      let len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.1) return null;
      let lx = p.x + (dx / len) * 36; 
      let ly = p.y + (dy / len) * 36;
      return (
        <text key={`l-${i}`} x={lx} y={ly} fontSize="32" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fill="#1F2937">
          {letters[i]}
        </text>
      );
    });
  };

  const currentStep = answers.findIndex(a => a === '');

  const getDynamicGuidance = () => {
    if (!showGuidance) return null;
    if (currentStep === -1) {
      if (feedback.type === 'success') {
        return { en: "Excellent! Watch them overlap perfectly...", zh: "太棒了！觀察它們如何完美重疊..." };
      } else if (feedback.type === 'error') {
        return { en: "Oops! Some vertices don't match correctly. Let's try again.", zh: "哎呀！有些頂點配對不正確，我們再試一次。" };
      }
      return null;
    }
    let t1Index = questionOrder[currentStep];
    let arcCount = t1Index + 1;
    let targetVertex = triangle1.letters[t1Index];
    let colorEn = COLOR_NAMES_EN[t1Index];
    let colorZh = COLOR_NAMES_ZH[t1Index];
    let colorHex = SYMBOL_COLORS[t1Index];
    return {
      en: (
        <>
          <strong className="text-blue-700">Step {currentStep + 1}:</strong> Look at vertex <strong>{targetVertex}</strong>. 
          It has <strong style={{color: colorHex}}>{arcCount} {colorEn} arc{arcCount > 1 ? 's' : ''}</strong>. 
          Find the letter with <strong style={{color: colorHex}}>{arcCount} {colorEn} arc{arcCount > 1 ? 's' : ''}</strong>!
        </>
      ),
      zh: (
        <>
          <strong className="text-blue-700">第 {currentStep + 1} 步：</strong>觀察頂點 <strong>{targetVertex}</strong>，
          它有 <strong style={{color: colorHex}}>{arcCount} 條{colorZh}弧線</strong>。
          尋找同樣有 <strong style={{color: colorHex}}>{arcCount} 條{colorZh}弧線</strong>的字母！
        </>
      )
    };
  };

  if (!triangle1 || !t2Letters) return <div className="p-10 text-center text-xl">Loading...</div>;

  const pts2 = getT2Points(triangle1.points, t2Transform);
  const t2Options = [...t2Letters].sort();
  const guideInfo = getDynamicGuidance();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans touch-manipulation">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-4">
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-4">
              Congruent Triangles <span className="text-gray-400 font-normal mx-2">|</span> 全等三角形
            </h1>
            <div className="flex flex-wrap items-end text-4xl md:text-5xl font-serif mb-6 tracking-wider text-gray-800 mt-4 md:mt-6 gap-y-4">
              <span className="text-yellow-600 mr-2 mb-2">Δ</span>
              <div className="flex items-end gap-2 md:gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 shadow-sm">
                {answers.map((ans, i) => {
                  const targetLetter = triangle1.letters[questionOrder[i]];
                  const isCurrent = currentStep === i;
                  return (
                    <div key={`ans-block-${i}`} className="flex flex-col items-center">
                      <div className={`font-bold transition-all duration-300 flex flex-col items-center ${isCurrent ? 'text-yellow-600 scale-110' : 'text-gray-400'}`}>
                        <span className="text-3xl">{targetLetter}</span>
                        <svg className={`w-6 h-6 mt-1 mb-1 ${isCurrent ? 'animate-bounce text-yellow-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                      </div>
                      <span className="text-xl mb-1">{ans || ' '}</span>
                    </div>
                  );
                })}
              </div>
              <span className="mb-2 mx-2 md:mx-4 text-gray-600"> ≅ </span>
              <span className="text-blue-500 mr-2 md:mr-3 mb-2">Δ</span>
              <div className="flex items-end gap-2 md:gap-3">
                {answers.map((ans, i) => {
                  const isCurrent = currentStep === i;
                  return (
                    <div key={i} className="relative">
                      <select
                        value={ans}
                        onChange={(e) => handleSelect(i, e.target.value)}
                        disabled={isChecking}
                        className={`appearance-none bg-blue-50 border-4 rounded-2xl px-4 py-3 md:px-6 md:py-4 pr-12 md:pr-14 text-4xl md:text-5xl font-bold text-blue-900 outline-none cursor-pointer transition-all shadow-sm focus:ring-4 focus:ring-blue-200 
                          ${isChecking ? 'opacity-70 cursor-not-allowed' : ''} 
                          ${isCurrent ? 'border-blue-500 bg-blue-100 ring-4 ring-blue-100' : 'border-blue-200'}
                        `}
                      >
                        <option value="" disabled>?</option>
                        {t2Options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-500">
                        <svg className="fill-current h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {guideInfo && (
              <div className={`p-5 rounded-2xl border-2 transition-colors duration-300 shadow-sm mt-4 lg:mt-0 ${feedback.type === 'success' ? 'bg-green-50 border-green-400' : feedback.type === 'error' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-300'}`}>
                <p className="text-2xl text-gray-800 mb-2 font-medium">{guideInfo.en}</p>
                <p className="text-xl text-gray-600">{guideInfo.zh}</p>
              </div>
            )}
          </div>
          <div className="flex flex-row lg:flex-col items-center justify-between w-full lg:w-auto gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
            <div className="text-center w-auto lg:w-full pb-0 lg:pb-4 border-b-0 lg:border-b border-gray-200 pr-6 lg:pr-0 border-r lg:border-r-0">
              <div className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-widest">Score / 分數</div>
              <div className={`text-5xl md:text-6xl font-black mt-1 ${score > 0 ? "text-green-600" : "text-gray-800"}`}>{score}</div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 cursor-pointer group select-none" onClick={() => setShowGuidance(!showGuidance)}>
                <div className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-300 ${showGuidance ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${showGuidance ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-xl text-gray-800">Guidance</span>
                  <span className="text-base text-gray-500">學習指引</span>
                </div>
              </div>
              <div className="flex items-center gap-4 cursor-pointer group select-none" onClick={() => setAllowTransforms(!allowTransforms)}>
                <div className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-300 ${allowTransforms ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${allowTransforms ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-xl text-gray-800">Transforms</span>
                  <span className="text-base text-gray-500">旋轉與翻轉</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full aspect-[2/1] min-h-[400px] max-h-[65vh] bg-white overflow-hidden touch-none">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            <polygon points={triangle1.points.map(p => `${p.x},${p.y}`).join(' ')} fill="#FEF08A" stroke="#CA8A04" strokeWidth="3" strokeLinejoin="round" />
            <polygon points={pts2.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(186, 230, 253, 0.85)" stroke="#0284C7" strokeWidth="3" strokeLinejoin="round" />
            {renderSymbols(triangle1.points, true)}
            {renderSymbols(pts2, false)}
            {currentStep !== -1 && !isChecking && showGuidance && (
              <circle cx={triangle1.points[questionOrder[currentStep]].x} cy={triangle1.points[questionOrder[currentStep]].y} r="45" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="8 8">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${triangle1.points[questionOrder[currentStep]].x} ${triangle1.points[questionOrder[currentStep]].y}`} to={`360 ${triangle1.points[questionOrder[currentStep]].x} ${triangle1.points[questionOrder[currentStep]].y}`} dur="6s" repeatCount="indefinite" />
              </circle>
            )}
            {[...triangle1.points, ...pts2].map((p, i) => (
              <circle key={`pt-${i}`} cx={p.x} cy={p.y} r="6" fill="#1F2937" />
            ))}
            {renderLabels(triangle1.points, triangle1.letters)}
            {renderLabels(pts2, t2Letters)}
          </svg>
        </div>
      </div>
    </div>
  );
}