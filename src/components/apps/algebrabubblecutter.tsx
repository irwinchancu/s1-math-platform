import React, { useState, useEffect } from 'react';
import { Scissors, Shield, Wand2, CheckCircle, AlertCircle, ArrowRight, RefreshCcw, Info, ChevronDown, Layers, BookOpen, BrainCircuit, GraduationCap, XCircle } from 'lucide-react';

// --- Vocabulary Data (With Examples and Non-Examples) ---
const VOCAB_LIST = [
  { 
    en: "Term", zh: "項", 
    desc: "A single number, a variable, or numbers and variables multiplied together. Separated by + or - signs. / 一個數字、變數，或兩者相乘的組合。由加號或減號分隔。", 
    eg: "3x, -4y, 5 (Each is a single term / 這些各自是單一個項)",
    nonEg: "3x + 5 (This is an expression with TWO terms / 這是包含了兩個項的代數式)" 
  },
  { 
    en: "Coefficient", zh: "係數", 
    desc: "A number used to multiply a variable. / 用來乘變數的數字，通常寫在變數前面。", 
    eg: "In 3x, 3 is the coefficient. (在 3x 中，3 是係數)",
    nonEg: "In x², 2 is the exponent, not the coefficient. (在 x² 中，2 是指數，不是係數)"
  },
  { 
    en: "Variable", zh: "變數 / 未知數", 
    desc: "A symbol for a number we don't know yet, usually a letter like x or y. / 代表未知數值的符號，通常是英文字母。", 
    eg: "x, y, a, b",
    nonEg: "7, π (These are constants, their values never change / 這些是數值固定的常數)"
  },
  { 
    en: "Constant", zh: "常數", 
    desc: "A number on its own with no variables. / 單獨存在、沒有變數跟隨的數字。", 
    eg: "In 3x + 5, 5 is the constant. (在 3x + 5 中，5 是常數)",
    nonEg: "In 3x + 5, 3 is a coefficient, not a constant. (在 3x + 5 中，3 是係數，不能叫常數)"
  },
  { 
    en: "Expression", zh: "代數式", 
    desc: "A mathematical phrase that contains numbers, variables, and operators. / 包含數字、變數和運算符號的數學算式。", 
    eg: "2x + 3y - 7",
    nonEg: "2x + 3y = 7 (This is an EQUATION because it has an '=' sign / 因為有等號，所以這叫方程式)"
  },
  { 
    en: "Fraction Bar (Vinculum)", zh: "分數線", 
    desc: "The line separating the numerator and denominator. It acts like a bracket. / 分隔分子與分母的橫線，在代數中具有括號的作用。", 
    eg: "(x+1) / 2 (The line groups x+1 together / 分數線將 x+1 鎖在一起作為一個整體)",
    nonEg: "x + 1/2 (Here, the fraction only applies to 1 / 這裡的分數線只鎖定了 1 和 2)"
  },
  { 
    en: "Distributive Law", zh: "分配律", 
    desc: "Multiplying a number by a group of numbers added together inside a bracket. / 將括號外的乘數，分配乘入括號內的每一項。", 
    eg: "2(x+3) = 2x + 6",
    nonEg: "2(x+3) = 2x + 3 (Wrong! Forgot to multiply the 3 / 錯誤示範！忘記把 2 乘給後面的 3 了)"
  },
  { 
    en: "Like Terms", zh: "同類項", 
    desc: "Terms whose variables (and their exponents) are the same. / 具有相同變數及相同指數的項，可以互相加減。", 
    eg: "2x and -5x (Same variable, same power / 變數相同，指數也相同)",
    nonEg: "2x and 5x² (Different exponents! / 指數不同！不能相加), 2x and 5y"
  }
];

