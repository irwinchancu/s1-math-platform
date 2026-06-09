import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Lightbulb, Info } from 'lucide-react';

// --- Visual Components (SVG Illustrations) ---
const Q1Image = () => (
  <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto h-40 drop-shadow-sm">
    <polygon points="40,60 50,30 80,30 90,60 80,90 50,90" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="2" />
    <polygon points="140,60 150,30 180,30 190,60 180,90 150,90" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="2" />
    <line x1="50" y1="30" x2="150" y2="30" stroke="#4f46e5" strokeWidth="2" />
    <line x1="80" y1="30" x2="180" y2="30" stroke="#4f46e5" strokeWidth="2" />
    <line x1="90" y1="60" x2="190" y2="60" stroke="#4f46e5" strokeWidth="2" />
    <line x1="80" y1="90" x2="180" y2="90" stroke="#4f46e5" strokeWidth="2" />
    <line x1="50" y1="90" x2="150" y2="90" stroke="#4f46e5" strokeWidth="2" />
    <line x1="40" y1="60" x2="140" y2="60" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4" />
    <text x="65" y="65" fontSize="12" fill="#312e81" textAnchor="middle" fontWeight="bold">Base</text>
    <text x="165" y="65" fontSize="12" fill="#312e81" textAnchor="middle" fontWeight="bold">Base</text>
  </svg>
);

const Q2Image = () => (
  <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto h-40 drop-shadow-sm">
    <polygon points="110,70 170,70 140,10" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4"/>
    <polygon points="70,30 140,10 170,70 100,90" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="2" />
    <polygon points="40,90 100,90 70,30" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
    <line x1="40" y1="90" x2="110" y2="70" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4"/>
    <text x="70" y="70" fontSize="14" fill="#312e81" fontWeight="bold">Front Base</text>
    <text x="135" y="55" fontSize="12" fill="#312e81" fontWeight="bold">Lateral Face</text>
  </svg>
);

const Q3Image = () => (
  <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto h-40 drop-shadow-sm">
    <defs>
      <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#4f46e5" />
      </marker>
    </defs>
    <polygon points="70,20 130,20 150,40 90,40" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
    <path d="M70,50 L130,50 L150,70 L90,70 L70,50" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="2"/>
    <polygon points="70,90 130,90 150,110 90,110" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
    <path d="M 160 30 Q 180 65 160 100" fill="none" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowHead)"/>
    <text x="110" y="35" fontSize="10" fill="#312e81" textAnchor="middle" fontWeight="bold">Base 1</text>
    <text x="110" y="105" fontSize="10" fill="#312e81" textAnchor="middle" fontWeight="bold">Base 2</text>
    <text x="175" y="70" fontSize="14" fill="#312e81" fontWeight="bold">x 2</text>
  </svg>
);

const Q4Image = () => (
  <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto h-40 drop-shadow-sm">
    {/* Trapezoidal Prism (梯形四角柱體) */}
    {/* Top Trapezium Base */}
    <polygon points="80,10 120,10 140,40 60,40" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
    
    {/* Bottom Trapezium Base (Hidden parts dashed) */}
    <polygon points="80,80 120,80 140,110 60,110" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4"/>
    <line x1="60" y1="110" x2="140" y2="110" stroke="#4f46e5" strokeWidth="2" />
    <line x1="140" y1="80" x2="140" y2="110" stroke="#4f46e5" strokeWidth="2" />
    
    {/* Vertical Edges connecting the bases */}
    <line x1="60" y1="40" x2="60" y2="110" stroke="#4f46e5" strokeWidth="2" />
    <line x1="140" y1="40" x2="140" y2="110" stroke="#4f46e5" strokeWidth="2" />
    <line x1="120" y1="10" x2="120" y2="80" stroke="#4f46e5" strokeWidth="2" />
    <line x1="80" y1="10" x2="80" y2="80" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4" />

    {/* Labels */}
    <text x="100" y="28" fontSize="11" fill="#312e81" textAnchor="middle" fontWeight="bold">Trapezium</text>
    <text x="100" y="38" fontSize="10" fill="#312e81" textAnchor="middle" fontWeight="bold">(Base Area)</text>
    
    {/* Height Indicator */}
    <path d="M 160 10 L 160 80" fill="none" stroke="#ef4444" strokeWidth="2" />
    <polygon points="155,15 160,10 165,15" fill="#ef4444" />
    <polygon points="155,75 160,80 165,75" fill="#ef4444" />
    <text x="165" y="50" fontSize="12" fill="#ef4444" fontWeight="bold">Height</text>
  </svg>
);

