import React, { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw, CheckCircle, Calculator, Lightbulb, Sparkles, Globe } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    title: "Algebra Sandbox",
    smartHint: "Smart Hint: Next Step?",
    level: "Level:",
    origEq: "Original Equation",
    undo: "Undo",
    reset: "Reset",
    wholeEq: "Whole Eq:",
    valPlaceholder: "Value",
    steps: "Steps taken:",
    verifyTitle: "Verification (Checking Phase)",
    isCorrect: "is correct!",
    similarBtn: "Another similar problem",
    nextBtn: "Next Level",
    toastInvalidNum: "Please enter a valid non-zero number.",
    toastMultiply: "Multiplied both sides by",
    toastDivide: "Divided both sides by",
    toastCannotCombine: "Cannot combine different terms.",
    toastExpanded: "Expanded brackets!",
    toastIsolateVar: "Please isolate the variable term (and clear brackets) before dividing!",
    hintFrac: (lcm) => `Fraction detected! Step 1 (Multiply): Type ${lcm} in the 'Whole Eq' box at the bottom and click '×' to clear fractions.`,
    hintBracket: "Brackets found! Step 2 (Expand): Drag the bouncing multiplier into the parentheses to expand it.",
    hintSimplifyVar: (v) => `Simplify this side! Step 3 (Combine): Drag one '${v}' term onto the other to combine them.`,
    hintSimplifyNum: "Simplify this side! Step 3 (Combine): Drag one number onto the other to add them.",
    hintGroupVar: (v) => `Group variables! Step 4 (Move): Drag the bouncing '${v}' term to the Left side.`,
    hintGroupNum: "Group numbers! Step 4 (Move): Drag the bouncing number term to the Right side.",
    hintIsolate: (v, c) => `Isolate x! Step 5 (Divide): Double-click the bouncing '${v}' term to divide both sides by ${c}.`,
    hintSolved: "It looks solved! Check the verification panel below.",
    hintHeader: "Your Next Step:",
    dragExpand: "Drag me into the bracket to expand!",
    toggleLang: "中文"
  },
  zh: {
    title: "代數沙盒",
    smartHint: "智能提示：下一步？",
    level: "關卡:",
    origEq: "原方程式",
    undo: "還原",
    reset: "重置",
    wholeEq: "整個方程式:",
    valPlaceholder: "數值",
    steps: "已行步數:",
    verifyTitle: "驗證 (檢查階段)",
    isCorrect: "是正確的！",
    similarBtn: "再來一條類似的題目",
    nextBtn: "進入下一關",
    toastInvalidNum: "請輸入一個有效的非零數字。",
    toastMultiply: "已將兩邊乘以",
    toastDivide: "已將兩邊除以",
    toastCannotCombine: "無法合併不同的項目。",
    toastExpanded: "已展開括號！",
    toastIsolateVar: "請先將變數項獨立（並清除括號），然後再除！",
    hintFrac: (lcm) => `發現分數！第1步（乘）：在底部的「整個方程式」框中輸入 ${lcm} 並點擊「×」以清除分數。`,
    hintBracket: "發現括號！第2步（拆）：將跳動的乘數拖入括號中以展開它。",
    hintSimplifyVar: (v) => `簡化這一邊！第3步（合）：將一個「${v}」項拖到另一個上面以合併它們。`,
    hintSimplifyNum: "簡化這一邊！第3步（合）：將一個數字拖到另一個上面以相加。",
    hintGroupVar: (v) => `組合變數！第4步（郁）：將跳動的「${v}」項拖到左邊。`,
    hintGroupNum: "組合數字！第4步（郁）：將跳動的數字項拖到右邊。",
    hintIsolate: (v, c) => `獨立 x！第5步（除）：雙擊跳動的「${v}」項，將兩邊除以 ${c}。`,
    hintSolved: "看起來已經解開了！請查看下方的驗證面板。",
    hintHeader: "你的下一步：",
    dragExpand: "將我拖入括號內展開！",
    toggleLang: "English"
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const getFractionParts = (num) => {
  if (Number.isInteger(num)) return null;
  for (let d = 2; d <= 50; d++) {
    let n = num * d;
    if (Math.abs(n - Math.round(n)) < 0.001) return { n: Math.round(n), d: d };
  }
  return null;
};

const formatDecimal = (num) => Number(num.toFixed(3)).toString();
const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
const lcm = (a, b) => Math.abs((a * b) / gcd(a, b));

const getPoly = (items) => {
  let x = 0, c = 0;
  items.forEach(item => {
    if (item.type === 'term') {
      if (item.varName) x += item.coeff;
      else c += item.coeff;
    } else if (item.type === 'bracket') {
      const inner = getPoly(item.terms);
      x += inner.x * item.multiplier;
      c += inner.c * item.multiplier;
    }
  });
  return { x, c };
};

const evaluateEq = (items, xVal) => {
  const poly = getPoly(items);
  return poly.x * xVal + poly.c;
};

const PRESETS = [
  { name: { en: "Lv 1: Simple Linear", zh: "第 1 關：簡單一次方程" }, left: [{ id: '1', coeff: 3, varName: 'x', type: 'term' }, { id: '2', coeff: 2, varName: null, type: 'term' }], right: [{ id: '3', coeff: 8, varName: null, type: 'term' }] },
  { name: { en: "Lv 2: Vars Both Sides", zh: "第 2 關：雙邊變數" }, left: [{ id: '4', coeff: 5, varName: 'x', type: 'term' }, { id: '5', coeff: -4, varName: null, type: 'term' }], right: [{ id: '6', coeff: 2, varName: 'x', type: 'term' }, { id: '7', coeff: 11, varName: null, type: 'term' }] },
  { name: { en: "Lv 3: Combine Terms", zh: "第 3 關：合併同類項" }, left: [{ id: '8', coeff: 2, varName: 'x', type: 'term' }, { id: '9', coeff: 3, varName: 'x', type: 'term' }, { id: '10', coeff: -5, varName: null, type: 'term' }], right: [{ id: '11', coeff: 15, varName: null, type: 'term' }] },
  { name: { en: "Lv 4: Simple Fraction", zh: "第 4 關：簡單分數" }, left: [{ id: '12', coeff: 1/4, varName: 'x', type: 'term' }, { id: '13', coeff: -3, varName: null, type: 'term' }], right: [{ id: '14', coeff: 2, varName: null, type: 'term' }] },
  { name: { en: "Lv 5: Multi-Fractions", zh: "第 5 關：多重分數" }, left: [{ id: '15', coeff: 1/2, varName: 'x', type: 'term' }, { id: '16', coeff: 1/3, varName: 'x', type: 'term' }], right: [{ id: '17', coeff: 10, varName: null, type: 'term' }] },
  { name: { en: "Lv 6: Decimal Chaos", zh: "第 6 關：小數挑戰" }, left: [{ id: '18', coeff: 1.25, varName: 'x', type: 'term' }, { id: '19', coeff: 2.5, varName: null, type: 'term' }], right: [{ id: '20', coeff: -0.75, varName: 'x', type: 'term' }, { id: '21', coeff: 7.5, varName: null, type: 'term' }] },
  { name: { en: "Lv 7: Expanded Brackets 1", zh: "第 7 關：展開括號 1" }, left: [{ id: 'b1', type: 'bracket', multiplier: 3, terms: [{ id: 'in1', coeff: 1, varName: 'x', type: 'term' }, { id: 'in2', coeff: 2, varName: null, type: 'term' }] }], right: [{ id: '24', coeff: 21, varName: null, type: 'term' }] },
  { name: { en: "Lv 8: Expanded Brackets 2", zh: "第 8 關：展開括號 2" }, left: [{ id: 'b2', type: 'bracket', multiplier: 3, terms: [{ id: 'in3', coeff: 2, varName: 'x', type: 'term' }, { id: 'in4', coeff: -1, varName: null, type: 'term' }] }], right: [{ id: 'b3', type: 'bracket', multiplier: 4, terms: [{ id: 'in5', coeff: 1, varName: 'x', type: 'term' }, { id: 'in6', coeff: 2, varName: null, type: 'term' }] }] },
  { name: { en: "Lv 9: Hard Fractional", zh: "第 9 關：進階分數" }, left: [{ id: 'b9_1', type: 'bracket', multiplier: 1/3, terms: [{ id: 'in29', coeff: 2, varName: 'x', type: 'term' }, { id: 'in30', coeff: -1, varName: null, type: 'term' }] }], right: [{ id: 'b9_2', type: 'bracket', multiplier: 1/2, terms: [{ id: 'in31', coeff: 1, varName: 'x', type: 'term' }, { id: 'in32', coeff: 3, varName: null, type: 'term' }] }] },
  { name: { en: "Lv 10: Multi-Brackets", zh: "第 10 關：多重括號" }, left: [{ id: 'b4', type: 'bracket', multiplier: 2, terms: [{ id: 'in7', coeff: 3, varName: 'x', type: 'term' }, { id: 'in8', coeff: -4, varName: null, type: 'term' }] }, { id: 'b5', type: 'bracket', multiplier: -3, terms: [{ id: 'in9', coeff: 1, varName: 'x', type: 'term' }, { id: 'in10', coeff: 1, varName: null, type: 'term' }] }], right: [{ id: '37', coeff: 10, varName: null, type: 'term' }] },
  { name: { en: "Lv 11: Fraction Addition", zh: "第 11 關：分數相加" }, left: [{ id: 'b11_1', type: 'bracket', multiplier: 1/2, terms: [{ id: 'in38', coeff: 1, varName: 'x', type: 'term' }, { id: 'in39', coeff: 2, varName: null, type: 'term' }] }, { id: 'b11_2', type: 'bracket', multiplier: 1/3, terms: [{ id: 'in40', coeff: 2, varName: 'x', type: 'term' }, { id: 'in41', coeff: -1, varName: null, type: 'term' }] }], right: [{ id: '42', coeff: 4, varName: null, type: 'term' }] },
  { name: { en: "Lv 12: Negative Fraction Trap", zh: "第 12 關：負分數陷阱" }, left: [{ id: 'b12_1', type: 'bracket', multiplier: 1/4, terms: [{ id: 'in43', coeff: 3, varName: 'x', type: 'term' }, { id: 'in44', coeff: -1, varName: null, type: 'term' }] }, { id: 'b12_2', type: 'bracket', multiplier: -1/3, terms: [{ id: 'in45', coeff: 1, varName: 'x', type: 'term' }, { id: 'in46', coeff: -2, varName: null, type: 'term' }] }], right: [{ id: '47', coeff: 2, varName: null, type: 'term' }] },
  { name: { en: "Lv 13: Double Bracket Fractions", zh: "第 13 關：雙括號分數" }, left: [{ id: 'b6', type: 'bracket', multiplier: 3/4, terms: [{ id: 'in11', coeff: 2, varName: 'x', type: 'term' }, { id: 'in12', coeff: -1, varName: null, type: 'term' }] }, { id: 'b7', type: 'bracket', multiplier: -2/3, terms: [{ id: 'in13', coeff: 1, varName: 'x', type: 'term' }, { id: 'in14', coeff: -2, varName: null, type: 'term' }] }], right: [{ id: '48', coeff: 2, varName: null, type: 'term' }] },
  { name: { en: "Lv 14: Variables Everywhere", zh: "第 14 關：變數無處不在" }, left: [{ id: 'b8', type: 'bracket', multiplier: 1/2, terms: [{ id: 'in15', coeff: 1, varName: 'x', type: 'term' }, { id: 'in16', coeff: 1, varName: null, type: 'term' }] }, { id: 'b9', type: 'bracket', multiplier: -1/3, terms: [{ id: 'in17', coeff: 1, varName: 'x', type: 'term' }, { id: 'in18', coeff: -1, varName: null, type: 'term' }] }], right: [{ id: '49', coeff: 1/4, varName: 'x', type: 'term' }, { id: '50', coeff: 1, varName: null, type: 'term' }] },
  { name: { en: "Lv 15: Boss Level Denominators", zh: "第 15 關：魔王級分母" }, left: [{ id: 'b10', type: 'bracket', multiplier: 1/4, terms: [{ id: 'in19', coeff: 3, varName: 'x', type: 'term' }, { id: 'in20', coeff: -5, varName: null, type: 'term' }] }], right: [{ id: 'b11', type: 'bracket', multiplier: 1/6, terms: [{ id: 'in21', coeff: 2, varName: 'x', type: 'term' }, { id: 'in22', coeff: 3, varName: null, type: 'term' }] }, { id: '51', coeff: 1/12, varName: null, type: 'term' }] }
];

const FormatTerm = ({ term, isFirst, substituteX }) => {
  let sign = '';
  if (!isFirst) sign = term.coeff >= 0 ? '+' : '-';
  else if (term.coeff < 0) sign = '-';

  const absCoeff = Math.abs(term.coeff);
  const frac = getFractionParts(absCoeff);
  const isOneVar = term.varName && absCoeff === 1;

  return (
    <React.Fragment>
      {sign && <span className="mx-2 font-bold text-slate-400">{sign}</span>}
      <div className="flex items-center gap-0.5">
        {!isOneVar && frac ? (
          <div className="inline-flex flex-col items-center justify-center text-[0.8em] leading-none mx-0.5 align-middle">
            <span className="border-b-[2.5px] border-current pb-[1px] px-1 font-bold">{frac.n}</span>
            <span className="pt-[1px] px-1 font-bold">{frac.d}</span>
          </div>
        ) : (
          !isOneVar && <span className="font-bold">{formatDecimal(absCoeff)}</span>
        )}
        {term.varName && (
          <span className={`font-bold ${substituteX !== undefined ? 'text-indigo-500' : ''}`}>
            {substituteX !== undefined ? `(${formatDecimal(substituteX)})` : term.varName}
          </span>
        )}
      </div>
    </React.Fragment>
  );
};

const VisualEquation = ({ items, isInner = false, substituteX }) => {
  return (
    <div className="flex items-center text-slate-700">
      {items.map((item, i) => {
        const isFirst = i === 0;
        if (item.type === 'term') {
          return <FormatTerm key={item.id} term={item} isFirst={isFirst && !isInner} substituteX={substituteX} />;
        }
        if (item.type === 'bracket') {
          let sign = '';
          if (!(isFirst && !isInner)) sign = item.multiplier >= 0 ? '+' : '-';
          else if (item.multiplier < 0) sign = '-';

          const absMult = Math.abs(item.multiplier);
          const frac = getFractionParts(absMult);

          if (frac) {
            return (
              <React.Fragment key={item.id}>
                {sign && <span className="mx-2 font-bold text-slate-400">{sign}</span>}
                <div className="inline-flex flex-col items-center justify-center mx-1 align-middle text-[0.9em]">
                  <div className="border-b-[2.5px] border-slate-700 pb-1 px-3 flex items-center">
                    {frac.n !== 1 && <span className="font-bold mr-0.5">{frac.n}</span>}
                    {(frac.n !== 1) && item.terms.length > 1 && <span className="font-light text-slate-400 mr-0.5">(</span>}
                    <VisualEquation items={item.terms} isInner={true} substituteX={substituteX} />
                    {(frac.n !== 1) && item.terms.length > 1 && <span className="font-light text-slate-400 ml-0.5">)</span>}
                  </div>
                  <div className="pt-1 px-3 font-bold">{frac.d}</div>
                </div>
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={item.id}>
                {sign && <span className="mx-2 font-bold text-slate-400">{sign}</span>}
                <span className="font-bold">{absMult !== 1 ? absMult : ''}</span>
                <span className="font-light text-slate-400 mx-0.5">(</span>
                <VisualEquation items={item.terms} isInner={true} substituteX={substituteX} />
                <span className="font-light text-slate-400 mx-0.5">)</span>
              </React.Fragment>
            );
          }
        }
        return null;
      })}
    </div>
  );
};

const VerificationPanel = ({ initialLeft, initialRight, solvedX, loc }) => {
  const lVal = evaluateEq(initialLeft, solvedX);
  const rVal = evaluateEq(initialRight, solvedX);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-lg w-full flex flex-col gap-4 font-mono text-lg relative z-30">
      <h3 className="font-bold text-slate-700 uppercase tracking-wider text-sm border-b-2 border-slate-100 pb-3 flex items-center gap-2">
        <CheckCircle size={18} className="text-green-500" />
        {loc.verifyTitle}
      </h3>
      <div className="flex flex-col gap-5 pl-4 border-l-4 border-indigo-300 py-2">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
          <span className="font-bold text-slate-500 w-16 shrink-0">L.H.S.</span>
          <span className="text-slate-400 shrink-0">=</span>
          <div className="shrink-0"><VisualEquation items={initialLeft} substituteX={solvedX} /></div>
          <span className="text-slate-400 shrink-0">=</span>
          <span className="font-bold text-indigo-600 shrink-0">{formatDecimal(lVal)}</span>
        </div>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
          <span className="font-bold text-slate-500 w-16 shrink-0">R.H.S.</span>
          <span className="text-slate-400 shrink-0">=</span>
          <div className="shrink-0"><VisualEquation items={initialRight} substituteX={solvedX} /></div>
          <span className="text-slate-400 shrink-0">=</span>
          <span className="font-bold text-indigo-600 shrink-0">{formatDecimal(rVal)}</span>
        </div>
      </div>
      <div className="mt-3 text-green-700 font-bold bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-center gap-3 text-xl">
        <Sparkles size={26} className="text-green-500" />
        L.H.S. = R.H.S. &nbsp; <span className="text-slate-300 font-light">|</span> &nbsp; x = {formatDecimal(solvedX)} {loc.isCorrect}
      </div>
    </div>
  );
};

