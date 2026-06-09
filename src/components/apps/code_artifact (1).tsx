import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, CheckCircle2, HelpCircle, RefreshCcw, ChevronRight, XCircle, Languages, LayoutGrid, RotateCcw, Calculator, ArrowRight, ArrowLeft } from 'lucide-react';

const App = () => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, quiz, summary, review, formulas
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [showChinese, setShowChinese] = useState(true);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // 10 題原始題目模板
  const rawQuestions = [
    {
      id: 1,
      title: "基礎關鍵詞 (Keywords)",
      template: "What is {rate}% of {val}?",
      chineseTemplate: "{val} 的 {rate}% 是多少？",
      clue: "思考：'of' 代表乘法。100% 是 {val}，求其中的部分值。",
      optionsFunc: (v, r) => [
        { text: `${v} + ${r / 100}`, correct: false, desc: "錯誤：百分比是比例，不能與數值直接相加。" },
        { text: `${v} × ${r / 100}`, correct: true, desc: `正確：'of' 即乘法。${v} 的 ${r}% 就是答案。` },
        { text: `${v} ÷ ${r / 100}`, correct: false, desc: "錯誤：除法會令數值變大，不符合求『部分』的邏輯。" },
        { text: `${v} - ${r}`, correct: false, desc: "錯誤：忽略了百分號的比例意義。" }
      ],
      barModel: (v, r) => ({ label1: `${v} (Total)`, val1: 100, label2: `${r}% (?)`, val2: r }),
      items: ["apples", "books", "students", "candies"]
    },
    {
      id: 2,
      title: "百分數增加 (Increase)",
      template: "The price of {item} is ${val}. If the price is increased by {rate}%, what is the new price?",
      chineseTemplate: "{item} 原價 ${val}，增加 {rate}% 後，新價錢是多少？",
      clue: "思考：原價 100% + 增加 {rate}% = {100+rate}%。",
      optionsFunc: (v, r) => [
        { text: `${v} × ${r / 100}`, correct: false, desc: "不完整：這只是計算了增加的金額。" },
        { text: `${v} × ${(1 + r / 100).toFixed(2)}`, correct: true, desc: `正確：新價錢是原來的 ${100 + r}%。` },
        { text: `${v} + ${r}`, correct: false, desc: "錯誤：百分比不能直接當作現金相加。" },
        { text: `${v} ÷ ${(1 + r / 100).toFixed(2)}`, correct: false, desc: "方向錯誤：這是逆向求原價的算法。" }
      ],
      barModel: (v, r) => ({ label1: `${v} (100%)`, val1: 100, label2: `+${r}%`, val2: r }),
      items: ["a toy", "a cake", "a bag", "a cap"]
    },
    {
      id: 3,
      title: "百分數減少 (Decrease)",
      template: "A battery has {val} mAh. After some use, it decreased by {rate}%. What is the current capacity?",
      chineseTemplate: "電池容量原為 {val} mAh，消耗了 {rate}% 後，還剩多少？",
      clue: "思考：剩餘百分比 = 100% - {rate}%。",
      optionsFunc: (v, r) => [
        { text: `${v} × ${(1 - r / 100).toFixed(2)}`, correct: true, desc: `正確：剩餘量是原來的 ${100 - r}%。` },
        { text: `${v} × ${r / 100}`, correct: false, desc: "錯誤：這是消耗掉的電量，不是剩餘量。" },
        { text: `${v} - ${r}`, correct: false, desc: "錯誤：不能直接減去百分比數字。" },
        { text: `${v} ÷ ${(1 - r / 100).toFixed(2)}`, correct: false, desc: "方向錯誤：這是求減少前的原值。" }
      ],
      barModel: (v, r) => ({ label1: `Remaining`, val1: 100 - r, label2: `Used ${r}%`, val2: r }),
      items: ["Battery", "Water tank", "Storage", "Budget"]
    },
    {
      id: 4,
      title: "百分比較 (Comparison)",
      template: "A costs ${val}. B costs ${val2}. By what percentage is A more than B?",
      chineseTemplate: "A 價值 ${val}，B 價值 ${val2}。A 比 B 貴百分之幾？",
      clue: "思考：基準 (100%) 是 'than' 後面的 B。公式：(差距 ÷ B) × 100%",
      optionsFunc: (v, r, v2) => [
        { text: `(${v}-${v2}) ÷ ${v} × 100%`, correct: false, desc: "基準錯誤：分母應是 B (${v2})。" },
        { text: `(${v}-${v2}) ÷ ${v2} × 100%`, correct: true, desc: `正確：(差距 ${v - v2} ÷ 基準 ${v2}) × 100%。` },
        { text: `${v} ÷ ${v2} × 100%`, correct: false, desc: "錯誤：這是求 A 佔 B 的比例。" },
        { text: `${v2} ÷ ${v} × 100%`, correct: false, desc: "錯誤：這是求 B 佔 A 的比例。" }
      ],
      barModel: (v, r, v2) => ({ label1: `B ($${v2})`, val1: 80, label2: `Extra`, val2: 20 }),
      items: ["Phone", "Watch", "Camera", "Tablet"]
    },
    {
      id: 5,
      title: "折扣計算 (Discount)",
      template: "A {item} is marked at ${val}. It is sold at a {rate}% discount. Find the selling price.",
      chineseTemplate: "{item} 標價 ${val}，現以 {rate}% 折扣出售。求售價。",
      clue: "思考：售價 = 標價 × (1 - 折扣%)。",
      optionsFunc: (v, r) => [
        { text: `${v} × ${(1 - r / 100).toFixed(2)}`, correct: true, desc: `正確：售價是標價的 ${100 - r}%。` },
        { text: `${v} × ${r / 100}`, correct: false, desc: "不完整：這只是求折扣了多少錢。" },
        { text: `${v} ÷ ${(1 - r / 100).toFixed(2)}`, correct: false, desc: "方向錯誤：這是求打折前的標價。" },
        { text: `${v} - ${r}`, correct: false, desc: "錯誤：百分比不可直接當作金額減去。" }
      ],
      barModel: (v, r) => ({ label1: `Selling Price`, val1: 100 - r, label2: `Discount ${r}%`, val2: r }),
      items: ["Jacket", "Bicycle", "Laptop", "Speaker"]
    },
    {
      id: 6,
      title: "盈利計算 (Profit)",
      template: "The cost of {item} is ${val}. The profit percentage is {rate}%. Find the selling price.",
      chineseTemplate: "{item} 成本為 ${val}，利潤百分比為 {rate}%。求售價。",
      clue: "思考：售價 = 成本 × (1 + 利潤%)。",
      optionsFunc: (v, r) => [
        { text: `${v} × ${(1 + r / 100).toFixed(2)}`, correct: true, desc: `正確：售價是成本的 ${100 + r}%。` },
        { text: `${v} + ${r / 100}`, correct: false, desc: "錯誤：單位錯誤。" },
        { text: `${v} ÷ ${(1 + r / 100).toFixed(2)}`, correct: false, desc: "方向錯誤：這是求獲利後的原成本。" },
        { text: `${v} × ${r / 100}`, correct: false, desc: "不完整：這只是計算了利潤金額。" }
      ],
      barModel: (v, r) => ({ label1: `Cost ($${v})`, val1: 100, label2: `Profit ${r}%`, val2: r }),
      items: ["Shoes", "Watch", "Game Console", "Earphones"]
    },
    {
      id: 7,
      title: "虧蝕計算 (Loss)",
      template: "A shop sells {item} which costs ${val} at a loss of {rate}%. Find the selling price.",
      chineseTemplate: "商店以虧蝕 {rate}% 售出成本 ${val} 的 {item}。求售價。",
      clue: "思考：虧蝕代表售價低於成本。售價 = 成本 × (1 - 虧蝕%)。",
      optionsFunc: (v, r) => [
        { text: `${v} × ${(1 - r / 100).toFixed(2)}`, correct: true, desc: `正確：售價只有成本的 ${100 - r}%。` },
        { text: `${v} × ${(1 + r / 100).toFixed(2)}`, correct: false, desc: "錯誤：這是盈利的算法。" },
        { text: `${v} - ${r}`, correct: false, desc: "錯誤：不能直接減百分數。" },
        { text: `${v} ÷ ${(1 - r / 100).toFixed(2)}`, correct: false, desc: "方向錯誤。" }
      ],
      barModel: (v, r) => ({ label1: `Selling`, val1: 100 - r, label2: `Loss ${r}%`, val2: r }),
      items: ["Bread", "Milk", "Old Phone", "Used Book"]
    },
    {
      id: 8,
      title: "逆向折扣 (Reverse Discount)",
      template: "After a {rate}% discount, {item} costs ${val}. Find the marked price.",
      chineseTemplate: "打 {discount} 折後，{item} 賣 ${val}。求標價。",
      clue: "思考：已知『部分』求『整體』。標價 = 售價 ÷ (1 - 折扣%)。",
      optionsFunc: (v, r) => [
        { text: `${v} ÷ ${(1 - r / 100).toFixed(2)}`, correct: true, desc: `正確：售價是標價的 ${100 - r}%，用除法還原 100%。` },
        { text: `${v} × ${(1 - r / 100).toFixed(2)}`, correct: false, desc: "錯誤：標價應比售價貴。" },
        { text: `${v} × ${(1 + r / 100).toFixed(2)}`, correct: false, desc: "錯誤：基準是標價，不是售價。" },
        { text: `${v} ÷ ${r / 100}`, correct: false, desc: "錯誤。" }
      ],
      barModel: (v, r) => ({ label1: `${v} (售價)`, val1: 100 - r, label2: `${r}% Off`, val2: r }),
      items: ["Bag", "Dress", "Monitor", "Keyboard"]
    },
    {
      id: 9,
      title: "逆向盈利 (Reverse Profit)",
      template: "A shop sells {item} for ${val} and makes a {rate}% profit. Find the cost.",
      chineseTemplate: "售價 ${val} 售出 {item}，賺了 {rate}%。求成本。",
      clue: "思考：成本是 100%。售價是 100% + {rate}%。成本 = 售價 ÷ (1 + 利潤%)。",
      optionsFunc: (v, r) => [
        { text: `${v} ÷ ${(1 + r / 100).toFixed(2)}`, correct: true, desc: `正確：用除法還原 100% 成本。` },
        { text: `${v} × ${(1 + r / 100).toFixed(2)}`, correct: false, desc: "錯誤：成本應比售價低。" },
        { text: `${v} × ${(1 - r / 100).toFixed(2)}`, correct: false, desc: "錯誤：不能直接乘 (1-r%)，基準錯了。" },
        { text: `${v} - ${r / 100}`, correct: false, desc: "錯誤。" }
      ],
      barModel: (v, r) => ({ label1: `Cost (?)`, val1: 100, label2: `Profit`, val2: r }),
      items: ["Cap", "Pen", "Desk", "Lamp"]
    },
    {
      id: 10,
      title: "找尋百分率 (Find Percentage)",
      template: "A student scored {val} out of {val2} in a test. What is the percentage score?",
      chineseTemplate: "學生在總分 {val2} 的測驗中得到 {val} 分。百分比分數是多少？",
      clue: "思考：(部分 ÷ 整體) × 100%。",
      optionsFunc: (v, r, v2) => [
        { text: `${v} ÷ ${v2} × 100%`, correct: true, desc: "正確：這是最基本的百分率定義。" },
        { text: `${v2} ÷ ${v} × 100%`, correct: false, desc: "錯誤：分母應是總分。" },
        { text: `${v} × ${v2} ÷ 100%`, correct: false, desc: "錯誤：不應使用乘法。" },
        { text: `(${v2} - ${v}) ÷ ${v2} × 100%`, correct: false, desc: "錯誤：這是求扣分的百分比。" }
      ],
      barModel: (v, r, v2) => ({ label1: `Score ${v}`, val1: 75, label2: `Missed`, val2: 25 }),
      items: ["Math", "English", "Science", "Music"]
    }
  ];

  // 隨機化函數 (略作調整以適配 10 題)
  const generateQuestion = (q) => {
    const rate = [10, 20, 25, 30, 40, 50][Math.floor(Math.random() * 6)];
    const val2 = [100, 200, 400, 500, 800, 1000][Math.floor(Math.random() * 6)];
    const val = val2 * 0.8; 
    const item = q.items[Math.floor(Math.random() * q.items.length)];
    const discount = (10 - rate / 10).toString();

    return {
      ...q,
      english: q.template.replace('{rate}', rate).replace('{val}', val).replace('{val2}', val2).replace('{item}', item),
      chinese: q.chineseTemplate.replace('{rate}', rate).replace('{val}', val).replace('{val2}', val2).replace('{item}', item).replace('{discount}', discount),
      clue: q.clue.replace('{rate}', rate).replace('{val}', val).replace('{val2}', val2),
      options: q.optionsFunc(val, rate, val2),
      barModelData: q.barModel(val, rate, val2)
    };
  };

  const startQuiz = () => {
    const qList = rawQuestions.map(q => generateQuestion(q));
    setActiveQuestions(qList);
    setCurrentStep('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setWrongQuestions([]);
    setIsReviewMode(false);
  };

  const startReview = () => {
    const qList = wrongQuestions.map(q => generateQuestion(q));
    setActiveQuestions(qList);
    setCurrentStep('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setWrongQuestions([]);
    setIsReviewMode(true);
  };

  const handleAnswer = (idx) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    setShowFeedback(true);
    const isCorrect = activeQuestions[currentQuestionIndex].options[idx].correct;
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWrongQuestions(prev => [...prev, activeQuestions[currentQuestionIndex]]);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep('summary');
    }
  };

  const labels = ["A", "B", "C", "D"];

  const formulaList = [
    { name: "基本求值 (Basic Value)", f: "Value = Total × Percentage", note: "看到 'of' 就要用乘法。" },
    { name: "百分數增加 (Increase)", f: "New = Original × (1 + r%)", note: "先把 100% 加上增加的部分。" },
    { name: "百分數比較 (Comparison)", f: "% Change = (Difference ÷ Base) × 100%", note: "分母永遠是 'than' 後面的對象。" },
    { name: "求原價/成本 (Reverse)", f: "Original = New ÷ (1 ± r%)", note: "已知部分求整體，要用除法。" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Navigation */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
              <Calculator className="text-white" size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">Percent Master</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setCurrentStep('formulas')}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span className="hidden md:inline text-sm font-bold">公式手冊</span>
            </button>
            <button 
              onClick={() => setShowChinese(!showChinese)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                showChinese ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-amber-500/20 border-amber-500/50 text-amber-500'
              }`}
            >
              <Languages size={18} />
              <span className="hidden md:inline text-sm font-bold">{showChinese ? "中譯: 開" : "中譯: 關"}</span>
            </button>
          </div>
        </div>

        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 md:p-16 text-center animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">全方位 10 題特訓</h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              涵蓋增加、減少、盈利、虧蝕、折扣及逆向計法。答錯的題目會進入複習庫，讓你在結尾重新挑戰。
            </p>
            <button onClick={startQuiz} className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[2rem] text-xl font-black shadow-2xl shadow-indigo-600/40 transition-all active:scale-95">
              開始特訓 (10 題)
            </button>
          </div>
        )}

        {/* Formulas Step */}
        {currentStep === 'formulas' && (
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 animate-in slide-in-from-right-10 duration-500 overflow-hidden">
            <button onClick={() => setCurrentStep('intro')} className="mb-8 text-indigo-400 font-bold flex items-center gap-2 hover:text-indigo-300">
              <RotateCcw size={18}/> 返回首頁
            </button>
            
            <h2 className="text-3xl font-black text-white mb-8">百分率與買賣關係圖 (CMS)</h2>

            <div className="bg-[#0d1117] p-8 md:p-12 rounded-[2.5rem] border border-slate-800 mb-12 relative overflow-x-auto">
              <div className="min-w-[600px] flex justify-between items-center px-4 mb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-3xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center flex-col">
                    <span className="text-slate-500 font-black text-xs uppercase mb-1">C</span>
                    <span className="text-white font-black text-xl">COST</span>
                    <span className="text-slate-400 text-xs font-bold mt-1">成本</span>
                  </div>
                </div>
                <div className="flex-grow flex flex-col items-center px-4 relative">
                  <div className="text-green-400 font-black text-sm mb-2">× (1 + Profit%)</div>
                  <div className="w-full h-1 bg-slate-700 rounded-full relative">
                    <div className="absolute right-0 -top-1.5"><ArrowRight className="text-slate-700" size={16} /></div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-36 h-36 rounded-3xl bg-indigo-600 border-4 border-indigo-400 flex items-center justify-center flex-col">
                    <span className="text-indigo-200 font-black text-xs uppercase mb-1">S</span>
                    <span className="text-white font-black text-xl">SELLING</span>
                    <span className="text-white font-black text-xl">PRICE</span>
                    <span className="text-indigo-200 text-xs font-bold mt-1">售價</span>
                  </div>
                </div>
                <div className="flex-grow flex flex-col items-center px-4 relative">
                  <div className="text-rose-400 font-black text-sm mb-2">× (1 - Disc%)</div>
                  <div className="w-full h-1 bg-slate-700 rounded-full relative">
                    <div className="absolute left-0 -top-1.5"><ArrowLeft className="text-slate-700" size={16} /></div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-3xl bg-amber-500/20 border-4 border-amber-500/50 flex items-center justify-center flex-col">
                    <span className="text-amber-500/70 font-black text-xs uppercase mb-1">M</span>
                    <span className="text-amber-500 font-black text-xl">MARKED</span>
                    <span className="text-amber-500 font-black text-xl">PRICE</span>
                    <span className="text-amber-600 text-xs font-bold mt-1">標價</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-800/50">
                <div className="text-xs text-slate-400 leading-relaxed">
                   <span className="text-green-400 font-bold">求售價 (由成本)：</span><br/>
                   Selling Price = Cost × (1 + P%)
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                   <span className="text-amber-500 font-bold">求售價 (由標價)：</span><br/>
                   Selling Price = Marked × (1 - D%)
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-6">核心公式列表</h2>
            <div className="grid gap-6">
              {formulaList.map((f, i) => (
                <div key={i} className="bg-[#0d1117] p-8 rounded-[2rem] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-indigo-400 font-black mb-2">{f.name}</h4>
                    <p className="text-2xl md:text-3xl font-mono text-white font-bold">{f.f}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-sm text-slate-400 italic">💡 {f.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Step */}
        {currentStep === 'quiz' && activeQuestions.length > 0 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-sm font-black text-slate-500 uppercase tracking-widest">
                {isReviewMode ? "複習模式 (Review Mode)" : `Question ${currentQuestionIndex + 1} / ${activeQuestions.length}`}
              </span>
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }} />
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <div className="mb-10">
                <span className="text-indigo-400 font-black text-sm uppercase tracking-wider mb-4 block">{activeQuestions[currentQuestionIndex].title}</span>
                <h3 className="text-3xl md:text-4xl font-bold text-white leading-snug mb-6">{activeQuestions[currentQuestionIndex].english}</h3>
                {showChinese && <div className="text-xl text-slate-400 font-medium italic border-l-4 border-slate-700 pl-6 py-2">中譯：{activeQuestions[currentQuestionIndex].chinese}</div>}
              </div>

              <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 md:p-8 rounded-[2rem] flex items-start gap-4 mb-12">
                <div className="bg-indigo-500 p-2 rounded-xl"><HelpCircle className="text-white" size={24} /></div>
                <p className="text-indigo-200 text-lg md:text-xl font-bold leading-relaxed">{activeQuestions[currentQuestionIndex].clue}</p>
              </div>

              <div className="grid gap-6">
                {activeQuestions[currentQuestionIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showFeedback}
                    className={`p-6 md:p-8 text-left rounded-[2rem] border-4 transition-all flex items-center gap-6 ${
                      showFeedback ? (opt.correct ? 'border-green-500 bg-green-500/10' : selectedAnswer === idx ? 'border-red-500 bg-red-500/10' : 'border-slate-800 opacity-50') 
                      : 'border-slate-800 bg-slate-900 hover:border-indigo-500/50'
                    }`}
                  >
                    <span className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-xl font-black">{labels[idx]}</span>
                    <span className="text-2xl font-mono font-black">{opt.text}</span>
                  </button>
                ))}
              </div>

              {showFeedback && (
                <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-10">
                  <div className={`p-8 rounded-[2rem] text-xl font-bold border-2 ${activeQuestions[currentQuestionIndex].options[selectedAnswer].correct ? 'bg-green-900/30 border-green-500/40 text-green-200' : 'bg-red-900/30 border-red-500/40 text-red-200'}`}>
                    {activeQuestions[currentQuestionIndex].options[selectedAnswer].desc}
                  </div>
                  <button onClick={nextQuestion} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3">
                    繼續下一題 <ChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Step */}
        {currentStep === 'summary' && (
          <div className="bg-[#161b22] border border-slate-800 rounded-[3rem] p-12 text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40"><CheckCircle2 size={48} className="text-white" /></div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">訓練結束</h2>
            <div className="text-6xl font-black text-indigo-500 mb-8">{score} / {activeQuestions.length}</div>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              {wrongQuestions.length > 0 && (
                <button onClick={startReview} className="flex-grow py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3">
                  <RotateCcw size={24} /> 複習錯題 ({wrongQuestions.length})
                </button>
              )}
              <button onClick={startQuiz} className="flex-grow py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3">
                <RefreshCcw size={24} /> 重新開始全部
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;