const Q5Image = () => (
  <svg viewBox="0 0 200 120" className="w-full max-w-md mx-auto h-40 drop-shadow-sm">
    <polygon points="100,10 130,30 120,60 80,60 70,30" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
    <polygon points="100,60 130,80 120,110 80,110 70,80" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4"/>
    <line x1="130" y1="30" x2="130" y2="80" stroke="#4f46e5" strokeWidth="2" />
    <line x1="120" y1="60" x2="120" y2="110" stroke="#4f46e5" strokeWidth="2" />
    <line x1="80" y1="60" x2="80" y2="110" stroke="#4f46e5" strokeWidth="2" />
    <line x1="70" y1="30" x2="70" y2="80" stroke="#4f46e5" strokeWidth="2" />
    <text x="100" y="40" fontSize="10" fill="#312e81" textAnchor="middle">Pentagon Base</text>
    <text x="100" y="90" fontSize="10" fill="#ef4444" textAnchor="middle">Lateral Walls</text>
  </svg>
);

const quizData = [
  {
    id: 1,
    question: 'What defines the "Base" of a prism? \n(什麼是柱體的「底面」？)',
    image: <Q1Image />,
    options: [
      { 
        label: 'A',
        text: 'A pair of parallel and congruent faces.\n(一對平行且全等的面。)', 
        isCorrect: true, 
        rationale: 'Correct! This is the geometric definition. The two bases must be identical and facing each other. (正確！這是幾何定義。兩個底面必須完全相同且互相平行。)' 
      },
      { 
        label: 'B',
        text: 'The face at the very bottom.\n(位於最底部的面。)', 
        isCorrect: false, 
        rationale: 'Prisms can be tilted or laid flat. "Base" refers to the shape\'s cross-section, not its physical position. (柱體可以傾斜或橫放。「底面」是指形狀的橫截面，而不是物理位置。)' 
      },
      { 
        label: 'C',
        text: 'The largest face of the shape.\n(形狀中最大的面。)', 
        isCorrect: false, 
        rationale: 'The base area depends on the shape, not size. A very tall prism has side rectangles much larger than the bases. (底面積取決於形狀而非大小。非常高的柱體，其側面積通常比底面積大得多。)' 
      },
      { 
        label: 'D',
        text: 'A face that must be a rectangle.\n(必須是長方形的面。)', 
        isCorrect: false, 
        rationale: 'Actually, the side faces (lateral faces) are usually rectangles, but the base can be any polygon. (實際上，側面通常是長方形，但底面可以是任何多邊形。)' 
      }
    ]
  },
  {
    id: 2,
    question: 'How many faces does a "Triangular Prism" have in total? \n(一個「三角柱體」總共有多少個面？)',
    image: <Q2Image />,
    options: [
      { 
        label: 'A',
        text: '3', 
        isCorrect: false, 
        rationale: 'This only counts the side rectangles. You forgot the 2 triangular ends! (這只數了側面的長方形。你忘記了兩端的 2 個三角形！)' 
      },
      { 
        label: 'B',
        text: '4', 
        isCorrect: false, 
        rationale: 'A triangular pyramid has 4 faces. A prism needs two identical bases plus the sides. (三角錐體有 4 個面。柱體需要兩個相同的底面加上側面。)' 
      },
      { 
        label: 'C',
        text: '5', 
        isCorrect: true, 
        rationale: 'Correct! 2 triangular bases + 3 rectangular sides = 5 faces. (正確！2 個三角形底面 + 3 個長方形側面 = 5 個面。)' 
      },
      { 
        label: 'D',
        text: '6', 
        isCorrect: false, 
        rationale: 'A cube or rectangular prism has 6 faces. A triangle only has 3 sides, so it only has 3 side faces. (正方體或長方體有 6 個面。三角形只有 3 條邊，所以只有 3個側面。)' 
      }
    ]
  },
  {
    id: 3,
    question: 'To find the Total Surface Area, why do we multiply the Base Area by 2? \n(計算總表面積時，為什麼底面積要乘以 2？)',
    image: <Q3Image />,
    options: [
      { 
        label: 'A',
        text: 'To cancel the "divided by 2" in a triangle.\n(為了抵消三角形公式中的「除以 2」。)', 
        isCorrect: false, 
        rationale: 'No, even for rectangular prisms where we don\'t divide by 2, we still need both bases. (不，即使是不用除以 2 的長方體，我們仍需要計算兩個底面。)' 
      },
      { 
        label: 'B',
        text: 'Because a prism has two identical bases at both ends.\n(因為柱體兩端有一對相同的底面。)', 
        isCorrect: true, 
        rationale: 'Correct! Surface area includes all outer surfaces. Every prism is "sealed" by a top and a bottom. (正確！表面積包括所有外表面。每個柱體都由頂部和底部「封閉」。)' 
      },
      { 
        label: 'C',
        text: 'Because height has two directions.\n(因為高度有兩個方向。)', 
        isCorrect: false, 
        rationale: 'Height is just a distance measurement; it doesn\'t multiply the number of faces. (高度只是距離測量；它不會增加面的數量。)' 
      },
      { 
        label: 'D',
        text: 'It is a random constant in the formula.\n(這是公式中的隨機常數。)', 
        isCorrect: false, 
        rationale: 'In math, numbers usually represent something physical. Here, "2" represents the two bases. (在數學中，數字通常代表物理意義。這裡的 "2" 代表兩個底面。)' 
      }
    ]
  },
  {
    id: 4,
    question: 'If a quadrilateral prism has a Trapezium base, what is the formula for its Volume? \n(如果一個四角柱體的底面是梯形，求體積的公式是什麼？)',
    image: <Q4Image />,
    options: [
      { 
        label: 'A',
        text: 'Base Area × Height\n(底面積 × 高度)', 
        isCorrect: true, 
        rationale: 'Correct! This universal formula works for ALL prisms, regardless of the base shape. Find the area of the trapezium first, then multiply by height. (正確！這個通用公式適用於所有柱體，無論底面是什麼形狀。先計算梯形面積，再乘以高。)' 
      },
      { 
        label: 'B',
        text: 'Sum of all edges\n(所有邊長的總和)', 
        isCorrect: false, 
        rationale: 'Adding edges gives you the length of a wireframe, not the space inside (volume). (邊長相加得到的是框架長度，而不是內部的空間體積。)' 
      },
      { 
        label: 'C',
        text: 'Length × Width × Height\n(長 × 闊 × 高)', 
        isCorrect: false, 
        rationale: 'This only works if the base is a rectangle. Trapeziums don\'t have a single "width" because the top and bottom parallel sides are different lengths. (這僅在底面為長方形時有效。梯形沒有單一的「闊」，因為其平行的上下兩邊長度不同。)' 
      },
      { 
        label: 'D',
        text: 'Base Perimeter × Height\n(底面周界 × 高度)', 
        isCorrect: false, 
        rationale: 'This formula calculates the Lateral Surface Area (the side walls), not the Volume. (這個公式計算的是側面積，而不是體積。)' 
      }
    ]
  },
  {
    id: 5,
    question: 'How many "Lateral Faces" (side rectangles) does a Pentagonal Prism have? \n(一個「五角柱體」有多少個側部面？)',
    image: <Q5Image />,
    options: [
      { 
        label: 'A',
        text: '2', 
        isCorrect: false, 
        rationale: '2 is always the number of bases in a prism. (2 永遠是柱體中底面的數量。)' 
      },
      { 
        label: 'B',
        text: '5', 
        isCorrect: true, 
        rationale: 'Correct! The number of side faces always equals the number of sides on the base shape. (正確！側面數永遠等於底面形狀的邊數。)' 
      },
      { 
        label: 'C',
        text: '7', 
        isCorrect: false, 
        rationale: '7 is the TOTAL number of faces (5 sides + 2 bases). The question only asked for lateral faces. (7 是總面數。題目只問側面的數量。)' 
      },
      { 
        label: 'D',
        text: '10', 
        isCorrect: false, 
        rationale: 'You don\'t need to double the sides. One base edge creates only one side face. (不需要將邊數加倍。底面的一條邊只會產生一個側面。)' 
      }
    ]
  }
];

