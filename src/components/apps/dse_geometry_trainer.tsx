import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, RefreshCcw, ArrowRightCircle, Globe, GraduationCap, ArrowDown } from 'lucide-react';

// 多國語言字典
const i18n = {
  zh: {
    title: "香港 DSE 數學訓練",
    subtitle: "課題：全等三角形 (Congruent Triangles) 找未知數",
    qNum: (curr, total) => `第 ${curr} / ${total} 題`,
    selectQ: "選擇題目：",
    questionText: "題目：",
    inFigure: "如圖所示，",
    find: "求",
    guideBtn: "手把手教學",
    guideBtnHide: "隱藏教學",
    guideTitle: "解題秘訣：不要只看圖，要看字母順序！",
    guideStep1: "步驟 1：拆解全等聲明",
    guideStep1Desc: "把對應的字母配對，相同位置的字母代表對應點 / 對應角。",
    guideStep2: "步驟 2：配對邊長或角度",
    guideStep2Desc: "找邊長看兩個字母；找角度看中間的字母。",
    taskTitle: (index, varName) => `${index}. 找出 ${varName}`,
    step1Prompt1: (varName, elem) => `圖中 ${varName} 代表 ${elem}。`,
    step1Prompt2: "根據字母順序，它對應哪一個？",
    selectCorr: "-- 選擇對應項 --",
    btnConfirm: "確定對應項",
    errLetter: "提示：請仔細看教學面板（紅色對紅色，藍色對藍色）的字母對應關係！",
    correctCorr: (elem) => `正確！對應 ${elem}。`,
    step2Title: "第二步：完成 DSE 格式",
    selectReason: "-- 選擇理由 --",
    selectValue: "選擇數值",
    btnSubmit: "提交答案",
    errAns: "答案有誤喔！",
    errValEmpty: "請選擇數值。",
    errValWrong: "數值選擇錯誤。",
    errReasonEmpty: "請選擇理由。",
    errReasonWrong: "理由不對 (找邊長用 sides，找角度用 ∠s)。",
    dseFormat: "太棒了！這是你的標準 DSE 答題格式：",
    ansPrefix: "答案：",
    nextQ: (idx) => `下一題 (Practice ${idx})`,
    allDone: "🎉 恭喜你！完成所有 3 題練習！",
    restart: "重新開始訓練",
    knowledgeTitle: "💡 必學知識：DSE 幾何理由 (Reasons) 解碼",
    kGiven: "已知條件",
    kGivenDesc: "題目文字直接提供的線索，或圖形上原本就標示了相同數字、相同記號。",
    kSides: "全等三角形的對應邊",
    kSidesDesc: "尋找邊長 (Sides) 時使用。確定全等後，對應邊長必定相等。",
    kAngles: "全等三角形的對應角",
    kAnglesDesc: "尋找角度 (Angles) 時使用。確定全等後，對應角度必定相等。"
  },
  en: {
    title: "HKDSE Math Training",
    subtitle: "Topic: Unknowns in Congruent Triangles",
    qNum: (curr, total) => `Question ${curr} / ${total}`,
    selectQ: "Select Q:",
    questionText: "Question:",
    inFigure: "In the figure, ",
    find: "Find",
    guideBtn: "Show Guide",
    guideBtnHide: "Hide Guide",
    guideTitle: "Pro Tip: Rely on the statement, not just your eyes!",
    guideStep1: "Step 1: Break down the congruence statement",
    guideStep1Desc: "Map the corresponding letters. Letters in the same position represent corresponding vertices/angles.",
    guideStep2: "Step 2: Match sides or angles",
    guideStep2Desc: "For sides, look at two letters. For angles, look at the middle letter.",
    taskTitle: (index, varName) => `${index}. Find ${varName}`,
    step1Prompt1: (varName, elem) => `${varName} represents ${elem} in the figure.`,
    step1Prompt2: "Based on letter order, what does it correspond to?",
    selectCorr: "-- Select part --",
    btnConfirm: "Confirm",
    errLetter: "Hint: Check the letter mapping in the guide carefully (Red to Red, Blue to Blue)!",
    correctCorr: (elem) => `Correct! It corresponds to ${elem}.`,
    step2Title: "Step 2: Complete DSE format",
    selectReason: "-- Select reason --",
    selectValue: "Select value",
    btnSubmit: "Submit Answer",
    errAns: "Incorrect answer!",
    errValEmpty: "Please select a value.",
    errValWrong: "Wrong value selected.",
    errReasonEmpty: "Please select a reason.",
    errReasonWrong: "Wrong reason (use 'sides' for length, '∠s' for angles).",
    dseFormat: "Great job! Here is your standard DSE format:",
    ansPrefix: "ANS:",
    nextQ: (idx) => `Next Question (Practice ${idx})`,
    allDone: "🎉 Congratulations! You have completed all practices!",
    restart: "Restart Training",
    knowledgeTitle: "💡 Key Knowledge: DSE Geometric Reasons",
    kGiven: "Given Information",
    kGivenDesc: "Clues provided directly in the text, or matching numbers/marks already on the figure.",
    kSides: "Corresponding sides of congruent triangles",
    kSidesDesc: "Used when finding sides. Corresponding sides are equal after confirming congruence.",
    kAngles: "Corresponding angles of congruent triangles",
    kAnglesDesc: "Used when finding angles. Corresponding angles are equal after confirming congruence."
  }
};