// --- Level Data (Bilingual) ---
const LEVELS = [
  {
    id: 0,
    title: "Level 0: Number Arithmetic / 第 0 關：數字四則運算",
    desc: "Even pure numbers have 'terms'! Multiplication (×) and division (÷) bind numbers together. / 即使是純數字也有「項」！乘除法會把數字黏在一起，只能在加減號處切開！",
    initialTerms: [
      {
        id: 't0', tokens: [
          { id: '0-1', t: '10', type: 'num' },
          { id: '0-2', t: '-', type: 'op', canCut: true },
          { id: '0-3', t: '3', type: 'num' },
          { id: '0-4', t: '×', type: 'op', canCut: false, errorMsg: 'Multiply/Divide binds numbers! / 乘除號就像強力膠把數字黏住了，不能切！' },
          { id: '0-5', t: '2', type: 'num' },
          { id: '0-6', t: '+', type: 'op', canCut: true },
          { id: '0-7', t: '8', type: 'num' },
          { id: '0-8', t: '÷', type: 'op', canCut: false, errorMsg: 'Multiply/Divide binds numbers! / 乘除號就像強力膠把數字黏住了，不能切！' },
          { id: '0-9', t: '4', type: 'num' }
        ]
      }
    ],
    targetCount: 3
  },
  {
    id: 1,
    title: "Basics: Meet the 'Terms' / 第 1 關：認識「代數項」",
    desc: "An algebraic expression is made up of 'terms'. Click the ➕ or ➖ signs to split them! / 代數式是由多個「項」組成的。點擊非括號內的加號或減號把它們切開！",
    initialTerms: [
      {
        id: 't1', tokens: [
          { id: '1-1', t: '3x', type: 'var' }, { id: '1-2', t: '-', type: 'op', canCut: true },
          { id: '1-3', t: '4y', type: 'var' }, { id: '1-4', t: '+', type: 'op', canCut: true },
          { id: '1-5', t: '5', type: 'num' },
        ]
      }
    ],
    targetCount: 3
  },
  {
    id: 2,
    title: "Advanced: Brackets / 第 2 關：括號與混和項",
    desc: "A number attached to a bracket (e.g. 3(x+5)) acts as a single unit before expansion. / 數字與括號相連時，它們在未展開前是一個整體。",
    initialTerms: [
      {
        id: 't2', tokens: [
          { id: '2-1', t: '7', type: 'num' }, { id: '2-2', t: '-', type: 'op', canCut: true },
          { id: '2-3', t: '3', type: 'num' }, { id: '2-4', t: '(', type: 'bracket', isShield: true },
          { id: '2-5', t: 'x', type: 'var', isShielded: true }, { id: '2-6', t: '+', type: 'op', canCut: false, isShielded: true },
          { id: '2-7', t: '5', type: 'num', isShielded: true }, { id: '2-8', t: ')', type: 'bracket', isShield: true },
          { id: '2-9', t: '+', type: 'op', canCut: true }, { id: '2-10', t: '8x', type: 'var' }
        ]
      }
    ],
    targetCount: 3
  },
  {
    id: 3,
    title: "Challenge: Double Brackets / 第 3 關：連乘括號",
    desc: "Two brackets multiplied together is ONE term! Where should you cut? / 兩個括號連在一起是一組相乘的整體。你能在哪裡下刀？",
    initialTerms: [
      {
        id: 't3', tokens: [
          { id: '3-1', t: '3', type: 'num' }, { id: '3-2', t: '-', type: 'op', canCut: true },
          { id: '3-3', t: '(', type: 'bracket', isShield: true }, { id: '3-4', t: 'x', type: 'var', isShielded: true },
          { id: '3-5', t: '+', type: 'op', canCut: false, isShielded: true }, { id: '3-6', t: '2', type: 'num', isShielded: true },
          { id: '3-7', t: ')', type: 'bracket', isShield: true }, { id: '3-8', t: '(', type: 'bracket', isShield: true },
          { id: '3-9', t: 'x', type: 'var', isShielded: true }, { id: '3-10', t: '-', type: 'op', canCut: false, isShielded: true },
          { id: '3-11', t: '3', type: 'num', isShielded: true }, { id: '3-12', t: ')', type: 'bracket', isShield: true },
        ]
      }
    ],
    targetCount: 2
  },
  {
    id: 4,
    title: "Master: Exponents / 第 4 關：平方與指數",
    desc: "Is the square (²) outside the bracket part of the term? Try cutting it! / 括號外面的平方 (²) 是「項」的一部分嗎？試試看！",
    initialTerms: [
      {
        id: 't4', tokens: [
          { id: '4-1', t: '5', type: 'num' }, { id: '4-2', t: '-', type: 'op', canCut: true },
          { id: '4-3', t: '6', type: 'num' }, { id: '4-4', t: '(', type: 'bracket', isShield: true },
          { id: '4-5', t: 'x', type: 'var', isShielded: true }, { id: '4-6', t: '+', type: 'op', canCut: false, isShielded: true },
          { id: '4-7', t: '2', type: 'num', isShielded: true }, { id: '4-8', t: ')', type: 'bracket', isShield: true },
          { id: '4-9', t: '²', type: 'exp', isShielded: false } 
        ]
      }
    ],
    targetCount: 2
  },
  {
    id: 5,
    title: "Trap: Fraction Bar / 第 5 關：分數線陷阱",
    desc: "A fraction bar acts like a bracket, locking the numerator together. / 分數線具有括號功能，會把分子鎖在一起。找出真正的分隔符號。",
    initialTerms: [
      {
        id: 't6', tokens: [
          { id: '6-1', t: '4', type: 'num' }, { id: '6-2', t: '-', type: 'op', canCut: true },
          {
            id: '6-3', type: 'fraction',
            numTokens: [ { id: '6-3-1', t: 'x', type: 'var', isShielded: true }, { id: '6-3-2', t: '+', type: 'op', canCut: false, isShielded: true }, { id: '6-3-3', t: '3', type: 'num', isShielded: true } ],
            denTokens: [ { id: '6-3-4', t: '2', type: 'num', isShielded: true } ]
          },
          { id: '6-7', t: '+', type: 'op', canCut: true }, { id: '6-8', t: 'y', type: 'var' }
        ]
      }
    ],
    targetCount: 3
  },
  {
    id: 6,
    title: "Final Boss / 終極大魔王",
    desc: "Exponents, fractions, and brackets all together. Stay calm and cut! / 綜合了平方、分數與係數括號。運用你學過的所有「力場」知識！",
    initialTerms: [
      {
        id: 't7', tokens: [
          { id: '7-1', t: '5x', type: 'var' }, { id: '7-2', t: '²', type: 'exp', isShielded: false },
          { id: '7-3', t: '-', type: 'op', canCut: true },
          {
            id: '7-4', type: 'fraction',
            numTokens: [ { id: '7-4-1', t: '3y', type: 'var', isShielded: true }, { id: '7-4-2', t: '-', type: 'op', canCut: false, isShielded: true }, { id: '7-4-3', t: '1', type: 'num', isShielded: true } ],
            denTokens: [ { id: '7-4-4', t: '4', type: 'num', isShielded: true } ]
          },
          { id: '7-8', t: '+', type: 'op', canCut: true }, { id: '7-9', t: '2', type: 'num' },
          { id: '7-10', t: '(', type: 'bracket', isShield: true }, { id: '7-11', t: 'x', type: 'var', isShielded: true },
          { id: '7-12', t: '-', type: 'op', canCut: false, isShielded: true }, { id: '7-13', t: '7', type: 'num', isShielded: true },
          { id: '7-14', t: ')', type: 'bracket', isShield: true },
        ]
      }
    ],
    targetCount: 3
  }
];

