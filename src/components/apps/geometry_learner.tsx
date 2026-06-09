import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Lightbulb, RefreshCw, BookOpen, X, Layers, Zap, PenTool, Star, Ruler, Sparkles, BrainCircuit, Loader2, Triangle } from 'lucide-react';

const apiKey = "";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

const REASONS = [
  { id: '', text: '-- 請選擇 Reason --' },
  { id: 'adj', text: 'adj. ∠s on st. line' },
  { id: 'pt', text: '∠s at a pt.' },
  { id: 'vert', text: 'vert. opp. ∠s' },
  { id: 'tri', text: '∠ sum of △' },
  { id: 'corr', text: 'corr. ∠s, AB // CD' },
  { id: 'alt', text: 'alt. ∠s, AB // CD' },
  { id: 'int', text: 'int. ∠s, AB // CD' },
  { id: 'ext_tri', text: 'ext. ∠ of △' },
  { id: 'base_isos', text: 'base ∠s, isos. △' }
];

const d2r = (deg) => deg * Math.PI / 180;
const getCot = (deg) => Math.abs(deg - 90) < 0.001 ? 0 : 1 / Math.tan(d2r(deg));

const drawArc = (cx, cy, r, startAngle, endAngle) => {
  const startX = cx + r * Math.cos(d2r(startAngle));
  const startY = cy - r * Math.sin(d2r(startAngle));
  const endX = cx + r * Math.cos(d2r(endAngle));
  const endY = cy - r * Math.sin(d2r(endAngle));
  let largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  if (endAngle < startAngle) largeArcFlag = (startAngle - endAngle) > 180 ? 0 : 1;
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
};

const getLabelPos = (cx, cy, r, a1, a2) => {
  let mid = (a1 + a2) / 2;
  if (a2 < a1) mid = (a1 + 360 + a2) / 2;
  return { x: cx + (r + 18) * Math.cos(d2r(mid)), y: cy - (r + 18) * Math.sin(d2r(mid)) + 6 };
};

const getPosConfig = (posStr, x1, y1, x2, y2, th) => {
  const map = {
    'E_TR': { cx: x1, cy: y1, a1: 0, a2: th },
    'E_TL': { cx: x1, cy: y1, a1: th, a2: 180 },
    'E_BL': { cx: x1, cy: y1, a1: 180, a2: 180+th },
    'E_BR': { cx: x1, cy: y1, a1: 180+th, a2: 360 },
    'F_TR': { cx: x2, cy: y2, a1: 0, a2: th },
    'F_TL': { cx: x2, cy: y2, a1: th, a2: 180 },
    'F_BL': { cx: x2, cy: y2, a1: 180, a2: 180+th },
    'F_BR': { cx: x2, cy: y2, a1: 180+th, a2: 360 },
  };
  return map[posStr];
};

const generateEqOptions = (type, varName, vals, l3Type = null) => {
  let correct, dist1, dist2;
  const v0 = typeof vals[0] === 'number' ? `${vals[0]}°` : vals[0];
  const v1 = vals.length > 1 ? (typeof vals[1] === 'number' ? `${vals[1]}°` : vals[1]) : '';
  if (l3Type === 'l3_corr_split' || l3Type === 'l3_alt_split') {
    correct = `${varName} + ${v1} = ${v0}`; dist1 = `${varName} = ${v0} + ${v1}`; dist2 = `${varName} + ${v1} = 180°`;
  } else if (l3Type === 'l3_int_split') {
    correct = `${varName} + ${v1} + ${v0} = 180°`; dist1 = `${varName} = 180° - ${v0}`; dist2 = `${varName} + ${v1} = ${v0}`;
  } else if (type === 'adj' || type === 'int') {
    correct = `${varName} + ${v0} = 180°`; dist1 = `${varName} = ${v0}`; dist2 = `${varName} + ${v0} = 360°`;
  } else if (['vert', 'corr', 'alt'].includes(type)) {
    correct = `${varName} = ${v0}`; dist1 = `${varName} + ${v0} = 180°`; dist2 = `${varName} + ${v0} = 360°`;
  } else if (type === 'tri') {
    correct = `${varName} + ${v0} + ${v1} = 180°`; dist1 = `${varName} = ${v0} + ${v1}`; dist2 = `${varName} + ${v0} + ${v1} = 360°`;
  } else if (type === 'pt') {
    correct = `${varName} + ${v0} + ${v1} = 360°`; dist1 = `${varName} + ${v0} + ${v1} = 180°`; dist2 = `${varName} = ${v0} + ${v1}`;
  } else if (type === 'ext_tri') {
    correct = `${varName} = ${v0} + ${v1}`; dist1 = `${varName} + ${v0} + ${v1} = 180°`; dist2 = `${varName} + ${v0} = ${v1}`;
  } else if (type === 'base_isos') {
    correct = `2${varName} + ${v0} = 180°`; dist1 = `${varName} + 2(${v0}) = 180°`; dist2 = `${varName} = ${v0}`;
  }
  
  const options = [correct, dist1, dist2].sort(() => Math.random() - 0.5);
  return { ans: correct, options };
};

const UprightText = ({ x, y, rot, className, children, textAnchor="middle" }) => (
  <text x={x} y={y} transform={`rotate(${-rot}, ${x}, ${y})`} className={className} textAnchor={textAnchor}>{children}</text>
);

const FeedbackIcon = ({ status }) => {
  if (status === null) return null;
  return status 
    ? <CheckCircle2 className="text-green-500 shrink-0 ml-2 animate-in fade-in zoom-in" size={20} /> 
    : <XCircle className="text-red-500 shrink-0 ml-2 animate-in fade-in zoom-in" size={20} />;
};

// --- API Utility ---
const callGemini = async (prompt, systemInstruction = "") => {
  let retries = 0;
  const maxRetries = 5;
  const delays = [1000, 2000, 4000, 8000, 16000];

  while (retries <= maxRetries) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retries === maxRetries) return "抱歉，AI 導師目前無法連線，請稍後再試。 (AI connection failed)";
      await new Promise(res => setTimeout(res, delays[retries]));
      retries++;
    }
  }
};

