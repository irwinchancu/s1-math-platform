import React, { useState, useEffect } from 'react';
import { Users, Droplet, Plus, Minus, Info, RefreshCw, AlertTriangle, Calculator } from 'lucide-react';

const App = () => {
  const [ratioA, setRatioA] = useState(2);
  const [ratioB, setRatioB] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [mode, setMode] = useState('discrete'); // 'discrete' (people) or 'continuous' (liquid)
  const [showAddTest, setShowAddTest] = useState(false);
  const [addVal, setAddVal] = useState(2);

  const realA = (ratioA * multiplier);
  const realB = (ratioB * multiplier);
  const totalReal = (realA + realB);

  // For Additive thinking test
  const newA = realA + addVal;
  const newB = realB + addVal;
  const newRatioSimple = (newA / newB).toFixed(2);
  const originalRatioSimple = (ratioA / ratioB).toFixed(2);

  const handleRandomMultiplier = () => {
    const vals = [0.5, 1.2, 2.5, 3.8, 10.5];
    setMultiplier(vals[Math.floor(Math.random() * vals.length)]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header with Tooltip */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white relative">
          <h1 className="text-3xl font-black mb-1 text-center tracking-tight">
            Ratio Decoder 比例大解密
          </h1>
          <p className="text-blue-100 text-center text-sm opacity-90">
            Ratio is a relationship, not a fixed number. <br/>
            比例是「關係」，不是「死數」。
          </p>
          <div className="absolute top-4 right-4 group">
            <Info className="cursor-help opacity-70 hover:opacity-100" />
            <div className="absolute right-0 w-72 p-3 bg-white text-slate-800 text-xs rounded-xl shadow-xl hidden group-hover:block z-50 border border-slate-200 mt-2">
              <p className="font-bold mb-1 text-blue-600">💡 Teaching Tips 教學提示：</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Multiplier shows "one part" can be decimals. <br/>調整倍數顯示「一份」不一定是整數。</li>
                <li>Continuous mode explains volume/weight. <br/>切換「連續模式」解釋重量/體積。</li>
                <li>Add test proves +1 ≠ same ratio. <br/>使用「加法測試」證明各加 1 不等於比例不變。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-50 p-2 gap-2">
          <button 
            onClick={() => setMode('discrete')}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl font-bold transition-all ${mode === 'discrete' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-2"><Users size={18} /> Discrete Mode</div>
            <div className="text-[10px]">離散模式 (數人數)</div>
          </button>
          <button 
            onClick={() => setMode('continuous')}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl font-bold transition-all ${mode === 'continuous' ? 'bg-white shadow-md text-cyan-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-2"><Droplet size={18} /> Continuous Mode</div>
            <div className="text-[10px]">連續模式 (量液體)</div>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-base flex flex-col text-indigo-700">
                <span className="flex items-center gap-2"><Calculator size={18} /> 1. Set Ratio</span>
                <span className="text-xs ml-7">設定比例</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex flex-col">
                    <span className="font-bold text-blue-600 text-sm">Part A:</span>
                    <span className="text-[10px] text-slate-400">A 項</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setRatioA(Math.max(1, ratioA - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-blue-100"><Minus size={14}/></button>
                    <span className="text-xl font-black w-4 text-center">{ratioA}</span>
                    <button onClick={() => setRatioA(Math.min(12, ratioA + 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-blue-100"><Plus size={14}/></button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                  <div className="flex flex-col">
                    <span className="font-bold text-pink-500 text-sm">Part B:</span>
                    <span className="text-[10px] text-slate-400">B 項</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setRatioB(Math.max(1, ratioB - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-pink-100"><Minus size={14}/></button>
                    <span className="text-xl font-black w-4 text-center">{ratioB}</span>
                    <button onClick={() => setRatioB(Math.min(12, ratioB + 1))} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-pink-100"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
              <div className="text-center py-2 bg-indigo-600 text-white rounded-lg font-black text-xl shadow-inner">
                {ratioA} : {ratioB}
              </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-amber-800 flex flex-col">
                  <span className="flex items-center gap-2">✨ 2. Multiplier (k)</span>
                  <span className="text-xs ml-7">每一份的值</span>
                </h3>
                <button onClick={handleRandomMultiplier} className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded-md flex items-center gap-1">
                  <RefreshCw size={10} /> Random 小數
                </button>
              </div>
              <input 
                type="range" min="0.5" max="20" step="0.5" 
                value={multiplier} 
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="text-center">
                <p className="text-4xl font-black text-amber-600">× {multiplier}</p>
                <p className="text-[10px] text-amber-700 font-medium mt-1">Constant of Ratio / 比例常數</p>
              </div>
            </div>

            {/* Misconception Tool: Additive Thinking Test */}
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 space-y-3">
              <button 
                onClick={() => setShowAddTest(!showAddTest)}
                className="w-full flex flex-col items-center justify-center py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition shadow-md"
              >
                <div className="flex items-center gap-2 text-sm"><AlertTriangle size={16} /> Challenge: Add same value?</div>
                <div className="text-[10px] opacity-90">挑戰誤解：各加一個數？</div>
              </button>
              {showAddTest && (
                <div className="text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-red-800 font-medium">If we <span className="font-bold underline">add {addVal}</span> to both sides, is the ratio still {ratioA}:{ratioB}?</p>
                  <p className="text-[10px] text-red-700 italic">如果兩邊同時加 {addVal}，比例仲係唔係一樣？</p>
                  <div className="flex items-center gap-2">
                    <input type="range" min="1" max="20" value={addVal} onChange={(e) => setAddVal(parseInt(e.target.value))} className="flex-1 h-1 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
                    <span className="font-bold">{addVal}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-red-200 space-y-1">
                    <p className="font-medium text-slate-500">Original Ratio 原本比例: {originalRatioSimple}</p>
                    <p className="font-bold text-red-600">New Ratio 新比例: {newRatioSimple}</p>
                    <div className="pt-1 border-t border-red-100 mt-1">
                      <p className="text-[10px] font-bold text-red-500 uppercase">Conclusion 結論:</p>
                      <p className="text-[10px] text-red-500">Addition changes the ratio! Only multiplication keeps it constant. <br/>加法會破壞比例！只有乘法能保持不變。</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 min-h-[400px] flex flex-col">
              <h3 className="font-bold text-slate-400 text-[10px] mb-6 uppercase tracking-widest text-center">
                Dynamic Visualization 可視化模型
              </h3>
              
              <div className="flex-1 space-y-10">
                {/* Item A Row */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-blue-600 uppercase">Part A ({mode === 'discrete' ? 'Boys 男生' : 'Concentrate 濃縮汁'})</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{ratioA} Parts 份</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(ratioA)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`transition-all duration-500 flex flex-col items-center justify-center font-black text-white shadow-lg
                          ${mode === 'discrete' ? 'w-14 h-14 bg-blue-500 rounded-xl' : 'w-10 h-20 bg-cyan-400 rounded-b-2xl rounded-t-sm border-t-4 border-cyan-500'}`}
                      >
                        <span className={mode === 'discrete' ? 'text-sm' : 'text-xs'}>{multiplier}</span>
                        <span className="text-[8px] opacity-60">unit</span>
                      </div>
                    ))}
                    {showAddTest && (
                      <div className="w-14 h-14 border-2 border-dashed border-red-400 rounded-xl flex flex-col items-center justify-center text-red-500 text-[10px] font-bold animate-pulse bg-red-50">
                        <span>Add 加</span>
                        <span>{addVal}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item B Row */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-pink-500 uppercase">Part B ({mode === 'discrete' ? 'Girls 女生' : 'Water 水'})</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{ratioB} Parts 份</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(ratioB)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`transition-all duration-500 flex flex-col items-center justify-center font-black text-white shadow-lg
                          ${mode === 'discrete' ? 'w-14 h-14 bg-pink-400 rounded-xl' : 'w-10 h-24 bg-blue-200 rounded-b-2xl rounded-t-sm border-t-4 border-blue-300'}`}
                      >
                        <span className={mode === 'discrete' ? 'text-sm' : 'text-xs text-blue-600'}>{multiplier}</span>
                        <span className={`text-[8px] opacity-60 ${mode === 'discrete' ? '' : 'text-blue-500'}`}>unit</span>
                      </div>
                    ))}
                    {showAddTest && (
                      <div className="w-14 h-14 border-2 border-dashed border-red-400 rounded-xl flex flex-col items-center justify-center text-red-500 text-[10px] font-bold animate-pulse bg-red-50">
                        <span>Add 加</span>
                        <span>{addVal}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Summary Card */}
              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Total A (A 的總量)</p>
                    <p className="text-2xl font-black text-blue-700">{realA.toFixed(1)}</p>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-pink-300 uppercase mb-1">Total B (B 的總量)</p>
                    <p className="text-2xl font-black text-pink-600">{realB.toFixed(1)}</p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 text-white">Grand Total (總共)</p>
                    <p className="text-2xl font-black text-green-400">{totalReal.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mathematical Connection */}
            <div className="bg-indigo-900 rounded-2xl p-4 text-white flex items-center justify-between overflow-hidden relative">
              <div className="z-10">
                <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Algebraic Link 代數連結</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono">{ratioA}<span className="text-yellow-400">k</span> : {ratioB}<span className="text-yellow-400">k</span></span>
                  <span className="text-xs opacity-60 ml-2">(When k is {multiplier} / 當 k 是 {multiplier})</span>
                </div>
              </div>
              <div className="text-right z-10 hidden sm:block">
                <p className="text-[10px] opacity-60 font-bold uppercase">Relationship 關係</p>
                <p className="text-lg font-bold italic">Remains Constant 保持不變</p>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            </div>

          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-400 text-[9px] max-w-2xl mx-auto space-y-1">
        <p>© Ratio Learning Tool for S1 Students | 英中對照版</p>
        <p>Addresses: Integer Bias, Continuous Data, Additive Thinking, and Multiplier (k). <br/> 已解決：整數偏差、連續數據、加法思維及比例常數 (k) 之概念誤解。</p>
      </div>
    </div>
  );
};

export default App;