// --- Quiz Data ---
const QUIZ_LEVELS = [
  { id: 'q0', targetCount: 3, terms: [{ id: 'qt0', tokens: [{ id: 'q0-1', t: '15', type: 'num' }, { id: 'q0-2', t: '-', type: 'op', canCut: true }, { id: 'q0-3', t: '2', type: 'num' }, { id: 'q0-4', t: '×', type: 'op', canCut: false, errorMsg: "Multiplication binds numbers! / 乘號把數字黏住了！" }, { id: 'q0-5', t: '5', type: 'num' }, { id: 'q0-6', t: '+', type: 'op', canCut: true }, { id: 'q0-7', t: '4', type: 'num' }] }] },
  { id: 'q1', targetCount: 3, terms: [{ id: 'qt1', tokens: [{ id: 'q1-1', t: '5a', type: 'var' }, { id: 'q1-2', t: '-', type: 'op', canCut: true }, { id: 'q1-3', t: '3b', type: 'var' }, { id: 'q1-4', t: '+', type: 'op', canCut: true }, { id: 'q1-5', t: '2', type: 'num' }] }] },
  { id: 'q2', targetCount: 2, terms: [{ id: 'qt2', tokens: [{ id: 'q2-1', t: '10', type: 'num' }, { id: 'q2-2', t: '-', type: 'op', canCut: true }, { id: 'q2-3', t: '4', type: 'num' }, { id: 'q2-4', t: '(', type: 'bracket', isShield: true }, { id: 'q2-5', t: 'x', type: 'var', isShielded: true }, { id: 'q2-6', t: '+', type: 'op', canCut: false, isShielded: true }, { id: 'q2-7', t: '1', type: 'num', isShielded: true }, { id: 'q2-8', t: ')', type: 'bracket', isShield: true }] }] },
  { id: 'q3', targetCount: 2, terms: [{ id: 'qt3', tokens: [{ id: 'q3-1', type: 'fraction', numTokens: [{ id: 'q3-1a', t: '2x', type: 'var', isShielded: true }, { id: 'q3-1b', t: '-', type: 'op', canCut: false, isShielded: true }, { id: 'q3-1c', t: '5', type: 'num', isShielded: true }], denTokens: [{ id: 'q3-1d', t: '3', type: 'num', isShielded: true }] }, { id: 'q3-2', t: '+', type: 'op', canCut: true }, { id: 'q3-3', t: '4y', type: 'var' }] }] },
  { id: 'q4', targetCount: 3, terms: [{ id: 'qt4', tokens: [{ id: 'q4-1', t: 'x', type: 'var' }, { id: 'q4-2', t: '²', type: 'exp' }, { id: 'q4-3', t: '-', type: 'op', canCut: true }, { id: 'q4-4', t: '(', type: 'bracket', isShield: true }, { id: 'q4-5', t: 'y', type: 'var', isShielded: true }, { id: 'q4-6', t: '+', type: 'op', canCut: false, isShielded: true }, { id: 'q4-7', t: '2', type: 'num', isShielded: true }, { id: 'q4-8', t: ')', type: 'bracket', isShield: true }, { id: 'q4-9', t: '(', type: 'bracket', isShield: true }, { id: 'q4-10', t: 'y', type: 'var', isShielded: true }, { id: 'q4-11', t: '-', type: 'op', canCut: false, isShielded: true }, { id: 'q4-12', t: '1', type: 'num', isShielded: true }, { id: 'q4-13', t: ')', type: 'bracket', isShield: true }, { id: 'q4-14', t: '+', type: 'op', canCut: true }, { id: 'q4-15', t: '7', type: 'num' }] }] },
  { id: 'q5', targetCount: 3, terms: [{ id: 'qt5', tokens: [{ id: 'q5-1', t: '10', type: 'num' }, { id: 'q5-2', t: '-', type: 'op', canCut: true }, { id: 'q5-3', type: 'fraction', numTokens: [{ id: 'q5-3a', t: 'x', type: 'var', isShielded: true }, { id: 'q5-3b', t: '+', type: 'op', canCut: false, isShielded: true }, { id: 'q5-3c', t: '1', type: 'num', isShielded: true }], denTokens: [{ id: 'q5-3d', t: '2', type: 'num', isShielded: true }] }, { id: 'q5-4', t: '+', type: 'op', canCut: true }, { id: 'q5-5', t: '3', type: 'num' }, { id: 'q5-6', t: '(', type: 'bracket', isShield: true }, { id: 'q5-7', t: 'x', type: 'var', isShielded: true }, { id: 'q5-8', t: '-', type: 'op', canCut: false, isShielded: true }, { id: 'q5-9', t: '2', type: 'num', isShielded: true }, { id: 'q5-10', t: ')', type: 'bracket', isShield: true }, { id: 'q5-11', t: '²', type: 'exp' }] }] }
];