export default function PrismLearningApp() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleOptionClick = (index, isCorrect) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (isCorrect) setScore(score + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 flex items-center justify-center font-sans">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
            <p className="text-lg text-slate-600 mb-6">測驗完成！</p>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-indigo-100 mb-6">
              <span className="text-4xl font-bold text-indigo-600">{score}/{quizData.length}</span>
            </div>
            <p className="text-xl font-medium text-slate-700">
              {score === quizData.length ? 'Outstanding! (太棒了！全對！)' : 
               score >= 3 ? 'Good job! Keep it up! (做得好！繼續努力！)' : 
               'Keep practicing! (繼續練習！)'}
            </p>
          </div>
          <button onClick={restartQuiz} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all">
            <RotateCcw className="w-5 h-5" /> Try Again (再試一次)
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Question & Image */}
        <div className="md:w-5/12 p-8 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Q{currentQuestion + 1} / {quizData.length}</span>
            <span className="text-xs font-bold text-slate-400">Score: {score}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 whitespace-pre-line leading-relaxed">
            {currentQ.question}
          </h2>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-center items-center mt-auto mb-auto">
            {currentQ.image}
          </div>
        </div>

        {/* Right Side: Options & Interaction */}
        <div className="md:w-7/12 p-8 bg-slate-50/50 flex flex-col h-[600px] overflow-y-auto custom-scrollbar">
          <div className="flex-grow space-y-4">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedOption === index;
              let btnContainerClass = "w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden flex flex-col ";
              let btnHeaderClass = "p-4 flex items-start gap-3 w-full ";
              
              if (!isAnswered) {
                btnContainerClass += "border-white bg-white shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer";
                btnHeaderClass += "text-slate-700";
              } else if (option.isCorrect) {
                btnContainerClass += "border-green-500 bg-green-50 shadow-none";
                btnHeaderClass += "text-green-800 font-medium";
              } else if (isSelected && !option.isCorrect) {
                btnContainerClass += "border-red-500 bg-red-50 shadow-none";
                btnHeaderClass += "text-red-800 font-medium";
              } else {
                btnContainerClass += "border-transparent bg-white/60 shadow-none opacity-70";
                btnHeaderClass += "text-slate-500";
              }

              return (
                <div key={index} className={btnContainerClass}>
                  <button 
                    onClick={() => handleOptionClick(index, option.isCorrect)} 
                    disabled={isAnswered} 
                    className={btnHeaderClass}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${!isAnswered ? 'bg-slate-100 text-slate-500' : option.isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {option.label}
                    </span>
                    <div className="text-sm whitespace-pre-line leading-snug text-left">
                      {option.text}
                    </div>
                  </button>
                  
                  {/* Inline Explanation (Shows only after answered) */}
                  {isAnswered && (
                    <div className={`px-4 pb-4 pt-1 ml-9 text-xs leading-relaxed animate-in fade-in slide-in-from-top-2 ${option.isCorrect ? 'text-green-700' : 'text-slate-600'}`}>
                      <div className="flex gap-1.5 mt-1 border-t border-slate-200/50 pt-3">
                        <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${option.isCorrect ? 'text-green-600' : 'text-indigo-400'}`} />
                        <span><strong className={option.isCorrect ? 'text-green-800' : 'text-indigo-800'}>解析：</strong>{option.rationale}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isAnswered && (
            <button onClick={handleNextQuestion} className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-slate-200 sticky bottom-0 z-10 animate-in fade-in slide-in-from-bottom-4">
              {currentQuestion < quizData.length - 1 ? 'Next Question (下一題)' : 'Final Results (完成測驗)'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}