export default function App() {
  const [level, setLevel] = useState(5); 
  const [selectedTopic, setSelectedTopic] = useState('random');
  const [question, setQuestion] = useState(null);
  
  const [userEqX, setUserEqX] = useState('');
  const [userReasonX, setUserReasonX] = useState('');
  const [userX, setUserX] = useState('');
  
  const [userAngleY, setUserAngleY] = useState(''); 
  const [userEqY, setUserEqY] = useState('');
  const [userReasonY, setUserReasonY] = useState('');
  const [userY, setUserY] = useState('');
  
  // Level 5 specific states
  const [userEqZ, setUserEqZ] = useState('');
  const [userReasonZ, setUserReasonZ] = useState('');
  const [userZ, setUserZ] = useState('');
  const [showAuxLine, setShowAuxLine] = useState(false);
  const [hintStep, setHintStep] = useState(0); 
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [completedPaths, setCompletedPaths] = useState([]);

  // AI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState(null);
  const [isAiExpLoading, setIsAiExpLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);

  const generateQuestion = (currentLevel = level, topic = selectedTopic, keepMulti = false) => {
    if (!keepMulti) setCompletedPaths([]);
    let q = {};
    const rot = Math.floor(Math.random() * 40) - 20; 
    if (currentLevel === 1) {
      const types = ['adj', 'pt', 'vert', 'tri', 'corr', 'alt', 'int'];
      const type = (topic !== 'random' && types.includes(topic)) ? topic : types[Math.floor(Math.random() * types.length)];
      let val1, val2, ans;
      if (type === 'adj') { val1 = Math.floor(Math.random() * 120) + 30; ans = 180 - val1; }
      else if (['alt', 'corr', 'vert'].includes(type)) { val1 = Math.floor(Math.random() * 80) + 50; ans = val1; }
      else if (type === 'int') { val1 = Math.floor(Math.random() * 80) + 50; ans = 180 - val1; }
      else if (type === 'tri') { val1 = Math.floor(Math.random() * 50) + 40; val2 = Math.floor(Math.random() * 50) + 40; if (val1 + val2 >= 160) val2 = 160 - val1; ans = 180 - val1 - val2; }
      else if (type === 'pt') { val1 = Math.floor(Math.random() * 70) + 90; val2 = Math.floor(Math.random() * 70) + 90; if (val1 + val2 >= 330) val2 = 330 - val1; ans = 360 - val1 - val2; }
      const eqData = generateEqOptions(type, 'x', [val1, val2].filter(v => v !== undefined));
      q = { type, val1, val2, ans, rot, eqAns: eqData.ans, eqOpts: eqData.options };
      
    } else if (currentLevel === 2) {
      const types = ['l2_adj_corr', 'l2_tri_alt', 'l2_vert_int', 'l2_corr_adj'];
      const type = (topic !== 'random' && types.includes(topic)) ? topic : types[Math.floor(Math.random() * types.length)];
      let val1, val2, yAns, yType, xAns, xType;
      if (type === 'l2_adj_corr') { val1 = Math.floor(Math.random() * 40) + 110; yAns = 180 - val1; yType = 'adj'; xAns = yAns; xType = 'corr'; } 
      else if (type === 'l2_tri_alt') { val1 = Math.floor(Math.random() * 30) + 40; val2 = Math.floor(Math.random() * 30) + 50; yAns = val1; yType = 'alt'; xAns = 180 - yAns - val2; xType = 'tri'; } 
      else if (type === 'l2_vert_int') { val1 = Math.floor(Math.random() * 50) + 50; yAns = val1; yType = 'vert'; xAns = 180 - yAns; xType = 'int'; } 
      else if (type === 'l2_corr_adj') { val1 = Math.floor(Math.random() * 40) + 110; yAns = val1; yType = 'corr'; xAns = 180 - yAns; xType = 'adj'; }
      const yEqData = generateEqOptions(yType, 'y', [val1]);
      const xEqData = generateEqOptions(xType, 'x', ['y', val2].filter(v=>v!==undefined));
      q = { type, val1, val2, yAns, yType, ans: xAns, xType, rot, yEqAns: yEqData.ans, yEqOpts: yEqData.options, xEqAns: xEqData.ans, xEqOpts: xEqData.options };
      
    } else if (currentLevel === 3) {
      const types = ['l3_corr_split', 'l3_alt_split', 'l3_int_split'];
      const type = (topic !== 'random' && types.includes(topic)) ? topic : types[Math.floor(Math.random() * types.length)];
      let val1, val2, ans;
      if (type === 'l3_corr_split' || type === 'l3_alt_split') { val1 = Math.floor(Math.random() * 40) + 70; val2 = Math.floor(Math.random() * (val1 - 40)) + 20; ans = val1 - val2; } 
      else if (type === 'l3_int_split') { val1 = Math.floor(Math.random() * 40) + 100; const rem = 180 - val1; val2 = Math.floor(Math.random() * (rem - 20)) + 10; ans = rem - val2; }
      const eqData = generateEqOptions(type.includes('corr') ? 'corr' : type.includes('alt') ? 'alt' : 'int', 'x', [val1, val2], type);
      q = { type, val1, val2, ans, rot, eqAns: eqData.ans, eqOpts: eqData.options };
    } else if (currentLevel === 4) {
      const val1 = Math.floor(Math.random() * 50) + 50; const targetAns = 180 - val1; 
      const paths = {
        '∠PEA': { pos: 'E_TL', yAns: 180-val1, yType: 'adj', xAns: targetAns, xType: 'corr', yEqData: generateEqOptions('adj', 'y', [val1]), xEqData: generateEqOptions('corr', 'x', ['y']) },
        '∠BEF': { pos: 'E_BR', yAns: 180-val1, yType: 'adj', xAns: targetAns, xType: 'alt', yEqData: generateEqOptions('adj', 'y', [val1]), xEqData: generateEqOptions('alt', 'x', ['y']) },
        '∠AEF': { pos: 'E_BL', yAns: val1, yType: 'vert', xAns: targetAns, xType: 'int', yEqData: generateEqOptions('vert', 'y', [val1]), xEqData: generateEqOptions('int', 'x', ['y']) },
        '∠EFD': { pos: 'F_TR', yAns: val1, yType: 'corr', xAns: targetAns, xType: 'adj', yEqData: generateEqOptions('corr', 'y', [val1]), xEqData: generateEqOptions('adj', 'x', ['y']) }
      };
      const distractors = { '∠PEB': { pos: 'E_TR' }, '∠EFC': { pos: 'F_TL' } };
      q = { type: 'l4_multi', rot, givenAngle: { name: '∠PEB', pos: 'E_TR', val: val1 }, targetAngle: { name: '∠EFC', pos: 'F_TL', ans: targetAns }, paths, distractors, yAngleOpts: [...Object.keys(paths), ...Object.keys(distractors)].sort(() => Math.random() - 0.5) };
    } else if (currentLevel === 5) {
      const types = ['l5_aux_alt', 'l5_aux_int'];
      const type = (topic !== 'random' && types.includes(topic)) ? topic : types[Math.floor(Math.random() * types.length)];
      let val1, val2, yAns, zAns, ans, yType, zType;
      let yEqData, zEqData, xEqData;
      if (type === 'l5_aux_alt') {
        val1 = Math.floor(Math.random() * 40) + 30; // 30-70
        val2 = Math.floor(Math.random() * 40) + 30; // 30-70
        yAns = val1; zAns = val2; ans = yAns + zAns;
        yType = 'alt'; zType = 'alt';
        yEqData = generateEqOptions('alt', 'y', [val1]);
        zEqData = generateEqOptions('alt', 'z', [val2]);
        xEqData = { ans: 'x = y + z', options: ['x = y + z', 'x + y + z = 180°', 'x = y - z'].sort(()=>Math.random()-0.5) };
      } else {
        val1 = Math.floor(Math.random() * 40) + 110; // Obtuse 110-150
        val2 = Math.floor(Math.random() * 40) + 110; // Obtuse 110-150
        yAns = 180 - val1; zAns = 180 - val2; ans = yAns + zAns;
        yType = 'int'; zType = 'int';
        yEqData = generateEqOptions('int', 'y', [val1]);
        zEqData = generateEqOptions('int', 'z', [val2]);
        xEqData = { ans: 'x = y + z', options: ['x = y + z', 'x + y + z = 180°', 'x + y + z = 360°'].sort(()=>Math.random()-0.5) };
      }
      q = { type, rot, val1, val2, yAns, zAns, ans, yType, zType, yEqAns: yEqData.ans, yEqOpts: yEqData.options, zEqAns: zEqData.ans, zEqOpts: zEqData.options, xEqAns: xEqData.ans, xEqOpts: xEqData.options };
    } else if (currentLevel === 6) {
      const types = ['l6_ext_tri', 'l6_base_isos'];
      const type = (topic !== 'random' && types.includes(topic)) ? topic : types[Math.floor(Math.random() * types.length)];
      let val1, val2, ans, eqData, xType;
      if (type === 'l6_ext_tri') {
        val1 = Math.floor(Math.random() * 40) + 30; // int 1
        val2 = Math.floor(Math.random() * 40) + 40; // int 2
        ans = val1 + val2;
        eqData = generateEqOptions('ext_tri', 'x', [val1, val2]);
        xType = 'ext_tri';
      } else if (type === 'l6_base_isos') {
        val1 = Math.floor(Math.random() * 40) * 2 + 40; // vertex 40-118 even
        ans = (180 - val1) / 2;
        eqData = generateEqOptions('base_isos', 'x', [val1]);
        xType = 'base_isos';
      }
      q = { type, val1, val2, ans, rot, eqAns: eqData.ans, eqOpts: eqData.options, xType };
    }
    if (!keepMulti) {
       setQuestion(q);
       resetForms();
    }
  };

  const resetForms = () => {
    setUserX(''); setUserReasonX(''); setUserEqX('');
    setUserY(''); setUserReasonY(''); setUserEqY(''); setUserAngleY('');
    setUserZ(''); setUserReasonZ(''); setUserEqZ('');
    setShowAuxLine(false);
    setHintStep(0);
    setAiHint(null);
    setAiExplanation(null);
  };

  useEffect(() => { generateQuestion(5, 'random'); }, []);

  // --- AI Call Handlers ---
  const handleGetAIHint = async () => {
    if (!question) return;
    setIsAiLoading(true);
    setAiHint(null);
    
    let knownStr = question.val1 + '°';
    if (question.val2) knownStr += ` 和 ${question.val2}°`;

    const sysInstruction = "You are an encouraging Hong Kong secondary school math tutor. Guide the student step-by-step. Keep it concise (1-2 sentences max). Use Traditional Chinese. Never reveal the final numeric answer directly.";
    const userPrompt = `學生目前正在解答一個 Level ${level} 的幾何題（題型標籤：${question.type}）。
已知角度為：${knownStr}。
目標是找出未知角。請根據這個題型給他一個簡短的提示，指出他應該觀察哪些線條（例如直線、平行線、對頂角）或圖形特徵（例如 Z、F、C 型或輔助線）。`;

    const result = await callGemini(userPrompt, sysInstruction);
    setAiHint(result);
    setIsAiLoading(false);
  };

  const handleGetAIExplanation = async () => {
    if (!question) return;
    setIsAiExpLoading(true);
    
    const sysInstruction = "You are a geometry expert teaching Hong Kong secondary students. Use Traditional Chinese. Format output with clear markdown, bullet points, and an encouraging tone.";
    const userPrompt = `學生剛剛成功完成了一題 Level ${level} 的幾何題（題型：${question.type}）。
請提供一個「深度解析」：
1. 解釋這類題型背後的核心幾何原理（例如同位角、錯角、內角和等）。
2. 提供一個簡單有趣的日常生活應用例子（例如建築設計、導航等），說明這些幾何原理在現實中的重要性。`;

    const result = await callGemini(userPrompt, sysInstruction);
    setAiExplanation(result);
    setIsAiExpLoading(false);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    setSelectedTopic('random');
    generateQuestion(newLevel, 'random');
  };
  const handleTopicChange = (e) => {
    const newTopic = e.target.value;
    setSelectedTopic(newTopic);
    generateQuestion(level, newTopic);
  };
  const handleAngleYChange = (e) => {
    setUserAngleY(e.target.value);
    setUserEqY(''); setUserReasonY(''); setUserY('');
    setUserEqX(''); setUserReasonX(''); setUserX('');
  };
  const handleNextSolution = () => {
    setCompletedPaths([...completedPaths, userAngleY]);
    resetForms();
  };

  // --- Real-time Validation Engine ---
  const isL1 = level === 1; const isL2 = level === 2; const isL3 = level === 3; const isL4 = level === 4; const isL5 = level === 5; const isL6 = level === 6;
  let activePath = null;
  let isAngleYWrong = null;
  if (isL4 && userAngleY) {
    if (question?.paths?.[userAngleY]) activePath = question.paths[userAngleY];
    else isAngleYWrong = true;
  }
  // Step 1 Validation (Y)
  const correctEqY = isL4 ? activePath?.yEqData?.ans : question?.yEqAns;
  const correctReasonY = isL4 ? activePath?.yType : (isL5 ? question?.yType : question?.yType);
  const correctValY = isL4 ? activePath?.yAns : question?.yAns;
  const eqYStatus = userEqY ? userEqY === correctEqY : null;
  const reasonYStatus = userReasonY ? userReasonY === correctReasonY : null;
  const valYStatus = userY !== '' ? parseInt(userY) === correctValY : null;
  const isStep1Complete = (!isL2 && !isL4 && !isL5) || ((!isL4 || activePath) && eqYStatus && reasonYStatus && valYStatus);
  // Step 2 Validation (Z - specifically for L5)
  const correctEqZ = question?.zEqAns;
  const correctReasonZ = question?.zType;
  const correctValZ = question?.zAns;
  const eqZStatus = userEqZ ? userEqZ === correctEqZ : null;
  const reasonZStatus = userReasonZ ? userReasonZ === correctReasonZ : null;
  const valZStatus = userZ !== '' ? parseInt(userZ) === correctValZ : null;
  const isStep2L5Complete = isL5 && eqZStatus && reasonZStatus && valZStatus;
  // Step 2 (or 3 for L5) Validation (X)
  const correctEqX = isL4 ? activePath?.xEqData?.ans : (isL5 ? question?.xEqAns : (question?.eqAns || question?.xEqAns));
  const correctReasonX = isL4 ? activePath?.xType : (isL3 ? (question?.type.includes('corr') ? 'corr' : question?.type.includes('alt') ? 'alt' : 'int') : (isL6 ? question?.xType : (question?.xType || question?.type)));
  const correctValX = isL4 ? question?.targetAngle?.ans : question?.ans;
  const eqXStatus = userEqX ? userEqX === correctEqX : null;
  const reasonXStatus = (!isL5 && userReasonX) ? userReasonX === correctReasonX : null; // L5 doesn't need reason for final add
  const valXStatus = userX !== '' ? parseInt(userX) === correctValX : null;
  const isStepXComplete = isL5 ? (eqXStatus && valXStatus) : (eqXStatus && reasonXStatus && valXStatus);
  const isAllComplete = isL5 ? (isStep1Complete && isStep2L5Complete && isStepXComplete) : (isStep1Complete && isStepXComplete);
  
  const renderGeometry = () => {
    if (!question) return null;
    const { type, val1, val2, rot } = question;
    const lineStyle = "stroke-slate-800 stroke-2 fill-none";
    const textStyle = "text-lg font-bold fill-blue-600 font-sans";
    const yTextStyle = "text-xl font-bold fill-emerald-600 font-sans";
    const zTextStyle = "text-xl font-bold fill-teal-600 font-sans";
    const unkTextStyle = "text-xl font-bold fill-red-500 font-sans";
    const highlightStyle = "stroke-yellow-400 stroke-[12] fill-none opacity-60 stroke-linecap-round stroke-linejoin-round";
    const arcStyle = "stroke-blue-500 stroke-[3] fill-blue-500/10";
    const arcStyleY = "stroke-emerald-500 stroke-[3] fill-emerald-500/10";
    const arcStyleX = "stroke-red-500 stroke-[3] fill-red-500/10";
    const cx = 200, cy = 160;

    if (type === 'l6_ext_tri') {
      const h = 120;
      const alpha = val1;
      const gamma = val2;
      const beta = 180 - alpha - gamma;
      
      const ax = cx - 80;
      const ay = cy + 60;
      
      const px = ax + h * getCot(alpha);
      const py = ay - h;
      
      const bx = px + h * getCot(beta);
      const by = ay;
      
      const extX = bx + 80;
      
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && <polygon points={`${ax},${ay} ${bx},${by} ${px},${py}`} className={highlightStyle} />}
            {hintStep > 0 && <line x1={bx} y1={ay} x2={extX} y2={ay} className={highlightStyle} />}
            
            <line x1={ax - 40} y1={ay} x2={extX} y2={ay} className={lineStyle} />
            <line x1={ax} y1={ay} x2={px} y2={py} className={lineStyle} />
            <line x1={px} y1={py} x2={bx} y2={by} className={lineStyle} />
            
            <path d={drawArc(ax, ay, 25, 0, alpha)} className={arcStyle} />
            <UprightText x={getLabelPos(ax, ay, 25, 0, alpha).x} y={getLabelPos(ax, ay, 25, 0, alpha).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            
            <path d={drawArc(px, py, 25, 180+alpha, 360-beta)} className={arcStyle} />
            <UprightText x={getLabelPos(px, py, 25, 180+alpha, 360-beta).x} y={getLabelPos(px, py, 25, 180+alpha, 360-beta).y} rot={rot} className={textStyle}>{val2}°</UprightText>
            
            <path d={drawArc(bx, by, 30, 0, 180-beta)} className={arcStyleX} />
            <UprightText x={getLabelPos(bx, by, 30, 0, 180-beta).x} y={getLabelPos(bx, by, 30, 0, 180-beta).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }

    if (type === 'l6_base_isos') {
      const alpha = (180 - val1) / 2;
      const h = 130;
      const px = cx;
      const py = cy - 60;
      const ax = cx - h * getCot(alpha);
      const ay = py + h;
      const bx = cx + h * getCot(alpha);
      const by = py + h;
      
      const getNormal = (x1,y1,x2,y2, length) => {
         const dx = x2 - x1, dy = y2 - y1;
         const len = Math.hypot(dx, dy);
         return { nx: (-dy / len) * length, ny: (dx / len) * length };
      };
      const n1 = getNormal(px, py, ax, ay, 6);
      const n2 = getNormal(px, py, bx, by, 6);
      const mx1 = (px + ax) / 2, my1 = (py + ay) / 2;
      const mx2 = (px + bx) / 2, my2 = (py + by) / 2;

      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && <polygon points={`${ax},${ay} ${bx},${by} ${px},${py}`} className={highlightStyle} />}
            
            <polygon points={`${ax},${ay} ${bx},${by} ${px},${py}`} className={lineStyle} />
            
            <line x1={mx1+n1.nx} y1={my1+n1.ny} x2={mx1-n1.nx} y2={my1-n1.ny} className="stroke-slate-800 stroke-[3]" />
            <line x1={mx2+n2.nx} y1={my2+n2.ny} x2={mx2-n2.nx} y2={my2-n2.ny} className="stroke-slate-800 stroke-[3]" />
            
            <path d={drawArc(px, py, 25, 180+alpha, 360-alpha)} className={arcStyle} />
            <UprightText x={getLabelPos(px, py, 25, 180+alpha, 360-alpha).x} y={getLabelPos(px, py, 25, 180+alpha, 360-alpha).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            
            <path d={drawArc(bx, by, 30, 180-alpha, 180)} className={arcStyleX} />
            <UprightText x={getLabelPos(bx, by, 30, 180-alpha, 180).x} y={getLabelPos(bx, by, 30, 180-alpha, 180).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }

    if (type.startsWith('l5_aux')) {
      const y1 = 80, cy_m = 160, y2 = 240;
      const th1 = type === 'l5_aux_alt' ? val1 : 180 - val1;
      const th2 = type === 'l5_aux_alt' ? val2 : 180 - val2;
      const ex = 240;
      const px = ex - (cy_m - y1) * getCot(th1);
      const qx = ex - (y2 - cy_m) * getCot(th2);
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {/* Z/C Highlighters */}
            {hintStep === 1 && type === 'l5_aux_alt' && <path d={`M 350 ${y1} L ${px} ${y1} L ${ex} ${cy_m} L 50 ${cy_m}`} className="stroke-emerald-400 stroke-[10] fill-none opacity-40 stroke-linejoin-round" />}
            {hintStep === 1 && type === 'l5_aux_int' && <path d={`M 50 ${y1} L ${px} ${y1} L ${ex} ${cy_m} L 50 ${cy_m}`} className="stroke-emerald-400 stroke-[10] fill-none opacity-40 stroke-linejoin-round" />}
            
            {hintStep === 2 && type === 'l5_aux_alt' && <path d={`M 350 ${y2} L ${qx} ${y2} L ${ex} ${cy_m} L 50 ${cy_m}`} className="stroke-teal-400 stroke-[10] fill-none opacity-40 stroke-linejoin-round" />}
            {hintStep === 2 && type === 'l5_aux_int' && <path d={`M 50 ${y2} L ${qx} ${y2} L ${ex} ${cy_m} L 50 ${cy_m}`} className="stroke-teal-400 stroke-[10] fill-none opacity-40 stroke-linejoin-round" />}
            {/* Base lines */}
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} />
            <line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} />
            <line x1={px} y1={y1} x2={ex} y2={cy_m} className={lineStyle} />
            <line x1={qx} y1={y2} x2={ex} y2={cy_m} className={lineStyle} />
            <path d="M 310 75 L 320 80 L 310 85" className={lineStyle} />
            <path d="M 310 235 L 320 240 L 310 245" className={lineStyle} />
            <UprightText x={35} y={y1+5} rot={rot} className="text-slate-500 font-semibold">A</UprightText>
            <UprightText x={360} y={y1+5} rot={rot} className="text-slate-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-slate-500 font-semibold">C</UprightText>
            <UprightText x={360} y={y2+5} rot={rot} className="text-slate-500 font-semibold">D</UprightText>
            <UprightText x={ex+20} y={cy_m+5} rot={rot} className="text-slate-800 font-bold">E</UprightText>
            {/* Aux Line */}
            {showAuxLine && (
               <>
                 <line x1="50" y1={cy_m} x2="350" y2={cy_m} className="stroke-indigo-500 stroke-2 stroke-dasharray-4 opacity-70" />
                 <path d="M 310 155 L 320 160 L 310 165" className="stroke-indigo-500 stroke-2 fill-none opacity-70" />
                 <UprightText x={35} y={cy_m+5} rot={rot} className="text-indigo-500 font-semibold">M</UprightText>
                 <UprightText x={360} y={cy_m+5} rot={rot} className="text-indigo-500 font-semibold">N</UprightText>
               </>
            )}
            {/* Top given */}
            {type === 'l5_aux_alt' ? (
              <><path d={drawArc(px, y1, 25, 360-th1, 360)} className={arcStyle} /><UprightText x={getLabelPos(px, y1, 25, 360-th1, 360).x} y={getLabelPos(px, y1, 25, 360-th1, 360).y} rot={rot} className={textStyle}>{val1}°</UprightText></>
            ) : (
              <><path d={drawArc(px, y1, 25, 180, 360-th1)} className={arcStyle} /><UprightText x={getLabelPos(px, y1, 25, 180, 360-th1).x} y={getLabelPos(px, y1, 25, 180, 360-th1).y} rot={rot} className={textStyle}>{val1}°</UprightText></>
            )}
            {/* Bottom given */}
            {type === 'l5_aux_alt' ? (
              <><path d={drawArc(qx, y2, 25, 0, th2)} className={arcStyle} /><UprightText x={getLabelPos(qx, y2, 25, 0, th2).x} y={getLabelPos(qx, y2, 25, 0, th2).y} rot={rot} className={textStyle}>{val2}°</UprightText></>
            ) : (
              <><path d={drawArc(qx, y2, 25, th2, 180)} className={arcStyle} /><UprightText x={getLabelPos(qx, y2, 25, th2, 180).x} y={getLabelPos(qx, y2, 25, th2, 180).y} rot={rot} className={textStyle}>{val2}°</UprightText></>
            )}
            {/* Target x (Full angle at E) */}
            {!showAuxLine && (
              <>
                 <path d={drawArc(ex, cy_m, 25, 180-th1, 180+th2)} className={arcStyleX} />
                 <UprightText x={getLabelPos(ex, cy_m, 25, 180-th1, 180+th2).x} y={getLabelPos(ex, cy_m, 25, 180-th1, 180+th2).y} rot={rot} className={unkTextStyle}>x</UprightText>
              </>
            )}
            {/* Split angles y and z */}
            {showAuxLine && (
               <>
                  <path d={drawArc(ex, cy_m, 25, 180-th1, 180)} className={arcStyleY} />
                  <UprightText x={getLabelPos(ex, cy_m, 25, 180-th1, 180).x} y={getLabelPos(ex, cy_m, 25, 180-th1, 180).y} rot={rot} className={yTextStyle}>y</UprightText>
                  
                  <path d={drawArc(ex, cy_m, 25, 180, 180+th2)} className="stroke-teal-500 stroke-[3] fill-teal-500/10" />
                  <UprightText x={getLabelPos(ex, cy_m, 25, 180, 180+th2).x} y={getLabelPos(ex, cy_m, 25, 180, 180+th2).y} rot={rot} className={zTextStyle}>z</UprightText>
               </>
            )}
          </g>
        </svg>
      )
    }
    if (type === 'adj') {
      const lY = 220; const eX = cx + 150 * Math.cos(d2r(val1)); const eY = lY - 150 * Math.sin(d2r(val1));
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && <path d={`M 50 ${lY} L 350 ${lY} M ${cx} ${lY} L ${eX} ${eY}`} className={highlightStyle} />}
            <line x1="50" y1={lY} x2="350" y2={lY} className={lineStyle} /><line x1={cx} y1={lY} x2={eX} y2={eY} className={lineStyle} />
            <path d={drawArc(cx, lY, 30, 0, val1)} className={arcStyle} /><path d={drawArc(cx, lY, 30, val1, 180)} className={arcStyleX} />
            <circle cx={cx} cy={lY} r="4" fill="#1e293b" />
            <UprightText x={getLabelPos(cx, lY, 30, 0, val1).x} y={getLabelPos(cx, lY, 30, 0, val1).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            <UprightText x={getLabelPos(cx, lY, 30, val1, 180).x} y={getLabelPos(cx, lY, 30, val1, 180).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }
    if (type === 'vert') {
      const a1 = 20, a2 = 20 + val1;
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && <path d={`M ${cx-150*Math.cos(d2r(a1))} ${cy+150*Math.sin(d2r(a1))} L ${cx+150*Math.cos(d2r(a1))} ${cy-150*Math.sin(d2r(a1))} M ${cx-150*Math.cos(d2r(a2))} ${cy+150*Math.sin(d2r(a2))} L ${cx+150*Math.cos(d2r(a2))} ${cy-150*Math.sin(d2r(a2))}`} className={highlightStyle} />}
            <line x1={cx-150*Math.cos(d2r(a1))} y1={cy+150*Math.sin(d2r(a1))} x2={cx+150*Math.cos(d2r(a1))} y2={cy-150*Math.sin(d2r(a1))} className={lineStyle} />
            <line x1={cx-150*Math.cos(d2r(a2))} y1={cy+150*Math.sin(d2r(a2))} x2={cx+150*Math.cos(d2r(a2))} y2={cy-150*Math.sin(d2r(a2))} className={lineStyle} />
            <path d={drawArc(cx, cy, 35, a1, a2)} className={arcStyle} /><path d={drawArc(cx, cy, 35, a1+180, a2+180)} className={arcStyleX} />
            <UprightText x={getLabelPos(cx, cy, 35, a1, a2).x} y={getLabelPos(cx, cy, 35, a1, a2).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            <UprightText x={getLabelPos(cx, cy, 35, a1+180, a2+180).x} y={getLabelPos(cx, cy, 35, a1+180, a2+180).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }
    if (type === 'tri') {
      const c = 120 * (getCot(val1) + getCot(val2)); 
      const ax = cx - c/2, bx = cx + c/2, px = ax + 120 * getCot(val1), py = 220 - 120;
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && <polygon points={`${ax},220 ${bx},220 ${px},${py}`} className={highlightStyle} />}
            <polygon points={`${ax},220 ${bx},220 ${px},${py}`} className={lineStyle} />
            <path d={drawArc(ax, 220, 25, 0, val1)} className={arcStyle} /><path d={drawArc(bx, 220, 25, 180-val2, 180)} className={arcStyle} /><path d={drawArc(px, py, 25, 180+val1, 360-val2)} className={arcStyleX} />
            <UprightText x={getLabelPos(ax, 220, 25, 0, val1).x} y={getLabelPos(ax, 220, 25, 0, val1).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            <UprightText x={getLabelPos(bx, 220, 25, 180-val2, 180).x} y={getLabelPos(bx, 220, 25, 180-val2, 180).y} rot={rot} className={textStyle}>{val2}°</UprightText>
            <UprightText x={getLabelPos(px, py, 25, 180+val1, 360-val2).x} y={getLabelPos(px, py, 25, 180+val1, 360-val2).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }
    if (['alt', 'corr', 'int', 'pt'].includes(type)) {
      if (type === 'pt') {
        return (
          <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
            <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
              {hintStep > 0 && <circle cx={cx} cy={cy} r="35" className={highlightStyle} />}
              <line x1={cx} y1={cy} x2={cx+150} y2={cy} className={lineStyle} /><line x1={cx} y1={cy} x2={cx+150*Math.cos(d2r(val1))} y2={cy-150*Math.sin(d2r(val1))} className={lineStyle} /><line x1={cx} y1={cy} x2={cx+150*Math.cos(d2r(val1+val2))} y2={cy-150*Math.sin(d2r(val1+val2))} className={lineStyle} />
              <path d={drawArc(cx, cy, 35, 0, val1)} className={arcStyle} /><path d={drawArc(cx, cy, 35, val1, val1+val2)} className={arcStyle} /><path d={drawArc(cx, cy, 35, val1+val2, 360)} className={arcStyleX} /><circle cx={cx} cy={cy} r="4" fill="#1e293b" />
              <UprightText x={getLabelPos(cx, cy, 35, 0, val1).x} y={getLabelPos(cx, cy, 35, 0, val1).y} rot={rot} className={textStyle}>{val1}°</UprightText>
              <UprightText x={getLabelPos(cx, cy, 35, val1, val1+val2).x} y={getLabelPos(cx, cy, 35, val1, val1+val2).y} rot={rot} className={textStyle}>{val2}°</UprightText>
              <UprightText x={getLabelPos(cx, cy, 35, val1+val2, 360).x} y={getLabelPos(cx, cy, 35, val1+val2, 360).y} rot={rot} className={unkTextStyle}>x</UprightText>
            </g>
          </svg>
        )
      }
      const y1 = 100, y2 = 220, th = val1;
      const x1 = cx + 60 * getCot(th), x2 = cx - 60 * getCot(th);
      const e1x = x1 + 60 * Math.cos(d2r(th)), e1y = y1 - 60 * Math.sin(d2r(th));
      const e2x = x2 - 60 * Math.cos(d2r(th)), e2y = y2 + 60 * Math.sin(d2r(th));
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && type === 'alt' && <path d={`M ${x1-120} ${y1} L ${x1} ${y1} L ${x2} ${y2} L ${x2+120} ${y2}`} className={highlightStyle} />}
            {hintStep > 0 && type === 'corr' && <path d={`M ${x1 + 30*getCot(th)} ${y1 - 30} L ${x2 - 30*getCot(th)} ${y2 + 30} M ${x1} ${y1} L ${x1+120} ${y1} M ${x2} ${y2} L ${x2+120} ${y2}`} className={highlightStyle} />}
            {hintStep > 0 && type === 'int' && <path d={`M ${x1+120} ${y1} L ${x1} ${y1} L ${x2} ${y2} L ${x2+120} ${y2}`} className={highlightStyle} />}
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} /><line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} /><line x1={e1x} y1={e1y} x2={e2x} y2={e2y} className={lineStyle} />
            <path d="M 310 95 L 320 100 L 310 105" className={lineStyle} /><path d="M 310 215 L 320 220 L 310 225" className={lineStyle} />
            <UprightText x={35} y={y1+5} rot={rot} className="text-gray-500 font-semibold">A</UprightText><UprightText x={360} y={y1+5} rot={rot} className="text-gray-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-gray-500 font-semibold">C</UprightText><UprightText x={360} y={y2+5} rot={rot} className="text-gray-500 font-semibold">D</UprightText>
            <path d={drawArc(x2, y2, 25, 0, th)} className={arcStyle} /><UprightText x={getLabelPos(x2, y2, 25, 0, th).x} y={getLabelPos(x2, y2, 25, 0, th).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            {type === 'alt' && <><path d={drawArc(x1, y1, 25, 180, 180+th)} className={arcStyleX} /><UprightText x={getLabelPos(x1, y1, 25, 180, 180+th).x} y={getLabelPos(x1, y1, 25, 180, 180+th).y} rot={rot} className={unkTextStyle}>x</UprightText></>}
            {type === 'corr' && <><path d={drawArc(x1, y1, 25, 0, th)} className={arcStyleX} /><UprightText x={getLabelPos(x1, y1, 25, 0, th).x} y={getLabelPos(x1, y1, 25, 0, th).y} rot={rot} className={unkTextStyle}>x</UprightText></>}
            {type === 'int' && <><path d={drawArc(x1, y1, 25, 180+th, 360)} className={arcStyleX} /><UprightText x={getLabelPos(x1, y1, 25, 180+th, 360).x} y={getLabelPos(x1, y1, 25, 180+th, 360).y} rot={rot} className={unkTextStyle}>x</UprightText></>}
          </g>
        </svg>
      );
    }
    if (['l2_adj_corr', 'l2_corr_adj'].includes(type)) {
      const y1 = 100, y2 = 220, th = 180 - val1; 
      const x1 = cx + 60 * getCot(th), x2 = cx - 60 * getCot(th);
      const e1x = x1 + 80 * Math.cos(d2r(th)), e1y = y1 - 80 * Math.sin(d2r(th));
      const e2x = x2 - 80 * Math.cos(d2r(th)), e2y = y2 + 80 * Math.sin(d2r(th));
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep === 1 && type === 'l2_adj_corr' && <path d={`M 50 ${y1} L 350 ${y1} M ${x1} ${y1} L ${e1x} ${e1y}`} className="stroke-indigo-400 stroke-[10] fill-none opacity-40" />}
            {hintStep === 2 && type === 'l2_adj_corr' && <path d={`M ${x1 + 30*getCot(th)} ${y1 - 30} L ${x2 - 30*getCot(th)} ${y2 + 30} M ${x1} ${y1} L ${x1+120} ${y1} M ${x2} ${y2} L ${x2+120} ${y2}`} className="stroke-yellow-400 stroke-[10] fill-none opacity-60" />}
            {hintStep === 1 && type === 'l2_corr_adj' && <path d={`M ${x1 - 120} ${y1} L ${x1} ${y1} L ${x2 + 30*getCot(th)} ${y2 - 30} M ${x2 - 120} ${y2} L ${x2} ${y2}`} className="stroke-indigo-400 stroke-[10] fill-none opacity-40" />}
            {hintStep === 2 && type === 'l2_corr_adj' && <path d={`M 50 ${y2} L 350 ${y2} M ${x2} ${y2} L ${e2x} ${e2y}`} className="stroke-yellow-400 stroke-[10] fill-none opacity-60" />}
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} /><line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} /><line x1={e1x} y1={e1y} x2={e2x} y2={e2y} className={lineStyle} />
            <path d="M 310 95 L 320 100 L 310 105" className={lineStyle} /><path d="M 310 215 L 320 220 L 310 225" className={lineStyle} />
            <UprightText x={35} y={y1+5} rot={rot} className="text-gray-500 font-semibold">A</UprightText><UprightText x={360} y={y1+5} rot={rot} className="text-gray-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-gray-500 font-semibold">C</UprightText><UprightText x={360} y={y2+5} rot={rot} className="text-gray-500 font-semibold">D</UprightText>
            {type === 'l2_adj_corr' ? (
              <><path d={drawArc(x1, y1, 25, th, 180)} className={arcStyle} /><UprightText x={getLabelPos(x1, y1, 25, th, 180).x} y={getLabelPos(x1, y1, 25, th, 180).y} rot={rot} className={textStyle}>{val1}°</UprightText>
                <path d={drawArc(x1, y1, 25, 0, th)} className={arcStyleY} /><UprightText x={getLabelPos(x1, y1, 25, 0, th).x} y={getLabelPos(x1, y1, 25, 0, th).y} rot={rot} className={yTextStyle}>y</UprightText>
                <path d={drawArc(x2, y2, 25, 0, th)} className={arcStyleX} /><UprightText x={getLabelPos(x2, y2, 25, 0, th).x} y={getLabelPos(x2, y2, 25, 0, th).y} rot={rot} className={unkTextStyle}>x</UprightText></>
            ) : (
              <><path d={drawArc(x1, y1, 25, th, 180)} className={arcStyle} /><UprightText x={getLabelPos(x1, y1, 25, th, 180).x} y={getLabelPos(x1, y1, 25, th, 180).y} rot={rot} className={textStyle}>{val1}°</UprightText>
                <path d={drawArc(x2, y2, 25, th, 180)} className={arcStyleY} /><UprightText x={getLabelPos(x2, y2, 25, th, 180).x} y={getLabelPos(x2, y2, 25, th, 180).y} rot={rot} className={yTextStyle}>y</UprightText>
                <path d={drawArc(x2, y2, 25, 0, th)} className={arcStyleX} /><UprightText x={getLabelPos(x2, y2, 25, 0, th).x} y={getLabelPos(x2, y2, 25, 0, th).y} rot={rot} className={unkTextStyle}>x</UprightText></>
            )}
          </g>
        </svg>
      );
    }
    if (type === 'l2_vert_int') {
      const y1 = 100, y2 = 220, th = val1; 
      const x1 = cx + 60 * getCot(th), x2 = cx - 60 * getCot(th);
      const e1x = x1 + 80 * Math.cos(d2r(th)), e1y = y1 - 80 * Math.sin(d2r(th));
      const e2x = x2 - 80 * Math.cos(d2r(th)), e2y = y2 + 80 * Math.sin(d2r(th));
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep === 1 && <path d={`M ${x1-80*Math.cos(d2r(th))} ${y1+80*Math.sin(d2r(th))} L ${x1+80*Math.cos(d2r(th))} ${y1-80*Math.sin(d2r(th))} M ${x1-120} ${y1} L ${x1+120} ${y1}`} className="stroke-indigo-400 stroke-[10] fill-none opacity-40" />}
            {hintStep === 2 && <path d={`M ${x1-120} ${y1} L ${x1} ${y1} L ${x2} ${y2} L ${x2-120} ${y2}`} className="stroke-yellow-400 stroke-[10] fill-none opacity-60" />}
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} /><line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} /><line x1={e1x} y1={e1y} x2={e2x} y2={e2y} className={lineStyle} />
            <path d="M 310 95 L 320 100 L 310 105" className={lineStyle} /><path d="M 310 215 L 320 220 L 310 225" className={lineStyle} />
            <UprightText x={35} y={y1+5} rot={rot} className="text-gray-500 font-semibold">A</UprightText><UprightText x={360} y={y1+5} rot={rot} className="text-gray-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-gray-500 font-semibold">C</UprightText><UprightText x={360} y={y2+5} rot={rot} className="text-gray-500 font-semibold">D</UprightText>
            <path d={drawArc(x1, y1, 25, 0, th)} className={arcStyle} /><UprightText x={getLabelPos(x1, y1, 25, 0, th).x} y={getLabelPos(x1, y1, 25, 0, th).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            <path d={drawArc(x1, y1, 25, 180, 180+th)} className={arcStyleY} /><UprightText x={getLabelPos(x1, y1, 25, 180, 180+th).x} y={getLabelPos(x1, y1, 25, 180, 180+th).y} rot={rot} className={yTextStyle}>y</UprightText>
            <path d={drawArc(x2, y2, 25, th, 180)} className={arcStyleX} /><UprightText x={getLabelPos(x2, y2, 25, th, 180).x} y={getLabelPos(x2, y2, 25, th, 180).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }
    if (type === 'l2_tri_alt') {
      const y1 = 100, y2 = 220, h = y2 - y1;
      const ax = cx, ay = y1, bx = ax - h * getCot(val1), by = y2, cx_pt = ax + h * getCot(val2), cy_pt = y2;
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep === 1 && <path d={`M ${ax-120} ${ay} L ${ax} ${ay} L ${bx} ${by} L ${bx+120} ${by}`} className="stroke-indigo-400 stroke-[10] fill-none opacity-40 stroke-linejoin-round" />}
            {hintStep === 2 && <polygon points={`${ax},${ay} ${bx},${by} ${cx_pt},${cy_pt}`} className="stroke-yellow-400 stroke-[10] fill-none opacity-60 stroke-linejoin-round" />}
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} /><line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} />
            <polygon points={`${ax},${ay} ${bx},${by} ${cx_pt},${cy_pt}`} className={lineStyle} />
            <path d="M 310 95 L 320 100 L 310 105" className={lineStyle} /><path d="M 310 215 L 320 220 L 310 225" className={lineStyle} />
            <UprightText x={35} y={y1+5} rot={rot} className="text-gray-500 font-semibold">A</UprightText><UprightText x={360} y={y1+5} rot={rot} className="text-gray-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-gray-500 font-semibold">C</UprightText><UprightText x={360} y={y2+5} rot={rot} className="text-gray-500 font-semibold">D</UprightText>
            <path d={drawArc(ax, ay, 25, 180, 180+val1)} className={arcStyle} /><UprightText x={getLabelPos(ax, ay, 25, 180, 180+val1).x} y={getLabelPos(ax, ay, 25, 180, 180+val1).y} rot={rot} className={textStyle}>{val1}°</UprightText>
            <path d={drawArc(cx_pt, cy_pt, 25, 180-val2, 180)} className={arcStyle} /><UprightText x={getLabelPos(cx_pt, cy_pt, 25, 180-val2, 180).x} y={getLabelPos(cx_pt, cy_pt, 25, 180-val2, 180).y} rot={rot} className={textStyle}>{val2}°</UprightText>
            <path d={drawArc(bx, by, 25, 0, val1)} className={arcStyleY} /><UprightText x={getLabelPos(bx, by, 25, 0, val1).x} y={getLabelPos(bx, by, 25, 0, val1).y} rot={rot} className={yTextStyle}>y</UprightText>
            <path d={drawArc(ax, ay, 25, 180+val1, 360-val2)} className={arcStyleX} /><UprightText x={getLabelPos(ax, ay, 25, 180+val1, 360-val2).x} y={getLabelPos(ax, ay, 25, 180+val1, 360-val2).y} rot={rot} className={unkTextStyle}>x</UprightText>
          </g>
        </svg>
      );
    }
    if (['l3_corr_split', 'l3_alt_split', 'l3_int_split'].includes(type)) {
      const y1 = 100, y2 = 220; let th = type === 'l3_int_split' ? 60 : val1; 
      const x1 = cx + 60 * getCot(th), x2 = cx - 60 * getCot(th);
      const e1x = x1 + 60 * Math.cos(d2r(th)), e1y = y1 - 60 * Math.sin(d2r(th));
      const e2x = x2 - 60 * Math.cos(d2r(th)), e2y = y2 + 60 * Math.sin(d2r(th));
      const splitL = 100; const sx = x2 + splitL * Math.cos(d2r(val2)), sy = y2 - splitL * Math.sin(d2r(val2));
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep > 0 && type === 'l3_corr_split' && <path d={`M ${x1 + 30*getCot(th)} ${y1 - 30} L ${x2 - 30*getCot(th)} ${y2 + 30} M ${x1} ${y1} L ${x1+120} ${y1} M ${x2} ${y2} L ${x2+120} ${y2}`} className={highlightStyle} />}
            {hintStep > 0 && type === 'l3_alt_split' && <path d={`M ${x1-120} ${y1} L ${x1} ${y1} L ${x2} ${y2} L ${x2+120} ${y2}`} className={highlightStyle} />}
            {hintStep > 0 && type === 'l3_int_split' && <path d={`M ${x1+120} ${y1} L ${x1} ${y1} L ${x2} ${y2} L ${x2+120} ${y2}`} className={highlightStyle} />}
            
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} /><line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} />
            <line x1={e1x} y1={e1y} x2={e2x} y2={e2y} className={lineStyle} />
            <path d="M 310 95 L 320 100 L 310 105" className={lineStyle} /><path d="M 310 215 L 320 220 L 310 225" className={lineStyle} />
            <line x1={x2} y1={y2} x2={sx} y2={sy} className="stroke-slate-500 stroke-2 fill-none stroke-dasharray-4" /> 
            <UprightText x={35} y={y1+5} rot={rot} className="text-gray-500 font-semibold">A</UprightText><UprightText x={360} y={y1+5} rot={rot} className="text-gray-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-gray-500 font-semibold">C</UprightText><UprightText x={360} y={y2+5} rot={rot} className="text-gray-500 font-semibold">D</UprightText>
            
            {type === 'l3_corr_split' && (
              <>
                <path d={drawArc(x1, y1, 25, 0, th)} className={arcStyle} /><UprightText x={getLabelPos(x1, y1, 25, 0, th).x} y={getLabelPos(x1, y1, 25, 0, th).y} rot={rot} className={textStyle}>{val1}°</UprightText>
                <path d={drawArc(x2, y2, 35, 0, val2)} className={arcStyle} /><UprightText x={getLabelPos(x2, y2, 35, 0, val2).x} y={getLabelPos(x2, y2, 35, 0, val2).y} rot={rot} className={textStyle}>{val2}°</UprightText>
                <path d={drawArc(x2, y2, 35, val2, th)} className={arcStyleX} /><UprightText x={getLabelPos(x2, y2, 35, val2, th).x} y={getLabelPos(x2, y2, 35, val2, th).y} rot={rot} className={unkTextStyle}>x</UprightText>
              </>
            )}
            {type === 'l3_alt_split' && (
              <>
                <path d={drawArc(x1, y1, 25, 180, 180+th)} className={arcStyle} /><UprightText x={getLabelPos(x1, y1, 25, 180, 180+th).x} y={getLabelPos(x1, y1, 25, 180, 180+th).y} rot={rot} className={textStyle}>{val1}°</UprightText>
                <path d={drawArc(x2, y2, 35, 0, val2)} className={arcStyle} /><UprightText x={getLabelPos(x2, y2, 35, 0, val2).x} y={getLabelPos(x2, y2, 35, 0, val2).y} rot={rot} className={textStyle}>{val2}°</UprightText>
                <path d={drawArc(x2, y2, 35, val2, th)} className={arcStyleX} /><UprightText x={getLabelPos(x2, y2, 35, val2, th).x} y={getLabelPos(x2, y2, 35, val2, th).y} rot={rot} className={unkTextStyle}>x</UprightText>
              </>
            )}
            {type === 'l3_int_split' && (
              <>
                <path d={drawArc(x1, y1, 25, 180+th, 360)} className={arcStyle} /><UprightText x={getLabelPos(x1, y1, 25, 180+th, 360).x} y={getLabelPos(x1, y1, 25, 180+th, 360).y} rot={rot} className={textStyle}>{val1}°</UprightText>
                <path d={drawArc(x2, y2, 35, 0, val2)} className={arcStyle} /><UprightText x={getLabelPos(x2, y2, 35, 0, val2).x} y={getLabelPos(x2, y2, 35, 0, val2).y} rot={rot} className={textStyle}>{val2}°</UprightText>
                <path d={drawArc(x2, y2, 35, val2, th)} className={arcStyleX} /><UprightText x={getLabelPos(x2, y2, 35, val2, th).x} y={getLabelPos(x2, y2, 35, val2, th).y} rot={rot} className={unkTextStyle}>x</UprightText>
              </>
            )}
          </g>
        </svg>
      );
    }
    if (type === 'l4_multi') {
      const y1 = 100, y2 = 220, th = question.givenAngle.val;
      const x1 = cx + 60 * getCot(th), x2 = cx - 60 * getCot(th);
      const e1x = x1 + 80 * Math.cos(d2r(th)), e1y = y1 - 80 * Math.sin(d2r(th));
      const e2x = x2 - 80 * Math.cos(d2r(th)), e2y = y2 + 80 * Math.sin(d2r(th));
      
      const givenCfg = getPosConfig(question.givenAngle.pos, x1, y1, x2, y2, th);
      const targetCfg = getPosConfig(question.targetAngle.pos, x1, y1, x2, y2, th);
      let yCfg = null;
      if (userAngleY) {
        if (question.paths?.[userAngleY]) yCfg = getPosConfig(question.paths[userAngleY].pos, x1, y1, x2, y2, th);
        else if (question.distractors?.[userAngleY]) yCfg = getPosConfig(question.distractors[userAngleY].pos, x1, y1, x2, y2, th);
      }
      return (
        <svg viewBox="-50 -50 500 400" className="w-full h-full overflow-visible">
          <g transform={`rotate(${rot}, ${cx}, ${cy})`}>
            {hintStep === 1 && yCfg && <path d={`M ${cx} ${y1} L ${cx} ${y1}`} className="stroke-indigo-400 stroke-[10] fill-none opacity-40" /> }
            {hintStep === 2 && yCfg && <path d={`M ${cx} ${y1} L ${cx} ${y1}`} className="stroke-yellow-400 stroke-[10] fill-none opacity-60" />}
            <line x1="50" y1={y1} x2="350" y2={y1} className={lineStyle} /><line x1="50" y1={y2} x2="350" y2={y2} className={lineStyle} /><line x1={e1x} y1={e1y} x2={e2x} y2={e2y} className={lineStyle} />
            <path d="M 310 95 L 320 100 L 310 105" className={lineStyle} /><path d="M 310 215 L 320 220 L 310 225" className={lineStyle} />
            
            <UprightText x={35} y={y1+5} rot={rot} className="text-slate-500 font-semibold">A</UprightText><UprightText x={360} y={y1+5} rot={rot} className="text-slate-500 font-semibold">B</UprightText>
            <UprightText x={35} y={y2+5} rot={rot} className="text-slate-500 font-semibold">C</UprightText><UprightText x={360} y={y2+5} rot={rot} className="text-slate-500 font-semibold">D</UprightText>
            
            <UprightText x={x1-20} y={y1-15} rot={rot} className="text-slate-800 font-bold text-base">E</UprightText><UprightText x={x2-20} y={y2+25} rot={rot} className="text-slate-800 font-bold text-base">F</UprightText>
            <UprightText x={e1x+15} y={e1y} rot={rot} className="text-slate-800 font-bold text-base">P</UprightText>
            <UprightText x={e2x-15} y={e2y+15} rot={rot} className="text-slate-800 font-bold text-base">Q</UprightText>
            <circle cx={x1} cy={y1} r="3" className="fill-slate-800" /><circle cx={x2} cy={y2} r="3" className="fill-slate-800" />
            
            <path d={drawArc(givenCfg.cx, givenCfg.cy, 25, givenCfg.a1, givenCfg.a2)} className={arcStyle} />
            <UprightText x={getLabelPos(givenCfg.cx, givenCfg.cy, 25, givenCfg.a1, givenCfg.a2).x} y={getLabelPos(givenCfg.cx, givenCfg.cy, 25, givenCfg.a1, givenCfg.a2).y} rot={rot} className={textStyle}>{question.givenAngle.val}°</UprightText>
            
            <path d={drawArc(targetCfg.cx, targetCfg.cy, 25, targetCfg.a1, targetCfg.a2)} className={arcStyleX} />
            <UprightText x={getLabelPos(targetCfg.cx, targetCfg.cy, 25, targetCfg.a1, targetCfg.a2).x} y={getLabelPos(targetCfg.cx, targetCfg.cy, 25, targetCfg.a1, targetCfg.a2).y} rot={rot} className={unkTextStyle}>x</UprightText>
            {yCfg && (
              <>
                <path d={drawArc(yCfg.cx, yCfg.cy, 25, yCfg.a1, yCfg.a2)} className={isAngleYWrong ? arcStyleX : arcStyleY} />
                <UprightText x={getLabelPos(yCfg.cx, yCfg.cy, 25, yCfg.a1, yCfg.a2).x} y={getLabelPos(yCfg.cx, yCfg.cy, 25, yCfg.a1, yCfg.a2).y} rot={rot} className={isAngleYWrong ? unkTextStyle : yTextStyle}>y</UprightText>
              </>
            )}
          </g>
        </svg>
      );
    }
  };

  const renderHintText = () => {
    if (hintStep === 0 || !question) return null;
    let text = "";
    if (level === 1) text = `圖解提示：對應你選擇的 Reason，看看高亮的形狀和方程！`;
    else if (level === 2) {
      if (hintStep === 1) text = `Step 1 提示：先看藍色部分找出 y。`;
      if (hintStep === 2) text = `Step 2 提示：再看黃色部分，利用剛才的 y 求 x！`;
    } else if (level === 3) text = `陷阱提示：請無視中間的虛線！把 x 和 ${question.val2}° 合併看作一個整體大角，就能看到完整的 F / Z / C 幾何形狀啦！`;
    else if (level === 4) {
      if (hintStep === 1) text = `Step 1 提示：你可以試著設定同位角、錯角、或對頂角作為 y 來搭橋。`;
      if (hintStep === 2) text = `Step 2 提示：設定好 y 後，看看 y 和目標 x 是甚麼關係？`;
    } else if (level === 5) {
      if (hintStep === 1) text = `Step 1 提示：看上面綠色的 Z / C 形狀，找出被輔助線切開的上半部 y。`;
      if (hintStep === 2) text = `Step 2 提示：看下面湖水綠色的 Z / C 形狀，找出被輔助線切開的下半部 z。`;
    } else if (level === 6) {
      if (question.type === 'l6_ext_tri') text = `💡 提示：三角形的外角等於兩個內對角之和！`;
      else text = `💡 提示：等腰三角形的兩底角相等，而且三角形內角和是 180°！`;
    }
    return (
      <div className={`absolute bottom-4 left-4 right-4 border-l-4 p-3 rounded shadow-sm text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 backdrop-blur-sm ${hintStep === 1 && (level === 2 || level === 4 || level === 5) ? 'bg-indigo-50/95 border-indigo-400 text-indigo-800' : 'bg-yellow-50/95 border-yellow-400 text-yellow-800'}`}>
         💡  {text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-6 flex flex-col items-center font-sans relative overflow-x-hidden">
      
      <div className="max-w-[1200px] w-full flex flex-col lg:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-1">
          <button onClick={() => handleLevelChange(1)} className={`px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap text-sm ${level === 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>1: 基礎</button>
          <button onClick={() => handleLevelChange(2)} className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1 whitespace-nowrap text-sm ${level === 2 ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}><Layers size={16} /> 2: 雙步</button>
          <button onClick={() => handleLevelChange(3)} className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1 whitespace-nowrap text-sm ${level === 3 ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}><Zap size={16} /> 3: 陷阱</button>
          <button onClick={() => handleLevelChange(4)} className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1 whitespace-nowrap text-sm ${level === 4 ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}><PenTool size={16} /> 4: 多解</button>
          <button onClick={() => handleLevelChange(5)} className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1 whitespace-nowrap text-sm ${level === 5 ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}><Ruler size={16} /> 5: 輔助線</button>
          <button onClick={() => handleLevelChange(6)} className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1 whitespace-nowrap text-sm ${level === 6 ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}><Triangle size={16} /> 6: S2 進階</button>
        </div>
        <button onClick={() => setShowCheatSheet(true)} className="w-full lg:w-auto flex justify-center items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2.5 rounded-xl font-bold transition shadow-sm whitespace-nowrap"><BookOpen size={20} /> <span className="hidden sm:inline"> 📚  幾何圖解紙</span></button>
      </div>

      <div className="max-w-[1200px] w-full mb-6 flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <span className="font-bold text-slate-700 whitespace-nowrap px-2 text-lg"> 🎯  選擇訓練題型：</span>
        <select value={selectedTopic} onChange={handleTopicChange} className="flex-1 w-full p-2.5 border-2 border-slate-300 rounded-lg font-bold text-slate-700 focus:border-indigo-500 focus:outline-none bg-slate-50 cursor-pointer">
          <option value="random"> 🎲  隨機混合抽題 (Mixed Random)</option>
          {level === 1 && (
            <optgroup label="Level 1 基礎題型">
              <option value="adj">adj. ∠s on st. line (直線上的鄰角)</option>
              <option value="pt">∠s at a pt. (同頂角)</option>
              <option value="vert">vert. opp. ∠s (對頂角)</option>
              <option value="tri">∠ sum of △ (三角形內角和)</option>
              <option value="corr">corr. ∠s, AB // CD (同位角)</option>
              <option value="alt">alt. ∠s, AB // CD (錯角)</option>
              <option value="int">int. ∠s, AB // CD (同旁內角)</option>
            </optgroup>
          )}
          {level === 2 && (
            <optgroup label="Level 2 兩步混合題型 (已標出y)">
              <option value="l2_adj_corr">adj. ∠s + corr. ∠s (鄰角 + 同位角)</option>
              <option value="l2_tri_alt">alt. ∠s + ∠ sum of △ (錯角 + 三角形內角和)</option>
              <option value="l2_vert_int">vert. opp. ∠s + int. ∠s (對頂角 + 同旁內角)</option>
              <option value="l2_corr_adj">corr. ∠s + adj. ∠s (同位角 + 鄰角)</option>
            </optgroup>
          )}
          {level === 3 && (
            <optgroup label="Level 3 進階陷阱題型 (無視干擾線)">
              <option value="l3_corr_split">分裂同位角 (Split corr. ∠s)</option>
              <option value="l3_alt_split">分裂錯角 (Split alt. ∠s)</option>
              <option value="l3_int_split">分裂同旁內角 (Split int. ∠s)</option>
            </optgroup>
          )}
          {level === 4 && (
            <optgroup label="Level 4 自設未知角 (隱藏y，看圖推導)">
              <option value="l4_multi">自設角：多重解法訓練</option>
            </optgroup>
          )}
          {level === 5 && (
            <optgroup label="Level 5 終極挑戰 (添加輔助線)">
              <option value="l5_aux_alt">M字型 (添加平行線, 用錯角)</option>
              <option value="l5_aux_int">箭頭型 (添加平行線, 用同旁內角)</option>
            </optgroup>
          )}
          {level === 6 && (
            <optgroup label="Level 6 S2 中二幾何">
              <option value="l6_ext_tri">ext. ∠ of △ (三角形外角)</option>
              <option value="l6_base_isos">base ∠s, isos. △ (等腰三角形底角)</option>
            </optgroup>
          )}
        </select>
      </div>

      <div className="max-w-[1200px] w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200 min-h-[720px]">
        
        {/* 左側：互動畫布區 */}
        <div className="w-full md:w-1/2 bg-slate-100 p-4 lg:p-6 relative border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-bold text-slate-800">圖形分析區 
              {level === 4 && <span className="ml-2 text-sm bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">交點標示模式</span>}
              {level === 5 && <span className="ml-2 text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded">輔助線挑戰</span>}
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* NEW: AI Hint Button */}
              <button onClick={handleGetAIHint} disabled={isAiLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100 disabled:opacity-50">
                {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                AI 智能提示
              </button>

              <button onClick={() => { if (level === 1 || level === 3) setHintStep(hintStep === 0 ? 1 : 0); else setHintStep(hintStep === 2 ? 0 : hintStep + 1); }} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${hintStep > 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-400' : 'bg-white text-slate-600 border border-slate-300'}`}>
                <Lightbulb size={18} className={hintStep > 0 ? "fill-yellow-500" : ""} />
                {level === 1 || level === 3 ? (hintStep === 1 ? "關閉提示" : "圖解提示") : (hintStep === 0 ? "Step 1 提示" : hintStep === 1 ? "Step 2 提示" : "關閉提示")}
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow-inner border border-slate-200 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
            {/* NEW: AI Hint Overlay */}
            {aiHint && (
               <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur border-2 border-indigo-300 p-4 rounded-xl shadow-lg animate-in slide-in-from-top-2 z-10">
                 <div className="flex gap-3">
                   <BrainCircuit className="text-indigo-500 shrink-0 mt-0.5" />
                   <div>
                     <h4 className="font-bold text-indigo-800 mb-1">AI 導師智能提示 ✨</h4>
                     <p className="text-slate-700 text-sm leading-relaxed">{aiHint}</p>
                     <button onClick={() => setAiHint(null)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"><X size={18}/></button>
                   </div>
                 </div>
               </div>
            )}

            {renderGeometry()}
            {renderHintText()}
          </div>
          {level === 5 && !showAuxLine && (
            <div className="absolute inset-x-0 bottom-10 flex justify-center animate-in fade-in slide-in-from-bottom-4">
               <button onClick={() => setShowAuxLine(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                 <PenTool size={20} />  📏  畫出輔助線 MN // AB // CD
               </button>
            </div>
          )}
        </div>

        {/* 右側：邏輯推導區 (即時反饋) */}
        <div className="w-full md:w-1/2 p-4 lg:p-6 flex flex-col overflow-y-auto bg-slate-50/50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">邏輯推導區 (即時反饋)</h2>
            {level === 4 && completedPaths.length > 0 && (
              <span className="text-sm font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={16} className="fill-amber-500" /> 已收集 {completedPaths.length} 種解法
              </span>
            )}
          </div>
          
          {level === 5 && !showAuxLine ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 animate-pulse">
               <Ruler size={48} className="mb-4 opacity-50" />
               <p className="text-lg font-bold">請先在左方圖形點擊<br/>「畫出輔助線」以解鎖推導步驟</p>
             </div>
          ) : (
            <form className="flex-1 flex flex-col gap-4">
              
              {/* Step 1 (找 y) */}
              {((level === 2 || level === 4 || level === 5)) && question && (
                <div className={`${level===4?'bg-emerald-50 border-emerald-200':level===5?'bg-indigo-50 border-indigo-200':'bg-purple-50 border-purple-200'} p-4 lg:p-5 rounded-xl border-2 shadow-sm transition-all`}>
                  <div className={`flex items-center justify-between border-b pb-2 mb-4 ${level===4?'border-emerald-200':level===5?'border-indigo-200':'border-purple-200'}`}>
                    <h3 className={`font-bold ${level===4?'text-emerald-800':level===5?'text-indigo-800':'text-purple-800'}`}>
                      {level===4 ? "Step 1: 設圖中未知角為 y" : level===5 ? "Step 1: 找出上半角 y" : "Step 1: 找出中間角 y"}
                    </h3>
                    {isStep1Complete && <CheckCircle2 className="text-green-500 animate-in zoom-in" size={24} />}
                  </div>
                  
                  <div className="grid gap-2.5">
                    {level === 4 && (
                      <div className="flex items-center bg-white p-2 rounded border border-emerald-100">
                        <span className="w-6 text-center font-bold text-emerald-500"> ✍️ </span>
                        <span className="text-sm font-bold text-emerald-700 whitespace-nowrap mr-2">Let</span>
                        <select value={userAngleY} onChange={handleAngleYChange} className="flex-1 p-2 text-sm border-2 border-emerald-300 rounded focus:border-emerald-500 font-bold bg-emerald-50 cursor-pointer">
                          <option value="">-- ① 選擇要設為 y 的角 --</option>
                          {question.yAngleOpts?.map(opt => (
                            <option key={opt} value={opt} disabled={completedPaths.includes(opt)}>
                              {opt} {completedPaths.includes(opt) ? '(已解鎖  🔓 )' : ''}
                            </option>
                          ))}
                        </select>
                        <span className="text-sm font-bold text-emerald-700 whitespace-nowrap ml-2">= y</span>
                        <FeedbackIcon status={userAngleY ? !isAngleYWrong : null} />
                      </div>
                    )}
                    {(!isL4 || (userAngleY && !isAngleYWrong)) && (
                      <>
                        <div className="flex items-center mt-2">
                          <span className="w-6 text-center font-bold text-slate-400">{level===4?'②':'1'}</span>
                          <select value={userEqY} onChange={(e) => setUserEqY(e.target.value)} className={`flex-1 p-2 text-sm border-2 border-slate-300 rounded font-mono ${level===4?'focus:border-emerald-500':level===5?'focus:border-indigo-500':'focus:border-purple-500'}`}>
                            <option value="">-- 選擇幾何關係式 (Equation) --</option>
                            {(level === 4 ? question.paths[userAngleY].yEqData.options : question?.yEqOpts || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <FeedbackIcon status={eqYStatus} />
                        </div>
                        <div className="flex items-center">
                          <span className="w-6 text-center font-bold text-slate-400">{level===4?'③':'2'}</span>
                          <select value={userReasonY} onChange={(e) => setUserReasonY(e.target.value)} className={`flex-1 p-2 text-sm border-2 border-slate-300 rounded font-mono ${level===4?'focus:border-emerald-500':level===5?'focus:border-indigo-500':'focus:border-purple-500'}`}>
                            {REASONS.map(r => <option key={r.id} value={r.id}>{r.text}</option>)}
                          </select>
                          <FeedbackIcon status={reasonYStatus} />
                        </div>
                        <div className="flex items-center pl-6 mt-1">
                          <span className={`font-bold ${level===4?'text-emerald-700':level===5?'text-indigo-700':'text-purple-700'} mr-2`}>∴ y =</span>
                          <input type="number" value={userY} onChange={(e) => setUserY(e.target.value)} className={`w-20 text-center font-bold p-1.5 border-2 border-slate-300 rounded ${level===4?'focus:border-emerald-500':level===5?'focus:border-indigo-500':'focus:border-purple-500'}`} placeholder="?" />
                          <span className={`font-bold ${level===4?'text-emerald-700':level===5?'text-indigo-700':'text-purple-700'} ml-1`}>°</span>
                          <FeedbackIcon status={userY !== '' ? valYStatus : null} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 for Level 5 (找 z) */}
              {level === 5 && question && (
                <div className={`bg-teal-50 p-4 lg:p-5 rounded-xl border-2 border-teal-200 shadow-sm transition-all ${isStep1Complete ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale-[50%]'}`}>
                  <div className={`flex items-center justify-between border-b pb-2 mb-4 border-teal-200`}>
                    <h3 className={`font-bold text-teal-800`}>Step 2: 找出下半角 z</h3>
                    {isStep2L5Complete && <CheckCircle2 className="text-green-500 animate-in zoom-in" size={24} />}
                  </div>
                  <div className="grid gap-2.5">
                    <div className="flex items-center">
                      <span className="w-6 text-center font-bold text-slate-400">1</span>
                      <select value={userEqZ} onChange={(e) => setUserEqZ(e.target.value)} className={`flex-1 p-2 text-sm border-2 border-slate-300 rounded font-mono focus:border-teal-500`}>
                        <option value="">-- 選擇幾何關係式 (Equation) --</option>
                        {(question?.zEqOpts || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <FeedbackIcon status={eqZStatus} />
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 text-center font-bold text-slate-400">2</span>
                      <select value={userReasonZ} onChange={(e) => setUserReasonZ(e.target.value)} className={`flex-1 p-2 text-sm border-2 border-slate-300 rounded font-mono focus:border-teal-500`}>
                        {REASONS.map(r => <option key={r.id} value={r.id}>{r.text}</option>)}
                      </select>
                      <FeedbackIcon status={reasonZStatus} />
                    </div>
                    <div className="flex items-center pl-6 mt-1">
                      <span className="font-bold text-teal-700 mr-2">∴ z =</span>
                      <input type="number" value={userZ} onChange={(e) => setUserZ(e.target.value)} className={`w-20 text-center font-bold p-1.5 border-2 border-slate-300 rounded focus:border-teal-500`} placeholder="?" />
                      <span className="font-bold text-teal-700 ml-1">°</span>
                      <FeedbackIcon status={userZ !== '' ? valZStatus : null} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 (or Step 3 for L5) (找 x) */}
              {question && (
                <div className={`${level === 3 ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'} p-4 lg:p-5 rounded-xl border-2 shadow-sm transition-all ${((level === 2 || level === 4) && !isStep1Complete) || (level === 5 && !isStep2L5Complete) ? 'opacity-40 pointer-events-none grayscale-[50%]' : 'opacity-100'}`}>
                  <div className={`flex items-center justify-between border-b pb-2 mb-4 ${level === 3 ? 'border-rose-200' : 'border-blue-200'}`}>
                    <h3 className={`font-bold ${level === 3 ? 'text-rose-800' : 'text-blue-800'}`}>
                      {level === 2 || level === 4 ? "Step 2: 根據 y 找出目標角 x" : level === 5 ? "Step 3: 組合出目標大角 x" : level === 3 ? "識破陷阱：找出目標角 x" : "找出未知數 x"}
                    </h3>
                    {isStepXComplete && <CheckCircle2 className="text-green-500 animate-in zoom-in" size={24} />}
                  </div>
                  
                  <div className="grid gap-2.5">
                    <div className="flex items-center">
                      <span className="w-6 text-center font-bold text-slate-400">1</span>
                      <select value={userEqX} onChange={(e) => setUserEqX(e.target.value)} className={`flex-1 p-2 text-sm border-2 border-slate-300 rounded font-mono ${level===3?'focus:border-rose-500':'focus:border-blue-500'}`}>
                        <option value="">-- 選擇關係式 (Equation) --</option>
                        {(level === 4 && userAngleY && !isAngleYWrong ? question.paths[userAngleY].xEqData.options : (question?.eqOpts || question?.xEqOpts || [])).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      <FeedbackIcon status={eqXStatus} />
                    </div>
                    
                    {!isL5 && (
                      <div className="flex items-center">
                        <span className="w-6 text-center font-bold text-slate-400">2</span>
                        <select value={userReasonX} onChange={(e) => setUserReasonX(e.target.value)} className={`flex-1 p-2 text-sm border-2 border-slate-300 rounded font-mono ${level===3?'focus:border-rose-500':'focus:border-blue-500'}`}>
                          {REASONS.map(r => <option key={r.id} value={r.id}>{r.text}</option>)}
                        </select>
                        <FeedbackIcon status={reasonXStatus} />
                      </div>
                    )}
                    <div className="flex items-center pl-6 mt-1">
                      <span className="font-bold text-red-600 mr-2">∴ x =</span>
                      <input type="number" value={userX} onChange={(e) => setUserX(e.target.value)} className={`w-20 text-center font-bold p-1.5 border-2 border-slate-300 rounded ${level===3?'focus:border-rose-500':'focus:border-blue-500'}`} placeholder="?" />
                      <span className="font-bold text-red-600 ml-1">°</span>
                      <FeedbackIcon status={userX !== '' ? valXStatus : null} />
                    </div>
                  </div>
                </div>
              )}

              {/* 大成功橫幅 */}
              {isAllComplete && (
                <div className="mt-2 p-5 rounded-xl bg-green-50 border-2 border-green-300 text-green-900 shadow-md animate-in slide-in-from-bottom-4 fade-in flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full shrink-0"><CheckCircle2 className="text-green-600" size={28} /></div>
                    <h3 className="font-bold text-lg">太出色了！推理完全正確！ 🎉 </h3>
                  </div>

                  {/* NEW: AI Explanation Integration */}
                  <div className="pt-3 border-t border-green-200">
                    <button type="button" onClick={handleGetAIExplanation} disabled={isAiExpLoading} className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 px-4 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                      {isAiExpLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      要求 AI 深度解析此題型的幾何原理
                    </button>
                    {aiExplanation && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-green-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-inner">
                        <div className="font-bold text-green-700 mb-2 flex items-center gap-2">
                          <BrainCircuit size={18} /> AI 深度解析
                        </div>
                        {aiExplanation}
                      </div>
                    )}
                  </div>
                  
                  {level === 4 && completedPaths.length + 1 < Object.keys(question.paths).length ? (
                    <div className="pt-3 border-t border-green-200">
                      <p className="font-semibold text-green-800 mb-4">這條題目其實有 {Object.keys(question.paths).length} 種不同的隱藏解法，你已經破解了 {completedPaths.length + 1} 種！</p>
                      <button type="button" onClick={handleNextSolution} className="w-full flex items-center justify-center gap-2 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg transition-colors shadow-sm">
                        <Star size={20} /> 挑戰用另一個角做橋樑
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-green-200">
                      {level === 4 && <p className="font-semibold text-green-800 mb-4"> 🏆  大師級境界！你已經找出了這題所有的隱藏解法！無懈可擊！</p>}
                      <button type="button" onClick={() => generateQuestion(level, selectedTopic)} className="w-full flex items-center justify-center gap-2 text-base font-bold bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors shadow-sm">
                        <RefreshCw size={20} /> 挑戰下一題
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {showCheatSheet && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BookOpen className="text-indigo-600" /> 幾何理由圖解紙 (Cheat Sheet)</h2>
              <button onClick={() => setShowCheatSheet(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><X size={24} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="border-2 border-indigo-100 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 60" className="h-full overflow-visible">
                    <line x1="10" y1="50" x2="90" y2="50" stroke="#1e293b" strokeWidth="2" /><line x1="50" y1="50" x2="70" y2="10" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 65 50 A 15 15 0 0 0 57 35" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 57 35 A 15 15 0 0 0 35 50" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <text x="65" y="45" fontSize="12" fill="#ef4444">a</text><text x="40" y="45" fontSize="12" fill="#3b82f6">b</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">adj. ∠s on st. line</h3><p className="text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded">a + b = 180°</p>
              </div>

              <div className="border-2 border-indigo-100 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 60" className="h-full overflow-visible">
                    <line x1="20" y1="10" x2="80" y2="50" stroke="#1e293b" strokeWidth="2" /><line x1="20" y1="50" x2="80" y2="10" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 41 24 A 12 12 0 0 1 59 24" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 41 36 A 12 12 0 0 0 59 36" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <text x="50" y="20" fontSize="12" fill="#ef4444" textAnchor="middle">a</text><text x="50" y="49" fontSize="12" fill="#3b82f6" textAnchor="middle">b</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">vert. opp. ∠s</h3><p className="text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded">a = b (交叉相等)</p>
              </div>

              <div className="border-2 border-indigo-100 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <line x1="50" y1="40" x2="50" y2="10" stroke="#1e293b" strokeWidth="2" /><line x1="50" y1="40" x2="80" y2="60" stroke="#1e293b" strokeWidth="2" /><line x1="50" y1="40" x2="20" y2="60" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 50 25 A 15 15 0 0 1 62.5 48.3" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 62.5 48.3 A 15 15 0 0 1 37.5 48.3" stroke="#3b82f6" strokeWidth="2" fill="none" /><path d="M 37.5 48.3 A 15 15 0 0 1 50 25" stroke="#22c55e" strokeWidth="2" fill="none" />
                    <text x="60" y="35" fontSize="12" fill="#ef4444">a</text><text x="50" y="60" fontSize="12" fill="#3b82f6" textAnchor="middle">b</text><text x="40" y="35" fontSize="12" fill="#22c55e" textAnchor="end">c</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">∠s at a pt.</h3><p className="text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded">a + b + c = 360°</p>
              </div>

              <div className="border-2 border-green-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center relative">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <line x1="10" y1="30" x2="90" y2="30" stroke="#1e293b" strokeWidth="2" /><line x1="10" y1="60" x2="90" y2="60" stroke="#1e293b" strokeWidth="2" /><line x1="85" y1="10" x2="15" y2="80" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 80 30 L 35 30 L 65 60 L 20 60" stroke="#facc15" strokeWidth="6" fill="none" opacity="0.6" strokeLinejoin="round"/>
                    <path d="M 50 30 A 15 15 0 0 0 54.4 40.6" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 50 60 A 15 15 0 0 0 45.6 49.4" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <text x="50" y="44" fontSize="12" fill="#ef4444" textAnchor="end">a</text><text x="50" y="58" fontSize="12" fill="#3b82f6" textAnchor="start">b</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">alt. ∠s, AB // CD</h3><p className="text-sm text-slate-600 font-semibold bg-green-50 px-3 py-1 rounded border border-green-200">a = b (Z 型錯角)</p>
              </div>

              <div className="border-2 border-green-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <line x1="10" y1="30" x2="90" y2="30" stroke="#1e293b" strokeWidth="2" /><line x1="10" y1="60" x2="90" y2="60" stroke="#1e293b" strokeWidth="2" /><line x1="15" y1="10" x2="85" y2="80" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 80 30 L 35 30 L 75 70 M 65 60 L 80 60" stroke="#facc15" strokeWidth="6" fill="none" opacity="0.6" strokeLinejoin="round"/>
                    <path d="M 50 30 A 15 15 0 0 1 45.6 40.6" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 80 60 A 15 15 0 0 1 75.6 70.6" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <text x="52" y="44" fontSize="12" fill="#ef4444">a</text><text x="82" y="74" fontSize="12" fill="#3b82f6">b</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">corr. ∠s, AB // CD</h3><p className="text-sm text-slate-600 font-semibold bg-green-50 px-3 py-1 rounded border border-green-200">a = b (F 型同位角)</p>
              </div>

              <div className="border-2 border-green-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <line x1="10" y1="30" x2="90" y2="30" stroke="#1e293b" strokeWidth="2" /><line x1="10" y1="60" x2="90" y2="60" stroke="#1e293b" strokeWidth="2" /><line x1="15" y1="10" x2="85" y2="80" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 80 30 L 35 30 L 65 60 L 80 60" stroke="#facc15" strokeWidth="6" fill="none" opacity="0.6" strokeLinejoin="round"/>
                    <path d="M 50 30 A 15 15 0 0 1 45.6 40.6" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 80 60 A 15 15 0 0 0 54.4 49.4" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <text x="52" y="44" fontSize="12" fill="#ef4444">a</text><text x="68" y="55" fontSize="12" fill="#3b82f6">b</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">int. ∠s, AB // CD</h3><p className="text-sm text-slate-600 font-semibold bg-green-50 px-3 py-1 rounded border border-green-200">a + b = 180° (C 型同旁內角)</p>
              </div>

              <div className="border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <polygon points="50,15 20,65 80,65" stroke="#1e293b" strokeWidth="2" fill="none" />
                    <path d="M 43.9 25.3 A 12 12 0 0 0 56.1 25.3" stroke="#ef4444" strokeWidth="2" fill="none" /><path d="M 32 65 A 12 12 0 0 0 26.1 54.7" stroke="#3b82f6" strokeWidth="2" fill="none" /><path d="M 68 65 A 12 12 0 0 1 73.9 54.7" stroke="#22c55e" strokeWidth="2" fill="none" />
                    <text x="50" y="38" fontSize="12" fill="#ef4444" textAnchor="middle">a</text><text x="32" y="60" fontSize="12" fill="#3b82f6">b</text><text x="68" y="60" fontSize="12" fill="#22c55e" textAnchor="end">c</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">∠ sum of △</h3><p className="text-sm text-slate-600 font-semibold bg-orange-50 px-3 py-1 rounded border border-orange-200">a + b + c = 180°</p>
              </div>
              
              <div className="border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <polygon points="20,65 50,15 80,65" stroke="#1e293b" strokeWidth="2" fill="none" />
                    <line x1="80" y1="65" x2="95" y2="65" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 43.9 25.3 A 12 12 0 0 0 56.1 25.3" stroke="#ef4444" strokeWidth="2" fill="none" />
                    <path d="M 32 65 A 12 12 0 0 0 26.1 54.7" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <path d="M 80 53 A 12 12 0 0 1 92 65" stroke="#22c55e" strokeWidth="2" fill="none" />
                    <text x="50" y="38" fontSize="12" fill="#ef4444" textAnchor="middle">a</text>
                    <text x="32" y="60" fontSize="12" fill="#3b82f6">b</text>
                    <text x="88" y="55" fontSize="12" fill="#22c55e" textAnchor="middle">c</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">ext. ∠ of △</h3><p className="text-sm text-slate-600 font-semibold bg-orange-50 px-3 py-1 rounded border border-orange-200">c = a + b</p>
              </div>

              <div className="border-2 border-orange-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="h-24 w-full mb-2 flex justify-center items-center">
                  <svg viewBox="0 0 100 80" className="h-full overflow-visible">
                    <polygon points="50,15 20,65 80,65" stroke="#1e293b" strokeWidth="2" fill="none" />
                    <line x1="32" y1="40" x2="38" y2="40" stroke="#1e293b" strokeWidth="2" />
                    <line x1="62" y1="40" x2="68" y2="40" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 32 65 A 12 12 0 0 0 26.1 54.7" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <path d="M 68 65 A 12 12 0 0 1 73.9 54.7" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <text x="32" y="60" fontSize="12" fill="#3b82f6">a</text><text x="68" y="60" fontSize="12" fill="#3b82f6" textAnchor="end">a</text>
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg text-slate-800 mb-1">base ∠s, isos. △</h3><p className="text-sm text-slate-600 font-semibold bg-orange-50 px-3 py-1 rounded border border-orange-200">a = a</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}