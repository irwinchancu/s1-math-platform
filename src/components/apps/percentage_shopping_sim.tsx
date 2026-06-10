"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, ShoppingCart, CheckCircle2, XCircle, RefreshCw, Calculator, Percent } from 'lucide-react';

const ITEMS = [
  { name: 'Sneakers / 運動鞋', basePrice: [400, 500, 600, 800, 1000], icon: '👟' },
  { name: 'Laptop / 手提電腦', basePrice: [4000, 5000, 8000, 10000], icon: '💻' },
  { name: 'Headphones / 耳機', basePrice: [200, 300, 500, 800], icon: '🎧' },
  { name: 'Watch / 手錶', basePrice: [1000, 1500, 2000, 3000], icon: '⌚' },
  { name: 'Backpack / 背包', basePrice: [150, 250, 350, 500], icon: '🎒' }
];

export default function PercentageShoppingSim() {
  const [item, setItem] = useState(ITEMS[0]);
  const [originalPrice, setOriginalPrice] = useState(500);
  const [discountPercent, setDiscountPercent] = useState(20);
  
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{msg: string, type: 'success'|'error'|null}>({msg: '', type: null});
  const [score, setScore] = useState(0);

  const generateItem = () => {
    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const randomPrice = randomItem.basePrice[Math.floor(Math.random() * randomItem.basePrice.length)];
    
    // Discounts usually 10%, 15%, 20%, 25%, 30%, 40%, 50%, etc.
    const discounts = [10, 15, 20, 25, 30, 40, 50, 60, 75];
    const randomDiscount = discounts[Math.floor(Math.random() * discounts.length)];
    
    setItem(randomItem);
    setOriginalPrice(randomPrice);
    setDiscountPercent(randomDiscount);
    setUserInput('');
    setFeedback({msg: '', type: null});
  };

  useEffect(() => {
    generateItem();
  }, []);

  const handleBuy = () => {
    if (!userInput) return;
    const sellingPrice = originalPrice * (1 - discountPercent / 100);
    
    if (parseFloat(userInput) === sellingPrice) {
      setFeedback({msg: 'Correct! Transaction successful. / 正確！交易成功。', type: 'success'});
      setScore(s => s + 100);
      logProgress();
      setTimeout(generateItem, 2000);
    } else {
      setFeedback({msg: `Incorrect. Hint: ${originalPrice} × (1 - ${discountPercent}%) = ?`, type: 'error'});
      setScore(s => Math.max(0, s - 20));
    }
  };

  const logProgress = async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug: 'percentages', score: 100, notes: 'Completed shopping sim' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const discountAmount = originalPrice * (discountPercent / 100);
  const sellingPrice = originalPrice - discountAmount;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-white font-sans max-w-5xl mx-auto">
      
      {/* Left Panel: Visualizer */}
      <div className="flex-1 flex flex-col">
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-emerald-400" />
            <span>Discount Simulator <span className="text-slate-400 text-sm font-normal">| 折扣模擬器</span></span>
          </h2>
          <div className="bg-slate-800 px-4 py-1 border border-slate-700 rounded-lg text-emerald-400 font-black">
            $ {score}
          </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
          
          {/* Neon Glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full"></div>

          <div className="text-8xl mb-4 relative z-10 animate-bounce">{item.icon}</div>
          <h3 className="text-2xl font-black text-white relative z-10">{item.name}</h3>
          
          {/* Price Tags */}
          <div className="flex items-center gap-4 mt-6 relative z-10">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center line-through opacity-70">
               <div className="text-xs text-slate-400 font-bold mb-1 uppercase">Original / 原價</div>
               <div className="text-2xl font-bold text-slate-300">${originalPrice}</div>
            </div>
            
            <div className="bg-rose-950/50 border border-rose-500/50 p-4 rounded-xl text-center transform -rotate-3">
               <div className="text-xs text-rose-300 font-bold mb-1 uppercase flex items-center justify-center gap-1"><Tag size={12}/> Discount / 折扣</div>
               <div className="text-3xl font-black text-rose-400">{discountPercent}% OFF</div>
            </div>
          </div>

          {/* Visualizer Bar */}
          <div className="w-full mt-10 relative z-10">
             <div className="flex justify-between text-xs text-slate-400 font-bold mb-2">
                <span>$0</span>
                <span>Original: ${originalPrice}</span>
             </div>
             <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-950 transition-all duration-500" 
                  style={{ width: `${100 - discountPercent}%` }}
                >
                  Selling Price
                </div>
                <div 
                  className="h-full bg-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-400 transition-all duration-500 relative" 
                  style={{ width: `${discountPercent}%` }}
                >
                   {/* Striped pattern overlay for discount part */}
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
                   Discount
                </div>
             </div>
             <div className="flex justify-between text-xs font-bold mt-2">
                <span className="text-emerald-400 text-left w-full" style={{ width: `${100 - discountPercent}%` }}>{100 - discountPercent}%</span>
                <span className="text-rose-400 text-right w-full" style={{ width: `${discountPercent}%` }}>{discountPercent}%</span>
             </div>
          </div>

        </div>
      </div>

      {/* Right Panel: Controls & Feedback */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        
        <div className="bg-slate-800/50 p-6 rounded-2xl flex flex-col gap-4 flex-1 border border-slate-700">
          
          <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2"><Calculator size={20} className="text-amber-400"/> Calculate!</h3>
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono text-sm text-slate-300 space-y-2">
             <div className="flex justify-between">
                <span>Original Price:</span>
                <span>${originalPrice}</span>
             </div>
             <div className="flex justify-between text-rose-400 border-b border-slate-700 pb-2">
                <span>Discount ({discountPercent}%):</span>
                <span>- $ ?</span>
             </div>
             <div className="flex justify-between text-emerald-400 font-bold pt-2 text-lg">
                <span>Selling Price:</span>
                <span>$ ?</span>
             </div>
          </div>

          <div className="mt-4">
             <label className="text-sm text-slate-400 font-bold mb-2 block">Enter Selling Price / 輸入售價:</label>
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
               <input 
                 type="number" 
                 value={userInput}
                 onChange={(e) => setUserInput(e.target.value)}
                 placeholder="0.00"
                 onKeyDown={(e) => e.key === 'Enter' && handleBuy()}
                 className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 outline-none rounded-xl py-3 pl-8 pr-4 text-xl font-black text-white transition-colors"
               />
             </div>
          </div>

          <button 
             onClick={handleBuy}
             className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
          >
             <ShoppingCart size={20} /> Buy Item / 購買
          </button>

          {feedback.type && (
            <div className={`mt-4 p-4 rounded-xl flex flex-col gap-1 animate-in slide-in-from-bottom-2 ${feedback.type === 'success' ? 'bg-emerald-950/50 border border-emerald-900' : 'bg-rose-950/50 border border-rose-900'}`}>
              <div className="flex items-center gap-2">
                 {feedback.type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-rose-500" />}
                 <span className={`font-bold ${feedback.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {feedback.msg.split(' / ')[0]}
                 </span>
              </div>
              <span className={`text-sm ml-8 ${feedback.type === 'success' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                 {feedback.msg.split(' / ')[1]}
              </span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