const BracketBlock = ({ bracket, index, side, draggedItem, handleDragStart, handleDropOnBracketBody, activeHint, loc }) => {
  const isFirst = index === 0;
  let prefix = '';
  if (!isFirst) prefix = bracket.multiplier >= 0 ? '+' : '-';
  else if (bracket.multiplier < 0) prefix = '-';

  const absMult = Math.abs(bracket.multiplier);
  const multFrac = getFractionParts(absMult);

  const isBeingDragged = draggedItem?.id === bracket.id;
  const isDropTarget = draggedItem?.type === 'multiplier' && draggedItem?.item.id === bracket.id;
  const isHighlighted = activeHint?.highlightId === bracket.id;

  return (
    <div className={`flex items-center mx-1.5 my-1 group transition-all ${isHighlighted ? 'scale-110 z-20' : ''}`}>
      {prefix && <span className={`text-2xl font-bold mr-2 ${isFirst ? '' : 'opacity-70'}`}>{prefix}</span>}
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, bracket, side, 'multiplier')}
        className={`flex items-center justify-center cursor-grab active:cursor-grabbing px-3 py-2 rounded-l-xl border-2 border-r-0 font-bold text-2xl z-10 transition-all shadow-sm
          ${isBeingDragged ? 'opacity-40 scale-95 bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-100 text-purple-800 border-purple-300 hover:-translate-y-1 hover:shadow-md'}
          ${isHighlighted ? 'ring-4 ring-pink-500 animate-pulse bg-pink-100 text-pink-800 border-pink-400' : ''}`}
        title={loc.dragExpand}
      >
        {multFrac ? (
          <div className="inline-flex flex-col items-center justify-center text-[0.85em] leading-none mx-0.5">
            <span className="border-b-[3px] border-current pb-[2px] px-1.5">{multFrac.n}</span>
            <span className="pt-[2px] px-1.5">{multFrac.d}</span>
          </div>
        ) : absMult}
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropOnBracketBody(e, bracket, side)}
        className={`flex items-center text-2xl bg-white rounded-r-xl border-2 border-l-0 border-slate-300 px-3 py-2 -ml-1 pl-4 transition-all
          ${isDropTarget ? 'border-purple-500 bg-purple-50 shadow-inner ring-4 ring-purple-200 z-0' : 'shadow-sm'}`}
      >
        <span className="text-slate-400 font-light mr-1">(</span>
        <VisualEquation items={bracket.terms} isInner={true} />
        <span className="text-slate-400 font-light ml-2">)</span>
      </div>
    </div>
  );
};