export default function App() {
  const [appMode, setAppMode] = useState('learn');
  
  // Learn State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [selectedBonusTerm, setSelectedBonusTerm] = useState(null);

  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizErrors, setQuizErrors] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Shared Game State
  const [terms, setTerms] = useState([]);
  const [feedback, setFeedback] = useState({ message: '', type: 'info' });
  const [shakeTokenId, setShakeTokenId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const initLevel = () => {
    if (appMode === 'learn') {
      setTerms(LEVELS[currentLevelIdx].initialTerms);
      setFeedback({ message: 'Ready? Click the operators! / 準備好了嗎？點擊符號開始切開！', type: 'info' });
      setSelectedBonusTerm(null);
    } else if (appMode === 'quiz') {
      if (quizIdx < QUIZ_LEVELS.length) {
        setTerms(QUIZ_LEVELS[quizIdx].terms);
        setFeedback({ message: `Question ${quizIdx + 1} / 第 ${quizIdx + 1} 題. Slice it!`, type: 'info' });
      }
    }
    setIsCompleted(false);
  };

  useEffect(() => {
    initLevel();
  }, [currentLevelIdx, quizIdx, appMode]);

  useEffect(() => {
    const target = appMode === 'learn' ? LEVELS[currentLevelIdx].targetCount : (QUIZ_LEVELS[quizIdx] ? QUIZ_LEVELS[quizIdx].targetCount : 0);
    if (!quizFinished && terms.length === target) {
      setIsCompleted(true);
      setFeedback({ message: '🎉 Correct! Target terms reached. / 成功！已找出所有獨立項！', type: 'success' });
    }
  }, [terms, currentLevelIdx, quizIdx, appMode, quizFinished]);

  const triggerShake = (id) => {
    setShakeTokenId(id);
    setTimeout(() => setShakeTokenId(null), 500);
  };

  const handleTokenClick = (termIndex, tokenIndex, token) => {
    if (isCompleted || quizFinished) return;

    if (token.type !== 'op' && token.type !== 'exp') {
      setFeedback({ message: "⚠️ Can't cut here! / 這裡不能切！數字與字母相連。", type: "error" });
      triggerShake(token.id);
      if (appMode === 'quiz') setQuizErrors(e => e + 1);
      return;
    }

    if (!token.canCut) {
      // 支援自訂的錯誤訊息 (例如乘除號的提示)
      const msg = token.errorMsg || (token.isShielded ? "🛡️ Force Field Active! Inside brackets/fractions are protected! / 力場保護中！括號或分數內部不能切！" : "⚠️ Invalid cut point. / 這裡不是分隔點。");
      setFeedback({ message: msg, type: "error" });
      triggerShake(token.id);
      if (appMode === 'quiz') setQuizErrors(e => e + 1);
      return;
    }

    const targetTerm = terms[termIndex];
    const leftTokens = targetTerm.tokens.slice(0, tokenIndex);
    const rightTokens = targetTerm.tokens.slice(tokenIndex);

    const newTerms = [
      ...terms.slice(0, termIndex),
      { id: `t-${Date.now()}-L`, tokens: leftTokens },
      { id: `t-${Date.now()}-R`, tokens: rightTokens },
      ...terms.slice(termIndex + 1)
    ];

    setTerms(newTerms);
    setFeedback({ message: "✂️ Success! Term separated. / 成功！分離出一個新項。", type: "success" });
  };

  const startQuiz = () => {
    setQuizIdx(0);
    setQuizErrors(0);
    setQuizFinished(false);
    setAppMode('quiz');
  };

  // Bilingual Math Engine (Bonus Explanation)
  const getBonusExplanation = (term) => {
    let termStr = '';
    term.tokens.forEach(t => {
        if (t.type === 'fraction') termStr += `(${t.numTokens.map(n=>n.t).join('')})/${t.denTokens.map(d=>d.t).join('')}`;
        else termStr += t.t;
    });
    const cleanStr = termStr.replace(/\s+/g, '');

    // Level 0 - Number Arithmetic
    if (cleanStr.includes('3×2') || cleanStr.includes('3*2')) {
        return {
            title: "💡 Multiplication Term / 乘法項",
            content: "Multiplication glues numbers together. Calculate this before adding/subtracting! / 乘法就像強力膠把數字黏在一起。必須在加減之前先計算！",
            formula: "  -3 × 2\n= -6",
            detail: "Order of operations: multiply first! / 運算順序：先乘除後加減！"
        };
    }
    if (cleanStr.includes('8÷4') || cleanStr.includes('8/4')) {
        return {
            title: "💡 Division Term / 除法項",
            content: "Division glues numbers together. Calculate this before adding/subtracting! / 除法也會把數字黏在一起。必須在加減之前先計算！",
            formula: "  +8 ÷ 4\n= +2",
            detail: "Order of operations: divide first! / 運算順序：先乘除後加減！"
        };
    }

    if (cleanStr.includes('-(x+2)(x-3)')) {
        return {
            title: "💡 Double Brackets / 雙重括號連乘",
            content: "Use FOIL to expand the brackets. / 使用分配律將兩個括號互相相乘。",
            formula: "  -(x + 2)(x - 3)\n= -(x² - 3x + 2x - 6)\n= -(x² - x - 6)\n= -x² + x + 6",
            detail: "Expand brackets first, then apply the negative sign to flip all symbols. / 先展開內部，最後將外面的負號分配進去，全部變號。"
        };
    }
    if (cleanStr.includes('-6(x+2)²')) {
        return {
            title: "💡 Perfect Square / 完全平方",
            content: "Expand the exponent before multiplying the coefficient! / 括號外有平方時，必須先展開完全平方。",
            formula: "  -6(x + 2)²\n= -6(x² + 4x + 4)\n= -6x² - 24x - 24",
            detail: "Error warning: You cannot just square x and 2. / 常見錯誤：不能只把平方分給 x 和 2，必須先展開 (a+b)²。"
        };
    }
    if (cleanStr.includes('-(x+3)/2')) {
        return {
            title: "💡 Fraction Expansion / 分數展開",
            content: "Divide every term in the numerator by the denominator. / 利用分配律把分子每一項都除以分母：",
            formula: "  -(x + 3) / 2\n= -x/2 - 3/2",
            detail: "The negative sign distributes to BOTH x and 3. / 前面的負號會分配給分子內的每一個成員。"
        };
    }
    if (cleanStr.includes('-(3y-1)/4')) {
        return {
            title: "💡 Sign Trap / 變號陷阱",
            content: "A minus sign before a fraction flips EVERY sign inside the numerator. / 分數前的負號，會改變分子所有項的符號。",
            formula: "  -(3y - 1) / 4\n= -3y/4 - (-1/4)\n= -3y/4 + 1/4",
            detail: "Negative × Negative = Positive! / 注意！-1 遇到前面的負號，會「負負得正」變成 +1/4。"
        };
    }
    if (cleanStr.includes('-3(x+5)')) {
        return {
            title: "💡 Distributive Law / 負係數分配律",
            content: "Multiply the outside number into every term inside. / 將外面的數字乘入括號內的每一項。",
            formula: "  -3(x + 5)\n= -3(x) - 3(5)\n= -3x - 15",
            detail: "Remember 'Negative × Positive = Negative'. / 注意「負正得負」，所以 +5 變成了 -15。"
        };
    }
    if (cleanStr.includes('+2(x-7)')) {
        return {
            title: "💡 Distributive Law / 分配律",
            content: "Multiply the coefficient into the bracket. / 將外面的係數乘入括號內的每一項。",
            formula: "  +2(x - 7)\n= 2(x) + 2(-7)\n= 2x - 14",
            detail: "The positive outside sign keeps the inner signs the same. / 外面是正號，裡面的符號不會改變。"
        };
    }
    if (cleanStr.includes('5x²')) {
        return {
           title: "💡 Exponent Property / 指數分析",
           content: "The exponent only applies to the variable it touches. / 指數只作用於緊貼著它的變數上。",
           formula: "5x² = 5 · x · x",
           detail: "It's 5 times x-squared, not the whole (5x) squared. / 平方只屬於 x，不屬於 5。"
        }
    }

    const hasVar = term.tokens.some(t => t.type === 'var');
    const hasNum = term.tokens.some(t => t.type === 'num');
    
    if (hasVar && hasNum) {
        const coeff = cleanStr.replace(/[a-zA-Z]/g, '');
        const variable = cleanStr.replace(/[^a-zA-Z]/g, '');
        return {
            title: "💡 Basic Term / 基本代數項",
            content: "A standard term with a coefficient and variable. / 由「係數」和「變數」組成。",
            formula: `${cleanStr} = ${coeff} · ${variable}`,
            detail: "A hidden multiplication sign binds them together! / 數字和字母中間隱藏著一個「乘號」，是一個不可分割的整體。"
        };
    } else if (hasVar) {
        const isNegative = cleanStr.includes('-');
        const variable = cleanStr.replace(/[^a-zA-Z]/g, '');
        return {
            title: "💡 Hidden Coefficient 1 / 隱形的係數 1",
            content: "No number in front means the coefficient is 1. / 字母前面沒有數字，代表係數是 1。",
            formula: `${cleanStr} = ${isNegative ? '-1' : '1'} · ${variable}`,
            detail: "Don't forget the invisible 1 during calculations! / 習慣上省略 1，但計算時要記得它們的存在！"
        };
    } else {
        return {
            title: "💡 Constant / 常數項",
            content: "A number on its own. / 只有數字，沒有變數。",
            formula: cleanStr,
            detail: "Its value never changes. / 它的值是固定的，可以直接與其他常數加減。"
        };
    }
  };

  const renderStandardToken = (tok, termIdx, tokIdx) => (
    <span
      key={tok.id}
      onClick={() => (tokIdx !== -1 ? handleTokenClick(termIdx, tokIdx, tok) : null)}
      className={`
        text-2xl md:text-3xl font-mono select-none transition-all px-0.5
        ${tok.canCut && !isCompleted && !quizFinished ? 'cursor-pointer hover:bg-orange-200 hover:text-orange-700 rounded p-1 mx-1' : ''}
        ${tok.isShielded ? 'text-purple-600' : 'text-slate-800'}
        ${shakeTokenId === tok.id ? 'animate-shake text-red-500 scale-110' : ''}
        ${tok.type === 'exp' ? 'text-xl -translate-y-3 font-bold text-blue-600 ml-[-4px]' : ''}
        ${tok.type === 'op' && !tok.canCut ? 'mx-1' : ''}
      `}
    >
      {tok.t}
    </span>
  );

  const renderToken = (tok, termIdx, tokIdx) => {
    if (tok.type === 'fraction') {
      return (
        <div key={tok.id} className="flex flex-col items-center justify-center mx-2 my-1">
          <div className="flex items-center border-b-2 border-slate-400 pb-0.5 px-2 mb-1">
            {tok.numTokens.map((nTok) => renderStandardToken(nTok, termIdx, -1))}
          </div>
          <div className="flex items-center">
            {tok.denTokens.map((dTok) => renderStandardToken(dTok, termIdx, -1))}
          </div>
        </div>
      );
    }
    return renderStandardToken(tok, termIdx, tokIdx);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-4px);} 75% {transform: translateX(4px);} }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .bubble { background: white; border: 2px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .bubble:hover { border-color: #7dd3fc; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .completed-bubble { border-color: #10b981; background: #f0fdf4; }
      `}} />

      {/* --- Top Navigation --- */}
      <nav className="w-full bg-white border-b border-slate-200 shadow-sm mb-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <Wand2 className="text-sky-500 w-6 h-6" /> 
            Algebra Detective <span className="text-sm text-slate-400 hidden sm:inline">| 代數項數偵探</span>
          </h1>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setAppMode('learn')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${appMode === 'learn' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <BrainCircuit className="w-4 h-4" /> Learn / 學習
            </button>
            <button onClick={startQuiz} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${appMode === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <CheckCircle className="w-4 h-4" /> Quiz / 測驗
            </button>
            <button onClick={() => setAppMode('vocab')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${appMode === 'vocab' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <BookOpen className="w-4 h-4" /> Vocab / 詞彙
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-5xl w-full px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        
        {/* ========================================================
            VOCAB MODE (Enhanced with Non-examples)
        ======================================================== */}
        {appMode === 'vocab' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Algebra Vocabulary / 代數詞彙表</h2>
                <p className="text-slate-500 mt-2">Compare the examples and non-examples carefully! / 仔細對比「範例」與「錯誤示範」，掌握真正的概念！</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VOCAB_LIST.map((v, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col h-full hover:border-emerald-300 transition-colors">
                    <h3 className="text-xl font-bold text-emerald-700 mb-1">{v.en}</h3>
                    <h4 className="text-md font-bold text-slate-600 mb-3">{v.zh}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 grow">{v.desc}</p>
                    
                    {/* Examples & Non-Examples Box */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 flex flex-col gap-3">
                      
                      {/* Positive Example */}
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-emerald-600 font-sans font-bold text-xs uppercase tracking-wider block mb-0.5">
                            Example / 正確範例
                          </span>
                          <span className="text-slate-700">{v.eg}</span>
                        </div>
                      </div>

                      {/* Non-Example (Error Trap) */}
                      <div className="flex items-start gap-2 pt-3 border-t border-slate-100">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-rose-500 font-sans font-bold text-xs uppercase tracking-wider block mb-0.5">
                            Non-Example / 反面例子 (陷阱)
                          </span>
                          <span className="text-slate-600">{v.nonEg}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            LEARN OR QUIZ MODE - PLAY AREA
        ======================================================== */}
        {(appMode === 'learn' || appMode === 'quiz') && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Level Control Bar (Learn Mode only) */}
            {appMode === 'learn' && (
              <div className="flex justify-between items-center relative">
                <button 
                  onClick={() => setShowLevelSelect(!showLevelSelect)}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:border-sky-400 transition-all font-bold text-slate-700"
                >
                  Level {LEVELS[currentLevelIdx].id}: {LEVELS[currentLevelIdx].title.split('/')[0]} <ChevronDown className={`w-4 h-4 transition-transform ${showLevelSelect ? 'rotate-180' : ''}`} />
                </button>
                {showLevelSelect && (
                  <div className="absolute top-12 left-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {LEVELS.map((l, idx) => (
                      <button
                        key={l.id} onClick={() => { setCurrentLevelIdx(idx); setShowLevelSelect(false); }}
                        className={`w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors flex items-center justify-between ${currentLevelIdx === idx ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 text-sm'}`}
                      >
                        <span className="truncate pr-4">{l.title}</span>
                        {idx < currentLevelIdx && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quiz Header (Quiz Mode only) */}
            {appMode === 'quiz' && !quizFinished && (
              <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                <div className="font-bold text-indigo-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" /> Quiz Progress: {quizIdx + 1} / {QUIZ_LEVELS.length}
                </div>
                <div className="text-sm font-bold text-orange-600 bg-white px-3 py-1 rounded-full shadow-sm">
                  Errors / 錯誤數: {quizErrors}
                </div>
              </div>
            )}

            {/* Main Canvas */}
            {(!quizFinished || appMode === 'learn') && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                
                <div className="flex items-start gap-4 mb-8">
                  <div className={`p-3 rounded-2xl ${appMode === 'learn' ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Target / 任務目標</h3>
                    <p className="text-slate-500 leading-relaxed text-sm mt-1">
                      {appMode === 'learn' ? LEVELS[currentLevelIdx].desc : "Cut the expression into its basic terms! / 將算式精準切分成獨立的項！"}
                    </p>
                  </div>
                </div>

                <div className="min-h-[240px] bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-wrap justify-center items-center gap-6 p-8 relative overflow-hidden">
                  {terms.map((term, termIdx) => (
                    <div 
                      key={term.id} 
                      className={`bubble p-4 md:p-6 rounded-[2.5rem] flex flex-col items-center gap-3 animate-in zoom-in duration-300 ${isCompleted ? 'completed-bubble' : ''}`}
                    >
                      <div className="flex items-center">
                        {term.tokens.map((tok, tokIdx) => (
                          <div key={tok.id} className="flex items-center">
                            {renderToken(tok, termIdx, tokIdx)}
                          </div>
                        ))}
                      </div>
                      
                      {isCompleted && appMode === 'learn' && (
                        <button 
                          onClick={() => setSelectedBonusTerm(term)}
                          className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1.5 rounded-full hover:bg-sky-200 transition-colors mt-2"
                        >
                          <Layers className="w-3 h-3" /> Analyze / 結構分析
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-slate-100 gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="px-4 py-2 bg-slate-800 text-white rounded-xl font-mono text-sm w-full sm:w-auto text-center">
                      Terms / 偵測項數：{terms.length} / {appMode === 'learn' ? LEVELS[currentLevelIdx].targetCount : QUIZ_LEVELS[quizIdx].targetCount}
                    </div>
                  </div>
                  <button onClick={initLevel} className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium">
                    <RefreshCcw className="w-4 h-4" /> Reset / 重置
                  </button>
                </div>
              </div>
            )}

            {/* Feedback & Actions */}
            {(!quizFinished || appMode === 'learn') && (
              <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 border ${
                feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
                feedback.type === 'error' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <div className="flex items-center gap-3 font-medium text-sm md:text-base text-center sm:text-left">
                  {feedback.type === 'success' ? <CheckCircle className="shrink-0" /> : feedback.type === 'error' ? <AlertCircle className="shrink-0" /> : <Info className="shrink-0" />}
                  {feedback.message}
                </div>
                
                {isCompleted && appMode === 'learn' && currentLevelIdx < LEVELS.length - 1 && (
                  <button onClick={() => setCurrentLevelIdx(c => c + 1)} className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-sky-700 transition-all flex items-center gap-2 shrink-0">
                    Next Level <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {isCompleted && appMode === 'quiz' && (
                  <button 
                    onClick={() => {
                      if (quizIdx < QUIZ_LEVELS.length - 1) setQuizIdx(c => c + 1);
                      else setQuizFinished(true);
                    }} 
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shrink-0"
                  >
                    {quizIdx < QUIZ_LEVELS.length - 1 ? 'Next Question / 下一題' : 'Finish / 完成測驗'} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Quiz Result Screen */}
            {appMode === 'quiz' && quizFinished && (
              <div className="bg-white rounded-3xl shadow-lg border border-indigo-100 p-8 text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Quiz Completed! / 測驗完成！</h2>
                <p className="text-slate-500 mb-8">You sliced through all the expressions. / 你已經成功切開了所有的代數式。</p>
                
                <div className="bg-slate-50 rounded-2xl p-6 inline-block mb-8">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Errors / 總錯誤次數</div>
                  <div className={`text-5xl font-black ${quizErrors === 0 ? 'text-green-500' : 'text-orange-500'}`}>
                    {quizErrors}
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-500">
                    {quizErrors === 0 ? 'Perfect Score! 完美滿分！ 🏆' : 'Keep practicing! 繼續加油！ 💪'}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={startQuiz} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                    Retry / 再測一次
                  </button>
                  <button onClick={() => setAppMode('learn')} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all">
                    Back to Learn / 回到學習
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SIDEBAR (Learn Mode Bonus Explanations / Quiz Tips)
        ======================================================== */}
        {(appMode === 'learn' || appMode === 'quiz') && (
          <div className="space-y-6">
            {appMode === 'learn' && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <Layers className="text-sky-500" /> Deep Analysis / 深度分析
                </h3>
                
                {selectedBonusTerm ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
                      <h4 className="font-bold text-sky-800 mb-3">{getBonusExplanation(selectedBonusTerm).title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {getBonusExplanation(selectedBonusTerm).content}
                      </p>
                      
                      <div className="bg-white p-4 rounded-xl border border-sky-200 text-left font-mono text-base text-sky-900 shadow-sm whitespace-pre-wrap leading-relaxed mx-auto inline-block w-full overflow-x-auto">
                        {getBonusExplanation(selectedBonusTerm).formula}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Details / 細節</h5>
                      <p className="text-slate-600 text-sm leading-relaxed italic">
                        "{getBonusExplanation(selectedBonusTerm).detail}"
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedBonusTerm(null)}
                      className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors"
                    >
                      Close / 關閉分析
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <Scissors className="text-slate-300 w-8 h-8" />
                    </div>
                    <p className="text-slate-400 text-sm px-4">
                      Complete the level, then click "Analyze" on a term to see its inner structure. <br/><br/>
                      完成分項後，點擊項下方的按鈕來查看內部的「運算骨架」。
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className={`rounded-3xl p-6 text-white shadow-lg ${appMode === 'quiz' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200' : 'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-200'}`}>
              <h4 className="font-bold mb-2 flex items-center gap-2">Tips / 小貼士 💡</h4>
              <p className="text-white/90 text-sm leading-relaxed mb-2">
                Terms are like train cars, and the + / - signs are the hooks connecting them. 
              </p>
              <p className="text-white/90 text-sm leading-relaxed">
                代數中的「項」就像是火車的車廂，而加號與減號則是連接車廂的鉤子。學會分辨車廂，是解方程式的第一步！
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}