export default function App() {
  const [lang, setLang] = useState('zh');
  const [showGuide, setShowGuide] = useState(false);

  // 翻譯輔助函數
  const t = (key, ...args) => {
    const text = i18n[lang][key];
    return typeof text === 'function' ? text(...args) : text;
  };

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  const questions = [
    {
      id: 1,
      statement: { t1: ['A', 'B', 'C'], t2: ['D', 'E', 'F'] },
      findText: "x, y and z",
      tasks: [
        { varName: "x", type: "side", elem: "BC", corrElem: "EF", val: "7.5", options: ["AB", "AC", "DE", "DF", "EF"], valOptions: ["7.5", "12", "38"] },
        { varName: "y", type: "side", elem: "DF", corrElem: "AC", val: "12", options: ["AB", "BC", "AC", "DE", "EF"], valOptions: ["7.5", "12", "38"] },
        { varName: "z", type: "angle", elem: "∠D", corrElem: "∠A", val: "38", options: ["∠A", "∠B", "∠C", "∠E", "∠F"], valOptions: ["7.5", "12", "38"] }
      ],
      svg: () => (
        <svg width="600" height="260" viewBox="0 0 500 220" className="max-w-full h-auto drop-shadow-sm">
          {/* Triangle 1: ABC */}
          <polygon points="40,160 140,60 220,160" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="20" y="165" fontSize="22" fontStyle="italic" fontWeight="bold">A</text>
          <text x="135" y="45" fontSize="22" fontStyle="italic" fontWeight="bold">B</text>
          <text x="230" y="165" fontSize="22" fontStyle="italic" fontWeight="bold">C</text>
          <text x="120" y="185" fontSize="22" fontWeight="bold">12</text>
          <text x="190" y="105" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">x</text>
          <path d="M 75 160 A 35 35 0 0 0 65 133" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="80" y="152" fontSize="20" fontWeight="bold">38°</text>

          {/* Triangle 2: DEF */}
          <polygon points="280,80 420,50 440,170" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="255" y="85" fontSize="22" fontStyle="italic" fontWeight="bold">D</text>
          <text x="420" y="35" fontSize="22" fontStyle="italic" fontWeight="bold">E</text>
          <text x="450" y="180" fontSize="22" fontStyle="italic" fontWeight="bold">F</text>
          <text x="440" y="110" fontSize="22" fontWeight="bold">7.5</text>
          <text x="345" y="145" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">y</text>
          <path d="M 315 73 A 35 35 0 0 1 310 98" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="320" y="100" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">z</text>
        </svg>
      )
    },
    {
      id: 2,
      statement: { t1: ['H', 'I', 'J'], t2: ['L', 'M', 'N'] },
      findText: "x, y and z",
      tasks: [
        { varName: "x", type: "angle", elem: "∠M", corrElem: "∠I", val: "110", options: ["∠H", "∠I", "∠J", "∠L", "∠N"], valOptions: ["20", "37", "110"] },
        { varName: "y", type: "angle", elem: "∠J", corrElem: "∠N", val: "20", options: ["∠H", "∠I", "∠L", "∠M", "∠N"], valOptions: ["20", "37", "110"] },
        { varName: "z", type: "side", elem: "LN", corrElem: "HJ", val: "37", options: ["HI", "IJ", "HJ", "LM", "MN"], valOptions: ["20", "37", "110"] }
      ],
      svg: () => (
        <svg width="600" height="260" viewBox="0 0 500 220" className="max-w-full h-auto drop-shadow-sm">
          {/* Triangle 1: HIJ - Re-engineered for perfect shape and spacing */}
          <polygon points="60,50 100,150 200,150" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="50" y="40" fontSize="22" fontStyle="italic" fontWeight="bold">H</text>
          <text x="90" y="175" fontSize="22" fontStyle="italic" fontWeight="bold">I</text>
          <text x="210" y="175" fontSize="22" fontStyle="italic" fontWeight="bold">J</text>
          
          <text x="135" y="90" fontSize="22" fontWeight="bold">37</text>
          
          <path d="M 120 150 Q 115 135 92.6 131.5" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="115" y="140" fontSize="18" fontWeight="bold">110°</text>
          
          <path d="M 175 150 Q 178 140 180 135.5" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="160" y="145" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">y</text>

          {/* Triangle 2: LMN - Reflected horizontally around center */}
          <polygon points="420,50 380,150 280,150" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="430" y="40" fontSize="22" fontStyle="italic" fontWeight="bold">L</text>
          <text x="390" y="175" fontSize="22" fontStyle="italic" fontWeight="bold">M</text>
          <text x="270" y="175" fontSize="22" fontStyle="italic" fontWeight="bold">N</text>
          
          <text x="345" y="90" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">z</text>
          
          <path d="M 360 150 Q 365 135 387.4 131.5" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="365" y="140" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">x</text>
          
          <path d="M 305 150 Q 302 140 300 135.5" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="310" y="145" fontSize="18" fontWeight="bold">20°</text>
        </svg>
      )
    },
    {
      id: 3,
      statement: { t1: ['P', 'Q', 'R'], t2: ['X', 'Y', 'Z'] },
      findText: "a, b and c",
      tasks: [
        { varName: "a", type: "angle", elem: "∠P", corrElem: "∠X", val: "56", options: ["∠Q", "∠R", "∠X", "∠Y", "∠Z"], valOptions: ["15", "17", "56"] },
        { varName: "b", type: "side", elem: "PR", corrElem: "XZ", val: "17", options: ["PQ", "QR", "XY", "XZ", "YZ"], valOptions: ["15", "17", "56"] },
        { varName: "c", type: "side", elem: "YZ", corrElem: "QR", val: "15", options: ["PQ", "PR", "QR", "XY", "XZ"], valOptions: ["15", "17", "56"] }
      ],
      svg: () => (
        <svg width="600" height="260" viewBox="0 0 500 220" className="max-w-full h-auto drop-shadow-sm">
          {/* Triangle 1: PQR */}
          <polygon points="70,180 180,180 150,40" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="45" y="190" fontSize="22" fontStyle="italic" fontWeight="bold">P</text>
          <text x="190" y="190" fontSize="22" fontStyle="italic" fontWeight="bold">Q</text>
          <text x="145" y="25" fontSize="22" fontStyle="italic" fontWeight="bold">R</text>
          <text x="95" y="105" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">b</text>
          <text x="175" y="115" fontSize="22" fontWeight="bold">15</text>
          <path d="M 95 180 A 25 25 0 0 0 85 155" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="100" y="170" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">a</text>

          {/* Triangle 2: XYZ */}
          <polygon points="320,180 460,180 370,50" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <text x="370" y="35" fontSize="22" fontStyle="italic" fontWeight="bold">X</text>
          <text x="295" y="190" fontSize="22" fontStyle="italic" fontWeight="bold">Y</text>
          <text x="470" y="190" fontSize="22" fontStyle="italic" fontWeight="bold">Z</text>
          <text x="425" y="115" fontSize="22" fontWeight="bold">17</text>
          <text x="385" y="210" fontSize="22" fontStyle="italic" fontWeight="bold" fill="#1e293b">c</text>
          <path d="M 355 85 A 35 35 0 0 0 385 75" fill="none" stroke="#0ea5e9" strokeWidth="3" />
          <text x="360" y="105" fontSize="20" fontWeight="bold">56°</text>
        </svg>
      )
    }
  ];

  const [qIndex, setQIndex] = useState(0);
  const currentQ = questions[qIndex];

  const initialTaskState = [
    { step: 0, input1: '', val: '', reason: '', err: '' },
    { step: 0, input1: '', val: '', reason: '', err: '' },
    { step: 0, input1: '', val: '', reason: '', err: '' }
  ];
  const [tasksState, setTasksState] = useState(initialTaskState);

  const updateTask = (index, field, value) => {
    const newTasks = [...tasksState];
    newTasks[index][field] = value;
    setTasksState(newTasks);
  };

  const checkStep1 = (index) => {
    const taskDef = currentQ.tasks[index];
    const userChoice = tasksState[index].input1;
    
    if (userChoice === taskDef.corrElem) {
      updateTask(index, 'step', 2);
      updateTask(index, 'err', '');
    } else {
      updateTask(index, 'err', t('errLetter'));
    }
  };

  const checkStep2 = (index) => {
    const taskDef = currentQ.tasks[index];
    const userVal = tasksState[index].val;
    const userReason = tasksState[index].reason;
    const correctReason = taskDef.type === 'side' ? 'corr. sides, ≅ △s' : 'corr. ∠s, ≅ △s';

    if (userVal === taskDef.val && userReason === correctReason) {
      updateTask(index, 'step', 3);
      updateTask(index, 'err', '');
    } else {
      let errMsg = t('errAns');
      if (!userVal) errMsg += ' ' + t('errValEmpty');
      else if (userVal !== taskDef.val) errMsg += ' ' + t('errValWrong');
      
      if (!userReason) errMsg += ' ' + t('errReasonEmpty');
      else if (userReason !== correctReason) errMsg += ' ' + t('errReasonWrong');
      
      updateTask(index, 'err', errMsg);
    }
  };

  const nextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
      setTasksState(initialTaskState);
      setShowGuide(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetAll = () => {
    setQIndex(0);
    setTasksState(initialTaskState);
    setShowGuide(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpToQuestion = (index) => {
    setQIndex(index);
    setTasksState(initialTaskState);
    setShowGuide(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAllDone = tasksState.every(t => t.step === 3);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border-b-4 border-b-indigo-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{t('title')}</h1>
              <h2 className="text-xl text-slate-500 font-medium mt-2">{t('subtitle')}</h2>
            </div>
            
            {/* 語言切換按鈕 */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
            >
              <Globe className="w-5 h-5"/>
              {lang === 'zh' ? 'English' : '中文'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-100 gap-4">
            <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-lg font-bold">
              {t('qNum', qIndex + 1, questions.length)}
            </span>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-bold hidden sm:inline">{t('selectQ')}</span>
              <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className={`px-5 py-2 rounded-full text-lg font-bold transition-all ${
                      qIndex === idx
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-white rounded-2xl shadow-sm border-t-8 border-t-emerald-500 p-6 md:p-8">
          <p className="text-2xl mb-8 leading-relaxed">
            <span className="font-bold text-slate-700">{t('questionText')}</span> {t('inFigure')} 
            <span className="inline-block mx-3 font-mono text-3xl px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg shadow-inner">
              △<span className="text-red-600">{currentQ.statement.t1[0]}</span>
              <span className="text-blue-600">{currentQ.statement.t1[1]}</span>
              <span className="text-emerald-600">{currentQ.statement.t1[2]}</span> ≅ 
              △<span className="text-red-600">{currentQ.statement.t2[0]}</span>
              <span className="text-blue-600">{currentQ.statement.t2[1]}</span>
              <span className="text-emerald-600">{currentQ.statement.t2[2]}</span>
            </span>. <br className="md:hidden" />
            {t('find')} <span className="italic font-serif font-bold text-slate-800 text-3xl mx-2">{currentQ.findText}</span>.
          </p>

          <div className="flex justify-center items-center bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 overflow-x-auto shadow-inner">
            {currentQ.svg()}
          </div>

          {/* Guide Toggle Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95 shadow-md border-2 ${
                showGuide 
                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                  : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              <GraduationCap className="w-7 h-7" />
              {showGuide ? t('guideBtnHide') : t('guideBtn')}
            </button>
          </div>

          {/* Expanded Guide Panel */}
          {showGuide && (
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-300">
              <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-amber-500" />
                {t('guideTitle')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h4 className="text-xl font-bold text-blue-800 mb-2">{t('guideStep1')}</h4>
                  <p className="text-slate-600 mb-6">{t('guideStep1Desc')}</p>
                  
                  <div className="flex justify-center items-center gap-8 font-mono text-4xl mb-4">
                    <div className="flex flex-col items-center">
                      <span className="text-red-600">{currentQ.statement.t1[0]}</span>
                      <ArrowDown className="w-6 h-6 text-slate-300 my-2" />
                      <span className="text-red-600">{currentQ.statement.t2[0]}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-blue-600">{currentQ.statement.t1[1]}</span>
                      <ArrowDown className="w-6 h-6 text-slate-300 my-2" />
                      <span className="text-blue-600">{currentQ.statement.t2[1]}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-emerald-600">{currentQ.statement.t1[2]}</span>
                      <ArrowDown className="w-6 h-6 text-slate-300 my-2" />
                      <span className="text-emerald-600">{currentQ.statement.t2[2]}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h4 className="text-xl font-bold text-blue-800 mb-2">{t('guideStep2')}</h4>
                  <p className="text-slate-600 mb-6">{t('guideStep2Desc')}</p>
                  
                  <div className="space-y-4 font-mono text-xl">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200">
                      <span>Side <span className="font-bold text-slate-800">{currentQ.statement.t1[0]}{currentQ.statement.t1[1]}</span></span>
                      <ArrowRightCircle className="w-5 h-5 text-indigo-400" />
                      <span>Side <span className="font-bold text-slate-800">{currentQ.statement.t2[0]}{currentQ.statement.t2[1]}</span></span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200">
                      <span>Angle ∠<span className="font-bold text-slate-800">{currentQ.statement.t1[2]}</span></span>
                      <ArrowRightCircle className="w-5 h-5 text-indigo-400" />
                      <span>Angle ∠<span className="font-bold text-slate-800">{currentQ.statement.t2[2]}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Steps */}
        <div className="grid lg:grid-cols-3 gap-6">
          {currentQ.tasks.map((task, index) => {
            const state = tasksState[index];
            const isDone = state.step === 3;
            
            return (
              <div key={index} className={`p-6 rounded-2xl border-4 transition-all duration-300 ${isDone ? 'bg-emerald-50 border-emerald-300 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'}`}>
                <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
                  {t('taskTitle', index + 1, <span className="italic font-serif text-3xl text-slate-800 mx-1">{task.varName}</span>)}
                  {isDone && <CheckCircle2 className="w-8 h-8 text-emerald-500 ml-auto" />}
                </h3>
                
                {/* Step 1: 找對應 */}
                {state.step === 0 && (
                  <div className="space-y-5">
                    <p className="text-xl">{t('step1Prompt1', <span className="italic font-serif font-bold text-slate-800">{task.varName}</span>, <span className="font-bold bg-slate-100 px-2 py-1 rounded">{task.elem}</span>)}</p>
                    <p className="text-xl font-medium text-blue-800">{t('step1Prompt2')}</p>
                    <select 
                      className="w-full p-4 border-2 border-slate-300 rounded-xl text-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition cursor-pointer bg-slate-50"
                      value={state.input1}
                      onChange={(e) => updateTask(index, 'input1', e.target.value)}
                    >
                      <option value="">{t('selectCorr')}</option>
                      {task.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <button 
                      onClick={() => checkStep1(index)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-xl font-bold shadow-md transition transform active:scale-95"
                    >{t('btnConfirm')}</button>
                    {state.err && <p className="text-red-600 text-lg flex items-start gap-2 bg-red-50 p-3 rounded-lg"><AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5"/>{state.err}</p>}
                  </div>
                )}

                {/* Step 2: 填理由和數值 */}
                {state.step >= 2 && state.step < 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0"/> {t('correctCorr', task.corrElem)}
                    </div>
                    <p className="text-xl font-bold text-slate-700 border-b-2 border-slate-200 pb-2">{t('step2Title')}</p>
                    
                    <div className="space-y-4">
                      {/* Reason Select */}
                      <div className="flex flex-col gap-2 font-mono text-xl">
                        <div className="flex items-center gap-2 flex-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="font-bold">{task.elem} = {task.corrElem}</span> 
                          <span>(</span>
                          <select 
                            className="p-2 border-2 border-slate-300 rounded-lg text-lg focus:ring-4 focus:ring-blue-200 outline-none min-w-[150px]"
                            value={state.reason}
                            onChange={(e) => updateTask(index, 'reason', e.target.value)}
                          >
                            <option value="">{t('selectReason')}</option>
                            <option value="given">given</option>
                            <option value="corr. sides, ≅ △s">corr. sides, ≅ △s</option>
                            <option value="corr. ∠s, ≅ △s">corr. ∠s, ≅ △s</option>
                          </select>
                          <span>)</span>
                        </div>
                      </div>

                      {/* Value Select */}
                      <div className="flex items-center gap-3 font-mono text-2xl bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="italic font-bold text-slate-800">{task.varName}</span> = 
                        <select 
                          className="p-2 border-2 border-slate-300 rounded-lg text-2xl text-center focus:ring-4 focus:ring-blue-200 outline-none min-w-[120px] bg-white cursor-pointer"
                          value={state.val}
                          onChange={(e) => updateTask(index, 'val', e.target.value)}
                        >
                          <option value="" className="text-base text-slate-400">{t('selectValue')}</option>
                          {task.valOptions.map(val => <option key={val} value={val}>{val}</option>)}
                        </select>
                        {task.type === 'angle' && <span>°</span>}
                      </div>
                    </div>

                    <button 
                      onClick={() => checkStep2(index)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-xl font-bold shadow-md transition transform active:scale-95"
                    >{t('btnSubmit')}</button>
                    {state.err && <p className="text-red-600 text-lg flex items-start gap-2 bg-red-50 p-3 rounded-lg"><AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5"/>{state.err}</p>}
                  </div>
                )}

                {/* Step 3: 完成顯示 */}
                {state.step === 3 && (
                  <div className="font-mono text-xl space-y-4 text-slate-800 animate-in zoom-in-95 duration-300">
                    <div className="bg-white p-4 rounded-xl border-2 border-emerald-200 shadow-sm">
                      <p className="mb-2 font-bold">{task.elem} = {task.corrElem} <span className="text-slate-500 font-normal text-lg">({state.reason})</span></p>
                      <p className="text-3xl mt-4"><span className="italic text-slate-800 font-bold">{task.varName}</span> = {state.val}{task.type === 'angle' && '°'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Output */}
        {isAllDone && (
          <div className="bg-white rounded-2xl shadow-lg border-4 border-indigo-500 p-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 flex-shrink-0"/>
              {t('dseFormat')}
            </h2>
            
            <div className="border-2 border-slate-400 grid md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-400 text-xl md:text-2xl font-serif bg-slate-50">
              {currentQ.tasks.map((task, i) => (
                <div key={i} className="p-6 space-y-4">
                  <p className="font-bold">{task.elem} = {task.corrElem} <span className="text-lg md:text-xl text-slate-600">({tasksState[i].reason})</span></p>
                  <p><span className="italic">{task.varName}</span> = {tasksState[i].val}{task.type === 'angle' ? '°' : ''}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-right font-serif text-2xl md:text-3xl pr-4 font-bold text-slate-800">
              {t('ansPrefix')} {currentQ.tasks.map((t, i) => <span key={i} className="mx-2"><span className="italic">{t.varName}</span> = {tasksState[i].val}{t.type === 'angle' ? '°' : ''}{i < 2 ? ',' : ''}</span>)}
            </div>

            <div className="mt-10 pt-8 border-t-2 border-slate-200 flex flex-col md:flex-row justify-center gap-6">
              {qIndex < questions.length - 1 ? (
                <button 
                  onClick={nextQuestion}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg text-2xl font-bold transform hover:scale-105 active:scale-95"
                >
                  {t('nextQ', qIndex + 2)}
                  <ArrowRightCircle className="w-8 h-8"/>
                </button>
              ) : (
                <div className="text-center w-full">
                  <p className="text-3xl font-extrabold text-emerald-600 mb-6">{t('allDone')}</p>
                  <button 
                    onClick={resetAll}
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition shadow-lg text-2xl font-bold transform hover:scale-105 active:scale-95"
                  >
                    <RefreshCcw className="w-8 h-8"/>
                    {t('restart')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Area */}
        <div className="bg-white rounded-2xl shadow-lg border-t-8 border-t-blue-500 p-8 mt-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <Lightbulb className="w-10 h-10 text-blue-500 flex-shrink-0" />
            {t('knowledgeTitle')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition-colors">
              <div className="bg-blue-100 text-blue-800 font-mono text-xl font-bold px-4 py-2 rounded-lg inline-block mb-4">
                given
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3">{t('kGiven')}</h3>
              <p className="text-lg text-slate-600 mb-6 min-h-[6rem]">
                {t('kGivenDesc')}
              </p>
              <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-slate-200 shadow-inner">
                <svg width="200" height="120" viewBox="0 0 200 120">
                  <line x1="30" y1="40" x2="170" y2="40" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                  <line x1="100" y1="25" x2="100" y2="55" stroke="#ef4444" strokeWidth="4" />
                  <text x="100" y="70" fontSize="18" fill="#64748b" textAnchor="middle" fontWeight="bold">AB = 5cm</text>
                  <line x1="30" y1="90" x2="170" y2="90" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                  <line x1="100" y1="75" x2="100" y2="105" stroke="#ef4444" strokeWidth="4" />
                  <text x="100" y="115" fontSize="18" fill="#64748b" textAnchor="middle" fontWeight="bold">XY = 5cm</text>
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="bg-emerald-100 text-emerald-800 font-mono text-xl font-bold px-4 py-2 rounded-lg inline-block mb-4">
                corr. sides, ≅ △s
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3">{t('kSides')}</h3>
              <p className="text-lg text-slate-600 mb-6 min-h-[6rem]">
                {t('kSidesDesc')}
              </p>
              <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-slate-200 shadow-inner">
                <svg width="220" height="120" viewBox="0 0 220 120">
                  <polygon points="20,100 80,100 50,20" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6" strokeLinejoin="round" />
                  <line x1="20" y1="100" x2="80" y2="100" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                  <text x="110" y="75" fontSize="28" fill="#94a3b8" textAnchor="middle" fontWeight="bold">≅</text>
                  <polygon points="140,100 200,100 170,20" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6" strokeLinejoin="round" />
                  <line x1="140" y1="100" x2="200" y2="100" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 hover:border-amber-300 transition-colors">
              <div className="bg-amber-100 text-amber-800 font-mono text-xl font-bold px-4 py-2 rounded-lg inline-block mb-4">
                corr. ∠s, ≅ △s
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-3">{t('kAngles')}</h3>
              <p className="text-lg text-slate-600 mb-6 min-h-[6rem]">
                {t('kAnglesDesc')}
              </p>
              <div className="flex justify-center items-center h-40 bg-white rounded-xl border border-slate-200 shadow-inner">
                <svg width="220" height="120" viewBox="0 0 220 120">
                  <polygon points="20,100 80,100 50,20" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6" strokeLinejoin="round" />
                  <path d="M 41 45 Q 50 55 59 45" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
                  <text x="110" y="75" fontSize="28" fill="#94a3b8" textAnchor="middle" fontWeight="bold">≅</text>
                  <polygon points="140,100 200,100 170,20" fill="#f8fafc" stroke="#94a3b8" strokeWidth="3" strokeDasharray="6" strokeLinejoin="round" />
                  <path d="M 161 45 Q 170 55 179 45" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}