const TermBlock = ({ term, index, side, isDragged, draggedItem, handleDragStart, handleDropOnTerm, activeHint }) => {
  const isFirst = index === 0;
  let prefix = '';
  if (!isFirst) prefix = term.coeff >= 0 ? '+' : '-';
  else if (term.coeff < 0) prefix = '-';

  const absCoeff = Math.abs(term.coeff);
  const fractionParts = getFractionParts(absCoeff);
  const isOneVar = term.varName && absCoeff === 1;
  const isHighlighted = activeHint?.highlightId === term.id;

  let isCompatibleTarget = false;
  if (draggedItem && draggedItem.type === 'term' && draggedItem.item.id !== term.id) {
    isCompatibleTarget = draggedItem.item.varName === term.varName;
  }

  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedItem && draggedItem.type === 'term') handleDropOnTerm(draggedItem, { item: term, side });
  };

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, term, side, 'term')}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`flex items-center justify-center px-4 py-3 mx-1 my-1 rounded-xl shadow-sm text-2xl font-semibold font-mono cursor-grab active:cursor-grabbing transition-all duration-200
        ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'}
        ${term.varName ? 'bg-blue-100 text-blue-800 border-b-4 border-blue-300' : 'bg-green-100 text-green-800 border-b-4 border-green-300'}
        ${isCompatibleTarget ? 'ring-4 ring-yellow-400 scale-105' : ''}
        ${term.coeff === 0 && !term.varName ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}
        ${isHighlighted ? 'ring-4 ring-pink-500 animate-pulse scale-110 shadow-lg z-20' : 'hover:-translate-y-1 hover:shadow-md z-10'}`}
    >
      <div className="flex items-center gap-2">
        {prefix && <span className={isFirst ? "" : "opacity-70"}>{prefix}</span>}
        <div className="flex items-center gap-0.5">
          {!isOneVar && fractionParts ? (
            <div className="inline-flex flex-col items-center justify-center text-[0.85em] leading-none mx-0.5">
              <span className="border-b-[3px] border-current pb-[2px] px-1 font-bold">{fractionParts.n}</span>
              <span className="pt-[2px] px-1 font-bold">{fractionParts.d}</span>
            </div>
          ) : (!isOneVar && <span>{formatDecimal(absCoeff)}</span>)}
          {term.varName && <span className="text-[1.1em]">{term.varName}</span>}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState('zh');
  const loc = TRANSLATIONS[lang];
  
  const [currentPreset, setCurrentPreset] = useState(0);
  const [initialEquation, setInitialEquation] = useState(JSON.parse(JSON.stringify(PRESETS[0])));
  const [equation, setEquation] = useState(JSON.parse(JSON.stringify(PRESETS[0])));
  const [history, setHistory] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [globalOpVal, setGlobalOpVal] = useState('');
  const [activeHint, setActiveHint] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadPreset = (index) => {
    setCurrentPreset(index);
    const newEq = JSON.parse(JSON.stringify(PRESETS[index]));
    setEquation(newEq);
    setInitialEquation(newEq);
    setHistory([]);
    setActiveHint(null);
    setGlobalOpVal('');
  };

  const saveHistory = (oldEq) => {
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(oldEq))]);
    setActiveHint(null);
  };

  const undo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      setEquation(newHistory.pop());
      setHistory(newHistory);
      setActiveHint(null);
    }
  };

  const cleanEquation = (eq) => {
    let newEq = { ...eq };
    ['left', 'right'].forEach(side => {
      newEq[side] = newEq[side].filter(t => t.type === 'bracket' || t.coeff !== 0);
      if (newEq[side].length === 0) newEq[side] = [{ id: generateId(), coeff: 0, varName: null, type: 'term' }];
    });
    return newEq;
  };

  const generateSimilar = (presetIndex) => {
    const preset = PRESETS[presetIndex];
    let attempts = 0;

    const tweak = (val) => {
      if (val === 0) return 0;
      const isFraction = !Number.isInteger(val);
      let delta = Math.floor(Math.random() * 3) - 1;
      if (delta === 0) delta = Math.random() > 0.5 ? 1 : -1;

      if (isFraction) {
        const parts = getFractionParts(Math.abs(val));
        const d = parts ? parts.d : 2;
        const newVal = val + (delta / d);
        return newVal === 0 ? val - (delta / d) : newVal;
      } else {
        const newVal = val + delta;
        return newVal === 0 ? val - delta : newVal;
      }
    };

    const mutateItems = (items) => {
      return items.map(item => {
        if (item.type === 'term') return { ...item, coeff: tweak(item.coeff) };
        else if (item.type === 'bracket') return { ...item, multiplier: tweak(item.multiplier), terms: mutateItems(item.terms) };
        return item;
      });
    };

    const assignNewIds = (items) => {
      return items.map(item => {
        const newItem = { ...item, id: generateId() };
        if (newItem.type === 'bracket') newItem.terms = assignNewIds(newItem.terms);
        return newItem;
      });
    };

    while (attempts < 100) {
      attempts++;
      const newLeft = mutateItems(preset.left);
      const newRight = mutateItems(preset.right);

      const lPoly = getPoly(newLeft);
      const rPoly = getPoly(newRight);
      const xCoeff = lPoly.x - rPoly.x;
      const constVal = rPoly.c - lPoly.c;

      if (Math.abs(xCoeff) > 0.001) {
        const ans = constVal / xCoeff;
        if (Number.isInteger(ans) || getFractionParts(Math.abs(ans))) {
          const freshEq = { left: assignNewIds(newLeft), right: assignNewIds(newRight) };
          setEquation(freshEq);
          setInitialEquation(freshEq);
          setHistory([]);
          setActiveHint(null);
          setGlobalOpVal('');
          return;
        }
      }
    }
    loadPreset(presetIndex);
  };

  const requestSmartHint = () => {
    let denoms = [];
    ['left', 'right'].forEach(side => {
      equation[side].forEach(item => {
        if (item.type === 'term') {
          const parts = getFractionParts(Math.abs(item.coeff));
          if (parts) denoms.push(parts.d);
        } else if (item.type === 'bracket') {
          const parts = getFractionParts(Math.abs(item.multiplier));
          if (parts) denoms.push(parts.d);
          item.terms.forEach(t => { const tParts = getFractionParts(Math.abs(t.coeff)); if (tParts) denoms.push(tParts.d); });
        }
      });
    });

    if (denoms.length > 0) {
      const commonLcm = denoms.reduce((acc, val) => lcm(acc, val), 1);
      setActiveHint({ id: 'hintFrac', param1: commonLcm, highlightId: 'whole-eq-tool' });
      return;
    }

    for (let side of ['left', 'right']) {
      for (let item of equation[side]) {
        if (item.type === 'bracket') {
          setActiveHint({ id: 'hintBracket', highlightId: item.id });
          return;
        }
      }
    }

    for (let side of ['left', 'right']) {
      const vars = equation[side].filter(t => t.type === 'term' && t.varName);
      if (vars.length > 1) { setActiveHint({ id: 'hintSimplifyVar', param1: vars[0].varName, highlightId: vars[0].id }); return; }
      const consts = equation[side].filter(t => t.type === 'term' && !t.varName);
      if (consts.length > 1) { setActiveHint({ id: 'hintSimplifyNum', highlightId: consts[0].id }); return; }
    }

    const varsOnRight = equation.right.filter(t => t.type === 'term' && t.varName);
    if (varsOnRight.length > 0) { setActiveHint({ id: 'hintGroupVar', param1: varsOnRight[0].varName, highlightId: varsOnRight[0].id }); return; }

    const constsOnLeft = equation.left.filter(t => t.type === 'term' && !t.varName);
    if (constsOnLeft.length > 0 && !(equation.left.length === 1 && constsOnLeft[0].coeff === 0)) {
      setActiveHint({ id: 'hintGroupNum', highlightId: constsOnLeft[0].id }); return;
    }

    const varsOnLeft = equation.left.filter(t => t.type === 'term' && t.varName);
    const constsOnRight = equation.right.filter(t => t.type === 'term' && !t.varName);

    if (varsOnLeft.length === 1 && constsOnRight.length === 1 && equation.left.length === 1 && equation.right.length === 1) {
      if (varsOnLeft[0].coeff !== 1) { setActiveHint({ id: 'hintIsolate', param1: varsOnLeft[0].varName, param2: varsOnLeft[0].coeff, highlightId: varsOnLeft[0].id }); return; }
    }
    setActiveHint({ id: 'hintSolved', highlightId: null });
  };

  const renderHintText = () => {
    if (!activeHint) return null;
    const textOrFn = loc[activeHint.id];
    if (typeof textOrFn === 'function') return textOrFn(activeHint.param1, activeHint.param2);
    return textOrFn || "";
  };

  const applyGlobalOperation = (op) => {
    const val = parseFloat(globalOpVal);
    if (isNaN(val) || val === 0) { showToast(loc.toastInvalidNum); return; }
    saveHistory(equation);
    let newEq = JSON.parse(JSON.stringify(equation));
    ['left', 'right'].forEach(s => {
      newEq[s] = newEq[s].map(item => {
        if (item.type === 'term') return { ...item, coeff: op === 'multiply' ? item.coeff * val : item.coeff / val };
        else if (item.type === 'bracket') return { ...item, multiplier: op === 'multiply' ? item.multiplier * val : item.multiplier / val };
        return item;
      });
    });
    setEquation(cleanEquation(newEq));
    showToast(`${op === 'multiply' ? loc.toastMultiply : loc.toastDivide} ${val}`);
    setGlobalOpVal('');
  };

  const handleDragStart = (e, item, side, type) => {
    setDraggedItem({ id: item.id, item, side, type });
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => setDraggedItem(null);

  const handleDropOnSide = (targetSide) => {
    if (!draggedItem || draggedItem.type !== 'term') return;
    const { item: sourceTerm, side: sourceSide } = draggedItem;

    if (sourceSide !== targetSide) {
      saveHistory(equation);
      let newEq = JSON.parse(JSON.stringify(equation));
      newEq[sourceSide] = newEq[sourceSide].filter(t => t.id !== sourceTerm.id);
      newEq[targetSide].push({ ...sourceTerm, coeff: sourceTerm.coeff * -1 });
      setEquation(cleanEquation(newEq));
    }
    setDraggedItem(null);
  };

  const handleDropOnTerm = (sourceData, targetData) => {
    const { item: sourceTerm, side: sourceSide } = sourceData;
    const { item: targetTerm, side: targetSide } = targetData;

    if (sourceTerm.varName !== targetTerm.varName) { showToast(loc.toastCannotCombine); setDraggedItem(null); return; }

    saveHistory(equation);
    let newEq = JSON.parse(JSON.stringify(equation));
    let finalCoeffToAdd = sourceTerm.coeff * (sourceSide !== targetSide ? -1 : 1);
    const targetIndex = newEq[targetSide].findIndex(t => t.id === targetTerm.id);
    newEq[targetSide][targetIndex].coeff += finalCoeffToAdd;
    newEq[sourceSide] = newEq[sourceSide].filter(t => t.id !== sourceTerm.id);

    setEquation(cleanEquation(newEq));
    setDraggedItem(null);
  };

  const handleDropOnBracketBody = (e, bracket, side) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedItem?.type === 'multiplier' && draggedItem?.item.id === bracket.id) {
      saveHistory(equation);
      let newEq = JSON.parse(JSON.stringify(equation));
      const sideEq = newEq[side];
      const index = sideEq.findIndex(item => item.id === bracket.id);
      const expandedTerms = bracket.terms.map(t => ({ ...t, id: generateId(), coeff: t.coeff * bracket.multiplier, type: 'term' }));
      sideEq.splice(index, 1, ...expandedTerms);
      setEquation(cleanEquation(newEq));
      showToast(loc.toastExpanded);
      setDraggedItem(null);
    }
  };

  const handleDoubleClick = (term, side) => {
    if (term.varName && Math.abs(term.coeff) !== 1 && equation[side].length === 1 && !equation.left.some(t => t.type === 'bracket') && !equation.right.some(t => t.type === 'bracket')) {
      const divisor = term.coeff;
      saveHistory(equation);
      let newEq = JSON.parse(JSON.stringify(equation));
      ['left', 'right'].forEach(s => { newEq[s] = newEq[s].map(t => ({ ...t, coeff: t.coeff / divisor })); });
      setEquation(cleanEquation(newEq));
      showToast(`${loc.toastDivide} ${divisor}`);
    } else if (term.varName && Math.abs(term.coeff) !== 1) {
      showToast(loc.toastIsolateVar);
    }
  };

  const getSolvedX = () => {
    if (equation.left.length === 1 && equation.left[0].varName && equation.left[0].coeff === 1 && equation.right.length === 1 && !equation.right[0].varName) return equation.right[0].coeff;
    if (equation.right.length === 1 && equation.right[0].varName && equation.right[0].coeff === 1 && equation.left.length === 1 && !equation.left[0].varName) return equation.left[0].coeff;
    return null;
  };

  const solvedX = getSolvedX();

  useEffect(() => {
    const handleDragOverGlobal = (e) => e.preventDefault();
    document.addEventListener('dragover', handleDragOverGlobal);
    return () => document.removeEventListener('dragover', handleDragOverGlobal);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col" onDragEnd={handleDragEnd}>
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-4 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md"><Calculator size={24} /></div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{loc.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={requestSmartHint} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-bold transition-all shadow-md transform hover:scale-105">
            <Sparkles size={18} className="animate-pulse" /> {loc.smartHint}
          </button>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-sm font-bold text-slate-500 uppercase">{loc.level}</label>
            <select value={currentPreset} onChange={(e) => loadPreset(Number(e.target.value))} className="bg-transparent text-slate-800 font-bold text-sm outline-none cursor-pointer min-w-[180px]">
              {PRESETS.map((preset, idx) => <option key={idx} value={idx}>{preset.name[lang]}</option>)}
            </select>
          </div>
          <button 
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl font-bold transition-all shadow-sm border border-indigo-200"
          >
            <Globe size={18} /> {loc.toggleLang}
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start p-8 relative overflow-hidden">
        {toast && <div className="absolute top-8 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl font-medium animate-bounce z-50 transition-opacity">{toast}</div>}

        <div className="max-w-6xl w-full flex-grow bg-white rounded-3xl shadow-xl border border-slate-200 flex flex-col relative z-10">
          <div className="flex-grow flex flex-col items-center justify-start p-8 min-h-[400px] bg-slate-50 relative overflow-y-auto pt-16">
            {activeHint && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl animate-in slide-in-from-top-4 fade-in">
                <div className="bg-pink-100 border-2 border-pink-400 p-4 rounded-2xl shadow-xl flex items-start gap-4">
                  <div className="bg-pink-500 text-white p-2 rounded-full mt-1 shrink-0"><Lightbulb size={24} /></div>
                  <div><h4 className="font-bold text-pink-900 text-lg mb-1">{loc.hintHeader}</h4><p className="text-pink-800 text-md font-medium leading-relaxed">{renderHintText()}</p></div>
                </div>
              </div>
            )}

            <div className="absolute top-6 right-6 flex flex-col items-end gap-1 z-10 hidden sm:flex">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-sm">{loc.origEq}</span>
              <div className="bg-white text-slate-700 font-mono text-xl px-5 py-4 rounded-2xl border border-slate-200 shadow-sm tracking-tight flex items-center gap-3">
                <VisualEquation items={initialEquation.left} />
                <span className="font-bold text-slate-400 mx-2">=</span>
                <VisualEquation items={initialEquation.right} />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full mt-24 mb-16">
              {history.length > 0 && (
                <div className="w-full max-w-4xl flex flex-col gap-8 mb-12 pb-8 border-b border-slate-200">
                  {history.map((stepEq, i) => (
                    <div key={i} className="flex justify-center items-center gap-6 text-xl font-mono text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
                      <div className="flex justify-end flex-1"><VisualEquation items={stepEq.left} /></div>
                      <div className="text-slate-300 select-none px-4 shrink-0 font-bold">=</div>
                      <div className="flex justify-start flex-1"><VisualEquation items={stepEq.right} /></div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-4xl font-bold relative z-0 w-full max-w-4xl">
                <div className={`flex items-center min-h-[120px] min-w-[200px] p-4 rounded-3xl border-4 border-dashed transition-colors duration-200 flex-wrap justify-end flex-1 ${draggedItem && draggedItem.type === 'term' && draggedItem.side !== 'left' ? 'border-blue-300 bg-blue-50/50' : 'border-transparent bg-white shadow-inner'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnSide('left')}>
                  {equation.left.map((item, index) => (
                    item.type === 'term' ? (
                      <div key={item.id} onDoubleClick={() => handleDoubleClick(item, 'left')}><TermBlock term={item} index={index} side="left" isDragged={draggedItem?.id === item.id} draggedItem={draggedItem} handleDragStart={handleDragStart} handleDropOnTerm={handleDropOnTerm} activeHint={activeHint} /></div>
                    ) : (
                      <BracketBlock key={item.id} bracket={item} index={index} side="left" draggedItem={draggedItem} handleDragStart={handleDragStart} handleDropOnBracketBody={handleDropOnBracketBody} activeHint={activeHint} loc={loc} />
                    )
                  ))}
                </div>
                <div className="text-slate-300 pb-2 px-6 select-none shrink-0 font-mono text-5xl">=</div>
                <div className={`flex items-center min-h-[120px] min-w-[200px] p-4 rounded-3xl border-4 border-dashed transition-colors duration-200 flex-wrap justify-start flex-1 ${draggedItem && draggedItem.type === 'term' && draggedItem.side !== 'right' ? 'border-blue-300 bg-blue-50/50' : 'border-transparent bg-white shadow-inner'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropOnSide('right')}>
                  {equation.right.map((item, index) => (
                    item.type === 'term' ? (
                      <div key={item.id} onDoubleClick={() => handleDoubleClick(item, 'right')}><TermBlock term={item} index={index} side="right" isDragged={draggedItem?.id === item.id} draggedItem={draggedItem} handleDragStart={handleDragStart} handleDropOnTerm={handleDropOnTerm} activeHint={activeHint} /></div>
                    ) : (
                      <BracketBlock key={item.id} bracket={item} index={index} side="right" draggedItem={draggedItem} handleDragStart={handleDragStart} handleDropOnBracketBody={handleDropOnBracketBody} activeHint={activeHint} loc={loc} />
                    )
                  ))}
                </div>
              </div>
            </div>

            {solvedX !== null && (
              <div className="mt-16 w-full max-w-4xl flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in z-20 relative">
                <VerificationPanel initialLeft={initialEquation.left} initialRight={initialEquation.right} solvedX={solvedX} loc={loc} />
                <div className="flex flex-wrap items-center gap-4 justify-center mt-2 pb-8">
                  <button
                    className="px-6 py-4 rounded-2xl bg-blue-100 text-blue-800 font-bold hover:bg-blue-200 transition-all shadow-sm hover:shadow-md flex items-center gap-3 text-lg border-2 border-transparent hover:border-blue-300"
                    onClick={() => generateSimilar(currentPreset)}
                  >
                    <RefreshCw size={24} />
                    {loc.similarBtn}
                  </button>
                  <button
                    className="px-8 py-4 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-md hover:shadow-xl flex items-center gap-3 text-xl transform hover:scale-105 border-2 border-transparent hover:border-green-400"
                    onClick={() => loadPreset((currentPreset + 1) % PRESETS.length)}
                  >
                    <CheckCircle size={28} />
                    {loc.nextBtn}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-100 border-t border-slate-200 p-5 flex items-center justify-between flex-wrap gap-4 rounded-b-3xl relative z-20">
            <div className="flex gap-3">
              <button title={loc.undo} onClick={undo} disabled={history.length === 0} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${history.length > 0 ? 'bg-white text-slate-700 shadow hover:shadow-md hover:bg-slate-50' : 'bg-transparent text-slate-400 cursor-not-allowed border border-slate-200'}`}><RotateCcw size={20} />{loc.undo}</button>
              <button title={loc.reset} onClick={() => loadPreset(currentPreset)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-white text-slate-700 shadow hover:shadow-md hover:bg-slate-50 transition-all"><RefreshCw size={20} />{loc.reset}</button>
            </div>
            <div className={`flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm transition-all duration-300 ${activeHint?.highlightId === 'whole-eq-tool' ? 'ring-4 ring-pink-500 shadow-pink-200 shadow-lg scale-105' : 'focus-within:ring-2 focus-within:ring-purple-200'}`}>
              <span className="text-sm font-bold text-purple-700 uppercase tracking-wide ml-3 whitespace-nowrap">{loc.wholeEq}</span>
              <input type="number" value={globalOpVal} onChange={(e) => setGlobalOpVal(e.target.value)} placeholder={loc.valPlaceholder} className="w-20 px-3 py-2 text-lg font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-400 transition-all" />
              <button onClick={() => applyGlobalOperation('multiply')} className="px-4 py-2 text-lg bg-purple-100 hover:bg-purple-200 transition-colors rounded-xl font-bold text-purple-800 shadow-sm">×</button>
              <button onClick={() => applyGlobalOperation('divide')} className="px-4 py-2 text-lg bg-purple-100 hover:bg-purple-200 transition-colors rounded-xl font-bold text-purple-800 shadow-sm">÷</button>
            </div>
            <div className="text-sm text-slate-500 font-bold bg-slate-200/50 px-4 py-2 rounded-full hidden lg:block">{loc.steps} {history.length}</div>
          </div>
        </div>
      </main>
    </div>
  );
}