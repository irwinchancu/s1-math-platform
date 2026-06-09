import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, Droplets, Paintbrush, Box, ArrowRight, RotateCcw, AlertCircle, PartyPopper, Map, MousePointerClick, Lightbulb, Sparkles, X, Triangle, Square, Pentagon, Play, Pause } from 'lucide-react';

// --- Theme Colors ---
const COLORS = {
  blue: { done: 'rgba(59, 130, 246, 0.6)', active: 'rgba(147, 197, 253, 0.8)', hover: 'rgba(219, 234, 254, 0.8)', default: 'rgba(226, 232, 240, 0.5)', bgDone: 'bg-blue-100 text-blue-800', bgActive: 'bg-blue-50 ring-2 ring-blue-400 text-blue-700 transform scale-[1.02]', iconDone: 'text-blue-500', iconBorder: 'border-blue-500', boxBorder: 'border-blue-400', boxText: 'text-blue-800', inputFocus: 'focus:border-blue-500' },
  emerald: { done: 'rgba(16, 185, 129, 0.6)', active: 'rgba(110, 231, 183, 0.8)', hover: 'rgba(209, 250, 229, 0.8)', default: 'rgba(226, 232, 240, 0.5)', bgDone: 'bg-emerald-100 text-emerald-800', bgActive: 'bg-emerald-50 ring-2 ring-emerald-400 text-emerald-700 transform scale-[1.02]', iconDone: 'text-emerald-500', iconBorder: 'border-emerald-500', boxBorder: 'border-emerald-400', boxText: 'text-emerald-800', inputFocus: 'focus:border-emerald-500' },
  purple: { done: 'rgba(139, 92, 246, 0.6)', active: 'rgba(196, 181, 253, 0.8)', hover: 'rgba(237, 233, 254, 0.8)', default: 'rgba(226, 232, 240, 0.5)', bgDone: 'bg-purple-100 text-purple-800', bgActive: 'bg-purple-50 ring-2 ring-purple-400 text-purple-700 transform scale-[1.02]', iconDone: 'text-purple-500', iconBorder: 'border-purple-500', boxBorder: 'border-purple-400', boxText: 'text-purple-800', inputFocus: 'focus:border-purple-500' },
  rose: { done: 'rgba(244, 63, 94, 0.6)', active: 'rgba(253, 164, 175, 0.8)', hover: 'rgba(255, 228, 230, 0.8)', default: 'rgba(226, 232, 240, 0.5)', bgDone: 'bg-rose-100 text-rose-800', bgActive: 'bg-rose-50 ring-2 ring-rose-400 text-rose-700 transform scale-[1.02]', iconDone: 'text-rose-500', iconBorder: 'border-rose-500', boxBorder: 'border-rose-400', boxText: 'text-rose-800', inputFocus: 'focus:border-rose-500' },
  orange: { done: 'rgba(249, 115, 22, 0.6)', active: 'rgba(253, 186, 116, 0.8)', hover: 'rgba(255, 237, 213, 0.8)', default: 'rgba(226, 232, 240, 0.5)', bgDone: 'bg-orange-100 text-orange-800', bgActive: 'bg-orange-50 ring-2 ring-orange-400 text-orange-700 transform scale-[1.02]', iconDone: 'text-orange-500', iconBorder: 'border-orange-500', boxBorder: 'border-orange-400', boxText: 'text-orange-800', inputFocus: 'focus:border-orange-500' }
};

// --- Shape Configurations ---
const PRISM_CONFIGS = {
  '3': {
    nameEN: 'Triangular Prism', nameZH: '三角柱體',
    icon: Triangle, prismLength: 6, baseArea: 6, totalBaseArea: 12, totalSurfaceArea: 84,
    vertices: { A: [-1.5, -2, -3], B: [-1.5, 2, -3], C: [1.5, 2, -3], D: [-1.5, -2, 3], E: [-1.5, 2, 3], F: [1.5, 2, 3] },
    faces: [
      { id: 'front', pts: ['A', 'B', 'C'], expected: 'base' }, { id: 'back', pts: ['F', 'E', 'D'], expected: 'base' }, 
      { id: 'l1', pts: ['C', 'A', 'D', 'F'], expected: 'lateral', w: 5, nameEN: 'Face 1', nameZH: '斜面', label: 'ACFD', color: 'blue', topPts: ['A', 'C'], botPts: ['D', 'F'] },
      { id: 'l2', pts: ['C', 'B', 'E', 'F'], expected: 'lateral', w: 3, nameEN: 'Face 2', nameZH: '底面', label: 'BCFE', color: 'emerald', topPts: ['C', 'B'], botPts: ['F', 'E'] },
      { id: 'l3', pts: ['B', 'A', 'D', 'E'], expected: 'lateral', w: 4, nameEN: 'Face 3', nameZH: '垂直面', label: 'ABED', color: 'purple', topPts: ['B', 'A'], botPts: ['E', 'D'] }
    ],
    edges: [
      { id: 'AB', pts: ['A','B'] }, { id: 'BC', pts: ['B','C'] }, { id: 'CA', pts: ['C','A'] },
      { id: 'DE', pts: ['D','E'] }, { id: 'EF', pts: ['E','F'] }, { id: 'FD', pts: ['F','D'] },
      { id: 'AD', pts: ['A','D'] }, { id: 'BE', pts: ['B','E'] }, { id: 'CF', pts: ['C','F'] }
    ],
    labels3D: [ { p1: 'A', p2: 'B', en: '4 cm', zh: '(Height/高)' }, { p1: 'B', p2: 'C', en: '3 cm', zh: '(Base/底)' }, { p1: 'A', p2: 'C', en: '5 cm', zh: '(Slope/斜)' }, { p1: 'C', p2: 'F', en: '6 cm', zh: '(Length/長)' } ],
    step2FormulaEN: 'Area = (Base × Height) ÷ 2', step2FormulaZH: '面積 = (底 × 高) ÷ 2',
    renderStatic: () => (
      <svg width="100%" viewBox="-10 -10 220 180" className="drop-shadow-sm">
        <line x1="50" y1="130" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="120" y1="20" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="120" y1="100" x2="180" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="50,50 50,130 110,130" fill="rgba(252, 211, 77, 0.2)" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <line x1="50" y1="50" x2="110" y2="130" stroke="#475569" strokeWidth="2" />
        <line x1="50" y1="50" x2="120" y2="20" stroke="#475569" strokeWidth="2" />
        <line x1="110" y1="130" x2="180" y2="100" stroke="#475569" strokeWidth="2" />
        <line x1="120" y1="20" x2="180" y2="100" stroke="#475569" strokeWidth="2" />
        <text x="32" y="45" fill="#1e293b" className="font-bold text-lg">A</text> <text x="32" y="145" fill="#1e293b" className="font-bold text-lg">B</text>
        <text x="115" y="150" fill="#1e293b" className="font-bold text-lg">C</text> <text x="120" y="10" fill="#1e293b" className="font-bold text-lg">D</text>
        <text x="125" y="115" fill="#1e293b" className="font-bold text-lg">E</text> <text x="185" y="105" fill="#1e293b" className="font-bold text-lg">F</text>
        <text x="25" y="95" fill="#b45309" className="text-sm font-bold">4</text> <text x="80" y="150" fill="#b45309" className="text-sm font-bold">3</text>
        <text x="85" y="85" fill="#b45309" className="text-sm font-bold">5</text> <text x="145" y="125" fill="#475569" className="text-sm font-bold">L/長: 6</text>
      </svg>
    ),
    renderNetBases: (startX, scale, y, h) => {
      const x0 = startX + 5 * scale; const x1 = x0 + 3 * scale;
      return (
        <g>
          <polygon points={`${x0},${y} ${x1},${y} ${x1},${y - 4*scale}`} fill="#FCD34D" stroke="#b45309" strokeWidth="2" />
          <text x={x1} y={y - 4*scale - 5} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">A</text>
          <text x={x0+1.5*scale} y={y - 2*scale} fill="#b45309" className="text-xs font-bold pointer-events-none" transform={`rotate(-53, ${x0+1.5*scale}, ${y-2*scale})`}>5 cm</text>
          <text x={x1+15} y={y - 2*scale} textAnchor="middle" fill="#b45309" className="text-xs font-bold pointer-events-none">4 cm</text>
          <polygon points={`${x0},${y+h} ${x1},${y+h} ${x1},${y+h + 4*scale}`} fill="#FCD34D" stroke="#b45309" strokeWidth="2" />
          <text x={x1} y={y+h + 4*scale + 15} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">D</text>
          <text x={x1+15} y={y+h + 2*scale} textAnchor="middle" fill="#b45309" className="text-xs font-bold pointer-events-none">4 cm</text>
        </g>
      );
    }
  },
  '4': {
    nameEN: 'Trapezoidal Prism', nameZH: '梯形柱體',
    icon: Square, prismLength: 6, baseArea: 14, totalBaseArea: 28, totalSurfaceArea: 124, 
    vertices: {
      A: [-2.5, -2, -3], B: [-2.5, 2, -3], C: [2.5, 2, -3], D: [-0.5, -2, -3],
      E: [-2.5, -2, 3], F: [-2.5, 2, 3], G: [2.5, 2, 3], H: [-0.5, -2, 3]
    },
    faces: [
      { id: 'front', pts: ['A', 'B', 'C', 'D'], expected: 'base' }, { id: 'back', pts: ['E', 'H', 'G', 'F'], expected: 'base' },
      { id: 'l1', pts: ['D', 'A', 'E', 'H'], expected: 'lateral', w: 2, nameEN: 'Face 1 (Top)', nameZH: '上底面', label: 'ADHE', color: 'blue', topPts: ['A', 'D'], botPts: ['E', 'H'] },
      { id: 'l2', pts: ['C', 'D', 'H', 'G'], expected: 'lateral', w: 5, nameEN: 'Face 2 (Slant)', nameZH: '右斜面', label: 'DCGH', color: 'emerald', topPts: ['D', 'C'], botPts: ['H', 'G'] },
      { id: 'l3', pts: ['B', 'C', 'G', 'F'], expected: 'lateral', w: 5, nameEN: 'Face 3 (Bottom)', nameZH: '下底面', label: 'BCGF', color: 'purple', topPts: ['C', 'B'], botPts: ['G', 'F'] },
      { id: 'l4', pts: ['A', 'B', 'F', 'E'], expected: 'lateral', w: 4, nameEN: 'Face 4 (Vertical)', nameZH: '左直面', label: 'ABFE', color: 'rose', topPts: ['B', 'A'], botPts: ['F', 'E'] }
    ],
    edges: [
      { id: 'AB', pts: ['A','B'] }, { id: 'BC', pts: ['B','C'] }, { id: 'CD', pts: ['C','D'] }, { id: 'DA', pts: ['D','A'] },
      { id: 'EF', pts: ['E','F'] }, { id: 'FG', pts: ['F','G'] }, { id: 'GH', pts: ['G','H'] }, { id: 'HE', pts: ['H','E'] },
      { id: 'AE', pts: ['A','E'] }, { id: 'BF', pts: ['B','F'] }, { id: 'CG', pts: ['C','G'] }, { id: 'DH', pts: ['D','H'] }
    ],
    labels3D: [
      { p1: 'A', p2: 'D', en: '2 cm', zh: '(Top/上底)' }, { p1: 'B', p2: 'C', en: '5 cm', zh: '(Bottom/下底)' },
      { p1: 'A', p2: 'B', en: '4 cm', zh: '(Height/高)' }, { p1: 'C', p2: 'D', en: '5 cm', zh: '(Slant/斜)' },
      { p1: 'C', p2: 'G', en: '6 cm', zh: '(Length/長)' }
    ],
    step2FormulaEN: 'Area = (Top + Bottom) × Height ÷ 2', step2FormulaZH: '面積 = (上底 + 下底) × 高 ÷ 2',
    renderStatic: () => (
      <svg width="100%" viewBox="-20 -10 240 180" className="drop-shadow-sm">
        <line x1="50" y1="130" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="120" y1="20" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="120" y1="20" x2="160" y2="20" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="160" y1="20" x2="220" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="120" y1="100" x2="220" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <polygon points="50,50 50,130 150,130 90,50" fill="rgba(252, 211, 77, 0.2)" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <line x1="50" y1="50" x2="90" y2="50" stroke="#475569" strokeWidth="2" />
        <line x1="50" y1="50" x2="120" y2="20" stroke="#475569" strokeWidth="2" />
        <line x1="90" y1="50" x2="160" y2="20" stroke="#475569" strokeWidth="2" />
        <line x1="150" y1="130" x2="220" y2="100" stroke="#475569" strokeWidth="2" />
        <line x1="90" y1="50" x2="150" y2="130" stroke="#475569" strokeWidth="2" />
        <text x="32" y="45" fill="#1e293b" className="font-bold text-lg">A</text> <text x="32" y="145" fill="#1e293b" className="font-bold text-lg">B</text>
        <text x="155" y="145" fill="#1e293b" className="font-bold text-lg">C</text> <text x="95" y="45" fill="#1e293b" className="font-bold text-lg">D</text>
        <text x="120" y="10" fill="#1e293b" className="font-bold text-lg">E</text> <text x="125" y="115" fill="#1e293b" className="font-bold text-lg">F</text>
        <text x="230" y="115" fill="#1e293b" className="font-bold text-lg">G</text> <text x="165" y="15" fill="#1e293b" className="font-bold text-lg">H</text>
        <text x="25" y="95" fill="#b45309" className="text-sm font-bold">4</text> 
        <text x="100" y="145" fill="#b45309" className="text-sm font-bold">5</text>
        <text x="70" y="40" fill="#b45309" className="text-sm font-bold">2</text>
        <text x="130" y="85" fill="#b45309" className="text-sm font-bold">5</text>
        <text x="185" y="125" fill="#475569" className="text-sm font-bold">L/長: 6</text>
      </svg>
    ),
    renderNetBases: (startX, scale, y, h) => {
      const xC = startX + 7 * scale; const xB = xC + 5 * scale; const xA = xB; const yA = y - 4 * scale; const xD = xA - 2 * scale; const yD = yA;
      return (
        <g>
          <polygon points={`${xC},${y} ${xB},${y} ${xA},${yA} ${xD},${yD}`} fill="#FCD34D" stroke="#b45309" strokeWidth="2" />
          <text x={xA+10} y={yA} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">A</text>
          <text x={xD-10} y={yD} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">D</text>
          <text x={xA+15} y={y - 2*scale} textAnchor="middle" fill="#b45309" className="text-xs font-bold pointer-events-none">4 cm</text>
          <text x={xD + scale} y={yD - 8} textAnchor="middle" fill="#b45309" className="text-xs font-bold pointer-events-none">2 cm</text>
          <polygon points={`${xC},${y+h} ${xB},${y+h} ${xA},${y+h+4*scale} ${xD},${y+h+4*scale}`} fill="#FCD34D" stroke="#b45309" strokeWidth="2" />
          <text x={xA+10} y={y+h+4*scale+10} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">E</text>
          <text x={xD-10} y={y+h+4*scale+10} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">H</text>
          <text x={xA+15} y={y+h + 2*scale} textAnchor="middle" fill="#b45309" className="text-xs font-bold pointer-events-none">4 cm</text>
          <text x={xD + scale} y={y+h+4*scale + 15} textAnchor="middle" fill="#b45309" className="text-xs font-bold pointer-events-none">2 cm</text>
        </g>
      );
    }
  },
  '5': {
    nameEN: 'Pentagonal Prism', nameZH: '五角柱體',
    icon: Pentagon, prismLength: 10, baseArea: 45, totalBaseArea: 90, totalSurfaceArea: 390,
    vertices: {
      A: [0, -2.5, -5], B: [-2.5, -0.5, -5], C: [-1.4, 1.9, -5], D: [2.0, 2.0, -5], E: [2.5, -1.0, -5],
      F: [0, -2.5, 5], G: [-2.5, -0.5, 5], H: [-1.4, 1.9, 5], I: [2.0, 2.0, 5], J: [2.5, -1.0, 5]
    },
    faces: [
      { id: 'front', pts: ['A', 'B', 'C', 'D', 'E'], expected: 'base' }, { id: 'back', pts: ['F', 'J', 'I', 'H', 'G'], expected: 'base' },
      { id: 'l1', pts: ['B', 'A', 'F', 'G'], expected: 'lateral', w: 4, nameEN: 'Face 1', nameZH: '側面 1', label: 'ABGF', color: 'blue', topPts: ['A', 'B'], botPts: ['F', 'G'] },
      { id: 'l2', pts: ['C', 'B', 'G', 'H'], expected: 'lateral', w: 5, nameEN: 'Face 2', nameZH: '側面 2', label: 'BCHG', color: 'emerald', topPts: ['B', 'C'], botPts: ['G', 'H'] },
      { id: 'l3', pts: ['D', 'C', 'H', 'I'], expected: 'lateral', w: 6, nameEN: 'Face 3', nameZH: '側面 3', label: 'CDIH', color: 'purple', topPts: ['C', 'D'], botPts: ['H', 'I'] },
      { id: 'l4', pts: ['E', 'D', 'I', 'J'], expected: 'lateral', w: 7, nameEN: 'Face 4', nameZH: '側面 4', label: 'DEJI', color: 'rose', topPts: ['D', 'E'], botPts: ['I', 'J'] },
      { id: 'l5', pts: ['A', 'E', 'J', 'F'], expected: 'lateral', w: 8, nameEN: 'Face 5', nameZH: '側面 5', label: 'EAFJ', color: 'orange', topPts: ['E', 'A'], botPts: ['J', 'F'] }
    ],
    edges: [
      { id: 'AB', pts: ['A','B'] }, { id: 'BC', pts: ['B','C'] }, { id: 'CD', pts: ['C','D'] }, { id: 'DE', pts: ['D','E'] }, { id: 'EA', pts: ['E','A'] },
      { id: 'FG', pts: ['F','G'] }, { id: 'GH', pts: ['G','H'] }, { id: 'HI', pts: ['H','I'] }, { id: 'IJ', pts: ['I','J'] }, { id: 'JF', pts: ['J','F'] },
      { id: 'AF', pts: ['A','F'] }, { id: 'BG', pts: ['B','G'] }, { id: 'CH', pts: ['C','H'] }, { id: 'DI', pts: ['D','I'] }, { id: 'EJ', pts: ['E','J'] }
    ],
    labels3D: [
      { p1: 'A', p2: 'B', en: '4 cm', zh: '' }, { p1: 'B', p2: 'C', en: '5 cm', zh: '' }, { p1: 'C', p2: 'D', en: '6 cm', zh: '' },
      { p1: 'D', p2: 'E', en: '7 cm', zh: '' }, { p1: 'E', p2: 'A', en: '8 cm', zh: '' }, { p1: 'D', p2: 'I', en: '10 cm', zh: '(Length/長)' }
    ],
    step2FormulaEN: 'Given Area = 45 cm²', step2FormulaZH: '已知面積 = 45 cm²',
    renderStatic: () => (
      <svg width="100%" viewBox="-30 -10 260 180" className="drop-shadow-sm">
        <polygon points="50,50 20,80 30,130 70,130 90,80" fill="rgba(252, 211, 77, 0.2)" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
        <line x1="20" y1="80" x2="110" y2="50" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="30" y1="130" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="110" y1="50" x2="120" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="120" y1="100" x2="160" y2="100" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="110" y1="50" x2="140" y2="20" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="50" y1="50" x2="140" y2="20" stroke="#475569" strokeWidth="2" />
        <line x1="90" y1="80" x2="180" y2="50" stroke="#475569" strokeWidth="2" />
        <line x1="70" y1="130" x2="160" y2="100" stroke="#475569" strokeWidth="2" />
        <line x1="140" y1="20" x2="180" y2="50" stroke="#475569" strokeWidth="2" />
        <line x1="180" y1="50" x2="160" y2="100" stroke="#475569" strokeWidth="2" />
        <text x="45" y="45" fill="#1e293b" className="font-bold text-lg">A</text> <text x="5" y="85" fill="#1e293b" className="font-bold text-lg">B</text>
        <text x="15" y="145" fill="#1e293b" className="font-bold text-lg">C</text> <text x="75" y="145" fill="#1e293b" className="font-bold text-lg">D</text>
        <text x="95" y="75" fill="#1e293b" className="font-bold text-lg">E</text>
        <text x="25" y="55" fill="#b45309" className="text-xs font-bold">4</text> <text x="10" y="115" fill="#b45309" className="text-xs font-bold">5</text>
        <text x="50" y="145" fill="#b45309" className="text-xs font-bold">6</text> <text x="90" y="115" fill="#b45309" className="text-xs font-bold">7</text>
        <text x="70" y="55" fill="#b45309" className="text-xs font-bold">8</text> <text x="135" y="125" fill="#475569" className="text-sm font-bold">L/長: 10</text>
      </svg>
    ),
    renderNetBases: (startX, scale, y, h) => {
      const xC = startX + 9 * scale; const xD = xC + 6 * scale;
      return (
        <g>
          <polygon points={`${xC},${y} ${xD},${y} ${xD+2*scale},${y-3*scale} ${xC+3*scale},${y-6*scale} ${xC-2*scale},${y-4*scale}`} fill="#FCD34D" stroke="#b45309" strokeWidth="2" />
          <text x={xC-2*scale-10} y={y-4*scale} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">B</text>
          <text x={xC+3*scale} y={y-6*scale-10} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">A</text>
          <text x={xD+2*scale+10} y={y-3*scale} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">E</text>
          <text x={xC+3*scale} y={y-2*scale} textAnchor="middle" fill="#b45309" className="text-sm font-bold pointer-events-none">Area=45</text>
          <polygon points={`${xC},${y+h} ${xD},${y+h} ${xD+2*scale},${y+h+3*scale} ${xC+3*scale},${y+h+6*scale} ${xC-2*scale},${y+h+4*scale}`} fill="#FCD34D" stroke="#b45309" strokeWidth="2" />
          <text x={xC-2*scale-10} y={y+h+4*scale+10} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">G</text>
          <text x={xC+3*scale} y={y+h+6*scale+15} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">F</text>
          <text x={xD+2*scale+10} y={y+h+3*scale+10} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">J</text>
          <text x={xC+3*scale} y={y+h+2*scale+10} textAnchor="middle" fill="#b45309" className="text-sm font-bold pointer-events-none">Area=45</text>
        </g>
      );
    }
  }
};

const getInitialLateralMath = (conf) => {
  const initial = {};
  conf.faces.filter(f => f.expected === 'lateral').forEach(f => {
    initial[f.id] = { done: false, l: '', w: '', a: '' };
  });
  return initial;
};

export default function App() {
  const [prismType, setPrismType] = useState('3'); 
  const config = PRISM_CONFIGS[prismType];

  const [step, setStep] = useState(0);
  const [selectedBases, setSelectedBases] = useState([]);
  const [baseMath, setBaseMath] = useState({ a: '', b: '', h: '', correct: false });
  const [lateralMath, setLateralMath] = useState(() => getInitialLateralMath(config));
  const [activeLateral, setActiveLateral] = useState(null);
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [finalSum, setFinalSum] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hint State (Red Circle Hand-holding)
  const [hintActive, setHintActive] = useState(false);

  // 3D Engine State
  const [rotX, setRotX] = useState(-0.3);
  const [rotY, setRotY] = useState(-0.5);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [dragDelta, setDragDelta] = useState(0);
  const [hoverFace, setHoverFace] = useState(null);

  useEffect(() => {
    let frameId;
    const animate = () => {
      if (isAutoRotate && !isDragging) {
        setRotY(prev => prev - 0.006);
        setRotX(-0.3 + Math.sin(Date.now() / 1500) * 0.15);
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRotate, isDragging]);

  const project3D = useCallback((x, y, z) => {
    let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
    let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
    let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
    let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
    const scale = 40; const fov = 400;
    const projScale = fov / (fov + z2 * scale);
    return { x: 200 + x1 * scale * projScale, y: 160 + y2 * scale * projScale, z: z2 };
  }, [rotX, rotY]);

  const handlePointerDown = (e) => { 
    e.target.setPointerCapture(e.pointerId); 
    setIsDragging(true); 
    setIsAutoRotate(false);
    setLastPos({ x: e.clientX, y: e.clientY }); 
    setDragDelta(0); 
  };
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x; const dy = e.clientY - lastPos.y;
    setRotY(prev => prev + dx * 0.01); setRotX(prev => prev - dy * 0.01);
    setLastPos({ x: e.clientX, y: e.clientY }); setDragDelta(prev => prev + Math.abs(dx) + Math.abs(dy));
  };
  const handlePointerUp = (e) => { setIsDragging(false); e.target.releasePointerCapture(e.pointerId); };

  const handleStepChange = (newStep) => {
    setStep(newStep);
    setErrorMsg('');
    setIsUnfolded(false);
    setHintActive(false);
  };

  const resetApp = () => {
    setStep(0); setSelectedBases([]); setBaseMath({ a: '', b: '', h: '', correct: false });
    setLateralMath(getInitialLateralMath(config));
    setActiveLateral(null); setIsUnfolded(false); setFinalSum(''); setIsFinished(false); setErrorMsg('');
    setRotX(-0.3); setRotY(-0.5); setIsAutoRotate(true); setHintActive(false);
  };

  const handleShapeChange = (type) => { 
    const newConfig = PRISM_CONFIGS[type];
    setPrismType(type); setStep(0); setSelectedBases([]); setBaseMath({ a: '', b: '', h: '', correct: false });
    setLateralMath(getInitialLateralMath(newConfig));
    setActiveLateral(null); setIsUnfolded(false); setFinalSum(''); setIsFinished(false); setErrorMsg('');
    setRotX(-0.3); setRotY(-0.5); setIsAutoRotate(true); setHintActive(false);
  };

  const handleFaceClick = (id, expected) => {
    if (dragDelta > 5) return; 
    setErrorMsg('');
    setIsAutoRotate(false);
    setHintActive(false); 
    if (step === 1) {
      if (expected !== 'base') { setErrorMsg('This is a lateral face! Bases should be identical "twins". / 呢個係側面！底面應該係兩個形狀大小完全一樣嘅「孖生兄弟」喎。'); return; }
      if (!selectedBases.includes(id)) {
        const newSelected = [...selectedBases, id];
        setSelectedBases(newSelected);
        if (newSelected.length === 2) setTimeout(() => handleStepChange(2), 1500);
      }
    } else if (step === 3) { 
      if (expected === 'lateral' && lateralMath[id] && !lateralMath[id].done) {
        setActiveLateral(id);
      }
    }
  };

  const handleBaseInput = (field, val) => {
    const newMath = { ...baseMath, [field]: val };
    setBaseMath(newMath); setErrorMsg(''); setHintActive(false);
    
    if (prismType === '3') {
      if ((parseInt(newMath.b) === 3 && parseInt(newMath.h) === 4) || (parseInt(newMath.b) === 4 && parseInt(newMath.h) === 3)) {
        setTimeout(() => { setBaseMath({ ...newMath, correct: true }); setTimeout(() => handleStepChange(3), 1000); }, 300);
      }
    } else if (prismType === '4') {
      const a = parseInt(newMath.a); const b = parseInt(newMath.b); const h = parseInt(newMath.h);
      if ( ((a===2 && b===5) || (a===5 && b===2)) && h===4 ) {
        setTimeout(() => { setBaseMath({ ...newMath, correct: true }); setTimeout(() => handleStepChange(3), 1000); }, 300);
      }
    } else if (prismType === '5') {
      if (parseInt(newMath.b) === 45) {
        setTimeout(() => { setBaseMath({ ...newMath, correct: true }); setTimeout(() => handleStepChange(3), 1000); }, 300);
      }
    }
  };

  const handleLateralInput = (field, val) => {
    const newMath = { l: '', w: '', a: '', done: false, ...(lateralMath[activeLateral] || {}), [field]: val };
    setLateralMath({ ...lateralMath, [activeLateral]: newMath }); setErrorMsg(''); setHintActive(false);
    
    const l = parseInt(newMath.l); const w = parseInt(newMath.w);
    const expectedW = config.faces.find(f => f.id === activeLateral)?.w;
    
    if ((l === config.prismLength && w === expectedW) || (l === expectedW && w === config.prismLength)) {
      setTimeout(() => {
        setLateralMath(prev => ({ ...prev, [activeLateral]: { ...newMath, a: l * w, done: true } }));
        setActiveLateral(null);
      }, 400);
    }
  };

  const checkFinalSum = () => {
    if (parseInt(finalSum) === config.totalSurfaceArea) { setIsFinished(true); setErrorMsg(''); setHintActive(false); }
    else { setErrorMsg('Incorrect total! Add all areas carefully again. / 加錯咗喎，小心加多次所有面積！'); }
  };

  const getFaceFill = (id, expectedType) => {
    if (step === 1) {
      if (expectedType === 'base') return selectedBases.includes(id) ? '#FCD34D' : (hoverFace === id ? '#fef08a' : 'transparent');
      return hoverFace === id ? 'rgba(226, 232, 240, 0.4)' : 'rgba(248, 250, 252, 0.4)';
    } else if (step >= 3) {
      if (expectedType === 'base') return 'rgba(252, 211, 77, 0.5)';
      const faceDef = config.faces.find(f => f.id === id);
      if (faceDef && COLORS[faceDef.color]) {
        const c = COLORS[faceDef.color];
        if (lateralMath[id]?.done) return c.done;
        if (activeLateral === id) return c.active;
        if (hoverFace === id) return c.hover;
        return c.default;
      }
    }
    return expectedType === 'base' ? '#FCD34D' : 'rgba(241, 245, 249, 0.4)';
  };

  const lateralFacesDefs = config.faces.filter(f => f.expected === 'lateral');
  const isAllLateralsDone = lateralFacesDefs.every(f => lateralMath[f.id]?.done);
  
  const activeFaceDef = activeLateral ? config.faces.find(f => f.id === activeLateral) : null;
  const activeColorConfig = activeFaceDef && COLORS[activeFaceDef.color] ? COLORS[activeFaceDef.color] : COLORS.blue;

  // --- Dynamic Hint Text Generator ---
  const getHintText = () => {
    if (step === 1) return "Look at the 3D shape! Click on the face with the pulsing red border. Remember, a prism has two identical bases! \n\n望住個立體圖！用滑鼠點擊有「紅色閃動粗框」嗰塊面。記住，柱體有兩塊一模一樣嘅底面㗎！";
    if (step === 2) {
      if (prismType === '5') return "Look at the pulsing red box below. Check the 'Standard Reference Graph' on the right, find the Given Area (45) and type it in! \n\n睇下下面閃緊紅框嘅空格。去右邊「標準參考圖」搵返對應嘅數值（已知面積 45），然後填入去啦！";
      return "Look at the pulsing red boxes below. Find the matching numbers from the 'Standard Reference Graph' on the right and type them in! \n\n睇下下面閃緊紅框嘅空格。去右邊「標準參考圖」搵返對應嘅數字（例如底同高），然後填入去啦！";
    }
    if (step === 3) {
      if (!activeLateral) return "First, pick a face to calculate! Click the pulsing red item on the Area Checklist. \n\n首先要揀一塊面嚟計！點擊「面積打卡紙」上面閃緊紅框嘅項目啦。";
      return "Now, look at the pulsing red face on the graph. Find its Length (L) and Width (W) and type them into the red boxes below! \n\n依家望住圖上閃緊紅框嗰塊面，去搵返佢對應嘅長度同闊度，填入下面紅色空格度打卡啦！";
    }
    if (step === 4) return "You are almost there! Add up all the area numbers listed above, and type the final Total Surface Area into the pulsing red box! \n\n就快搞掂！用計算機將上面列出嘅所有面積加埋一齊，然後填入閃緊紅框嘅 Total 空格度就大功告成！";
    return "";
  };

  // --- Render 3D Prism ---
  const render3DPrism = () => {
    const proj = {};
    Object.keys(config.vertices).forEach(k => { proj[k] = project3D(...config.vertices[k]); });
    
    // Axis indicator vectors
    const projectAxis = (x, y, z) => {
      let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      return { x: 40 + x1 * 30, y: 280 + y2 * 30 };
    };
    const origin = projectAxis(0, 0, 0);
    const axisX = projectAxis(1.2, 0, 0); 
    const axisY = projectAxis(0, -1.2, 0); 
    const axisZ = projectAxis(0, 0, -1.2); 

    const isFaceFront = (faceId) => {
      const f = config.faces.find(face => face.id === faceId);
      if (!f) return false;
      const p0 = proj[f.pts[0]]; const p1 = proj[f.pts[1]]; const p2 = proj[f.pts[2]];
      return (p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x) < 0; 
    };
    const hiddenEdges = config.edges.filter(e => {
      const adjacentFaces = config.faces.filter(f => f.pts.includes(e.pts[0]) && f.pts.includes(e.pts[1]));
      return adjacentFaces.every(f => !isFaceFront(f.id));
    });
    const sortedFaces = config.faces.map(f => {
      const avgZ = f.pts.reduce((sum, pk) => sum + proj[pk].z, 0) / f.pts.length;
      return { ...f, avgZ };
    }).sort((a, b) => b.avgZ - a.avgZ);

    const drawDimLabel = (p1, p2, textEN, textZH) => {
      const midX = (proj[p1].x + proj[p2].x) / 2; const midY = (proj[p1].y + proj[p2].y) / 2;
      return (
        <g key={`${p1}-${p2}`}>
          <text x={midX} y={midY-7} textAnchor="middle" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" className="font-bold text-xs select-none pointer-events-none">{textEN}</text>
          <text x={midX} y={midY-7} textAnchor="middle" fill="#b45309" className="font-bold text-xs select-none pointer-events-none">{textEN}</text>
          <text x={midX} y={midY+7} textAnchor="middle" fill="white" stroke="white" strokeWidth="4" strokeLinejoin="round" className="font-bold text-xs select-none pointer-events-none">{textZH}</text>
          <text x={midX} y={midY+7} textAnchor="middle" fill="#b45309" className="font-bold text-xs select-none pointer-events-none">{textZH}</text>
        </g>
      );
    };

    return (
      <div className="relative flex justify-center mb-6 bg-slate-100 rounded-xl border border-slate-300 overflow-hidden shadow-inner w-full">
        <div className="absolute top-2 left-2 bg-white/90 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-indigo-600 flex items-center gap-1 z-10 shadow-sm pointer-events-none">
          <MousePointerClick size={14} /> Press & drag to rotate / 撳住拖拽可旋轉
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setIsAutoRotate(!isAutoRotate); }}
          className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 z-10 shadow-md transition-colors cursor-pointer ${isAutoRotate ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-200'}`}
        >
          {isAutoRotate ? <Pause size={14} /> : <Play size={14} />}
          {isAutoRotate ? 'Stop / 停止自動展示' : 'Auto / 自動全方位檢視'}
        </button>

        <svg width="400" height="320" viewBox="0 0 400 320" className="cursor-move touch-none" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          {sortedFaces.map(f => {
            let strokeColor = "#475569";
            let strokeWidth = "2";
            let polyClass = "transition-colors duration-200 cursor-pointer";

            // RED CIRCLE Hint Logic
            if (hintActive) {
              if (step === 1 && f.expected === 'base' && !selectedBases.includes(f.id)) {
                const firstMissingBase = config.faces.find(face => face.expected === 'base' && !selectedBases.includes(face.id));
                if (firstMissingBase && firstMissingBase.id === f.id) {
                  strokeColor = "#EF4444"; strokeWidth = "5"; polyClass += " animate-pulse z-50";
                }
              } else if (step === 3 && activeLateral && f.id === activeLateral) {
                strokeColor = "#EF4444"; strokeWidth = "5"; polyClass += " animate-pulse z-50";
              }
            }

            return (
              <polygon key={f.id} points={f.pts.map(pk => `${proj[pk].x},${proj[pk].y}`).join(' ')} fill={getFaceFill(f.id, f.expected)} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" className={polyClass} onClick={() => handleFaceClick(f.id, f.expected)} onMouseEnter={() => setHoverFace(f.id)} onMouseLeave={() => setHoverFace(null)} />
            );
          })}
          {hiddenEdges.map(e => (
            <line key={`hidden-${e.id}`} x1={proj[e.pts[0]].x} y1={proj[e.pts[0]].y} x2={proj[e.pts[1]].x} y2={proj[e.pts[1]].y} stroke="#475569" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" className="pointer-events-none" />
          ))}
          {config.labels3D.map(l => drawDimLabel(l.p1, l.p2, l.en, l.zh))}
          {Object.keys(proj).map(k => (
            <g key={k}>
              <text x={proj[k].x + (k==='A'||k==='D' ? 0 : 12)} y={proj[k].y + (k==='A'||k==='D' ? -10 : 15)} textAnchor="middle" fill="white" stroke="white" strokeWidth="4" className="font-bold text-lg select-none pointer-events-none">{k}</text>
              <text x={proj[k].x + (k==='A'||k==='D' ? 0 : 12)} y={proj[k].y + (k==='A'||k==='D' ? -10 : 15)} textAnchor="middle" fill="#1e293b" className="font-bold text-lg select-none pointer-events-none">{k}</text>
            </g>
          ))}
          
          {/* 3D Axis Indicator */}
          <g className="pointer-events-none">
            <line x1={origin.x} y1={origin.y} x2={axisX.x} y2={axisX.y} stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow-x)" />
            <line x1={origin.x} y1={origin.y} x2={axisY.x} y2={axisY.y} stroke="#22C55E" strokeWidth="2" markerEnd="url(#arrow-y)" />
            <line x1={origin.x} y1={origin.y} x2={axisZ.x} y2={axisZ.y} stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow-z)" />
            <text x={axisX.x + 8} y={axisX.y + 4} fill="#EF4444" fontSize="12" fontWeight="bold">x</text>
            <text x={axisY.x} y={axisY.y - 8} fill="#22C55E" fontSize="12" fontWeight="bold">y</text>
            <text x={axisZ.x - 8} y={axisZ.y + 8} fill="#3B82F6" fontSize="12" fontWeight="bold">z</text>
          </g>
          <defs>
            <marker id="arrow-x" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" /></marker>
            <marker id="arrow-y" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22C55E" /></marker>
            <marker id="arrow-z" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" /></marker>
          </defs>
        </svg>
      </div>
    );
  };

  // --- Render 2D Net Dynamic ---
  const renderDynamicNet = () => {
    const scale = prismType === '5' ? 18 : 25;
    const totalW = lateralFacesDefs.reduce((sum, f) => sum + f.w, 0) * scale;
    const startX = (500 - totalW) / 2;
    const y = 150;
    const h = config.prismLength * scale;
    let currentX = startX;

    const rects = [];
    const labels = [];

    lateralFacesDefs.forEach((f, index) => {
      const rectX = currentX;
      const rectW = f.w * scale;
      
      // Hint Logic for 2D Net
      let strokeColor = "#475569";
      let strokeWidth = "2";
      let rectClass = "cursor-pointer transition-colors";
      
      if (hintActive) {
        if (!activeLateral && !lateralMath[f.id]?.done) {
          const firstUndoneLat = config.faces.find(face => face.expected === 'lateral' && !lateralMath[face.id]?.done);
          if (firstUndoneLat && firstUndoneLat.id === f.id) {
            strokeColor = "#EF4444"; strokeWidth = "5"; rectClass += " animate-pulse z-50";
          }
        } else if (activeLateral && f.id === activeLateral) {
          strokeColor = "#EF4444"; strokeWidth = "5"; rectClass += " animate-pulse z-50";
        }
      }

      rects.push(
        <g key={f.id}>
          <rect x={rectX} y={y} width={rectW} height={h} fill={getFaceFill(f.id, 'lateral')} stroke={strokeColor} strokeWidth={strokeWidth} className={rectClass} onMouseEnter={() => setHoverFace(f.id)} onMouseLeave={() => setHoverFace(null)} onClick={() => handleFaceClick(f.id, 'lateral')} />
          <text x={rectX + rectW/2} y={y + h/2 - 15} textAnchor="middle" fill={lateralMath[f.id]?.done ? "white" : "#475569"} className="text-xs md:text-sm font-bold pointer-events-none">{f.nameEN}</text>
          <text x={rectX + rectW/2} y={y + h/2 + 5} textAnchor="middle" fill={lateralMath[f.id]?.done ? "white" : "#475569"} className="text-[10px] md:text-xs font-bold pointer-events-none">{f.nameZH} {f.label}</text>
          <text x={rectX + rectW/2} y={y + h/2 + 25} textAnchor="middle" fill={lateralMath[f.id]?.done ? "white" : "#1e293b"} className="text-[10px] font-bold bg-white/50 px-1 rounded pointer-events-none">W:{f.w}</text>
        </g>
      );

      labels.push(
        <text key={`tl-${index}`} x={rectX} y={y - 8} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">{f.topPts[0]}</text>
      );
      labels.push(
        <text key={`bl-${index}`} x={rectX} y={y + h + 16} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">{f.botPts[0]}</text>
      );

      if (index === lateralFacesDefs.length - 1) {
        labels.push(
          <text key={`tr-${index}`} x={rectX + rectW} y={y - 8} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">{f.topPts[1]}</text>,
          <text key={`br-${index}`} x={rectX + rectW} y={y + h + 16} textAnchor="middle" fill="#1e293b" className="font-bold text-sm pointer-events-none">{f.botPts[1]}</text>
        );
      }
      currentX += rectW;
    });

    return (
      <svg width="100%" height="450" viewBox="0 0 500 450" className="max-w-md mx-auto drop-shadow-md animate-fade-in">
        {config.renderNetBases(startX, scale, y, h)}
        {rects}
        {labels}
        <text x="250" y={y + h + 45} textAnchor="middle" fill="#475569" className="text-sm font-bold">Length / 柱高 = {config.prismLength} cm</text>
        <line x1={startX} y1={y + h + 30} x2={startX+totalW} y2={y + h + 30} stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)"/>
      </svg>
    );
  };

  const renderDynamicBonus = () => {
    const totalW = lateralFacesDefs.reduce((s,f) => s+f.w, 0);
    const bonusScale = 220 / totalW; 
    let bx = 30;
    
    return (
      <svg width="340" height="150" viewBox="0 0 340 150" className="drop-shadow-sm">
        {lateralFacesDefs.map((f) => {
          const w = f.w * bonusScale;
          const rectX = bx;
          bx += w;
          return (
            <g key={f.id}>
              <rect x={rectX} y={20} width={w} height={80} fill={COLORS[f.color].done} stroke="#1e293b" strokeWidth="2" />
              <text x={rectX + w/2} y={55} textAnchor="middle" fill="white" className="font-bold text-[10px] sm:text-xs pointer-events-none">{f.nameEN.split(' ')[0]} {f.nameEN.split(' ')[1]}</text>
              <text x={rectX + w/2} y={75} textAnchor="middle" fill="white" className="font-bold text-[10px] sm:text-xs pointer-events-none">{f.nameZH.slice(0,3)}({f.w})</text>
            </g>
          )
        })}
        <path d={`M 30 110 Q 30 125 ${30 + 110} 125 T ${30 + 220} 110`} fill="none" stroke="#b45309" strokeWidth="2" />
        <text x={30 + 110} y={145} textAnchor="middle" fill="#b45309" className="text-[10px] sm:text-xs font-bold pointer-events-none">Width = Base Perimeter / 底周界 ({totalW})</text>
        
        <text x={290} y={55} textAnchor="middle" fill="#475569" className="text-xs font-bold pointer-events-none">Height</text>
        <text x={290} y={75} textAnchor="middle" fill="#475569" className="text-xs font-bold pointer-events-none">柱高={config.prismLength}</text>
        <line x1={255} y1={20} x2={265} y2={20} stroke="#475569" strokeWidth="1" />
        <line x1={255} y1={100} x2={265} y2={100} stroke="#475569" strokeWidth="1" />
        <line x1={260} y1={20} x2={260} y2={100} stroke="#475569" strokeWidth="1" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header & Shape Selector */}
        <div className="bg-indigo-600 text-white p-4 md:p-6 flex flex-col items-center gap-4">
          <div className="flex w-full justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <Box size={28} className="hidden sm:block" />
              <span>Prism Unboxer <span className="text-indigo-200">柱體解剖室</span></span>
            </h1>
            <button onClick={resetApp} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg transition-colors text-sm font-bold">
              <RotateCcw size={18} /> 
              <div className="flex flex-col items-start text-left">
                <span>Reset</span>
                <span className="text-[10px] font-normal">重設</span>
              </div>
            </button>
          </div>
          
          <div className="w-full bg-indigo-800/50 p-2 rounded-xl flex flex-col md:flex-row items-center justify-center gap-2">
            <span className="text-sm font-bold text-indigo-200 text-center">Choose Shape<br/><span className="text-xs">轉換形狀:</span></span>
            <div className="flex gap-2 flex-wrap justify-center">
              {[ {id: '3', labelEN: 'Triangular (3)', labelZH: '三角柱體'}, {id: '4', labelEN: 'Trapezoidal (4)', labelZH: '梯形柱體'}, {id: '5', labelEN: 'Pentagonal (5)', labelZH: '五角柱體'} ].map(s => {
                const IconComp = PRISM_CONFIGS[s.id].icon;
                return (
                  <button key={s.id} onClick={() => handleShapeChange(s.id)} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${prismType === s.id ? 'bg-white text-indigo-700 shadow-md transform scale-105' : 'bg-indigo-500/50 hover:bg-indigo-400 text-indigo-100'}`}>
                    <IconComp size={18} /> 
                    <div className="flex flex-col items-start text-left">
                      <span>{s.labelEN}</span>
                      <span className="text-[10px] font-normal">{s.labelZH}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Navigation Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-2 py-3 flex flex-wrap justify-center gap-2">
          {[
            { s: 0, labelEN: 'Intro', labelZH: '簡介' }, { s: 1, labelEN: 'Bases', labelZH: '搵底面' }, 
            { s: 2, labelEN: 'Calc Base', labelZH: '計底面' }, { s: 3, labelEN: 'Lateral', labelZH: '拆側面' }, 
            { s: 4, labelEN: 'Final', labelZH: '大結算' }
          ].map(tab => (
            <button key={tab.s} onClick={() => handleStepChange(tab.s)} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm transition-all duration-300 flex flex-col items-center ${ step === tab.s ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300' }`}>
              <span>{tab.labelEN}</span><span className={step === tab.s ? 'text-indigo-200 text-[10px] md:text-xs' : 'text-slate-400 text-[10px] md:text-xs'}>{tab.labelZH}</span>
            </button>
          ))}
        </div>

        <div className="p-4 md:p-8">
          
          {/* Step 0: Intro */}
          {step === 0 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-center text-indigo-800">Lesson 1: Don't get mixed up!<br/>第一課：千萬唔好搞錯！</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 flex flex-col items-center text-center">
                  <Droplets size={64} className="text-blue-500 mb-4" />
                  <h3 className="text-xl font-bold text-blue-700 mb-2">Volume <br/><span className="text-blue-500">體積</span></h3>
                  <p className="text-slate-600 mb-2">Volume measures <strong>how much space is inside</strong> the 3D shape.</p>
                  <p className="text-slate-600 mb-4">Volume 係計個立體圖形<strong>入面裝到幾多嘢</strong>。</p>
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Imagine: Filling it with water<br/>想像：用水注滿整個柱體</div>
                </div>
                <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200 flex flex-col items-center text-center">
                  <Paintbrush size={64} className="text-amber-500 mb-4" />
                  <h3 className="text-xl font-bold text-amber-700 mb-2">Total Surface Area (TSA)<br/><span className="text-amber-500">表面面積</span></h3>
                  <p className="text-slate-600 mb-2">TSA measures the <strong>total area of all outside faces</strong> combined.</p>
                  <p className="text-slate-600 mb-4">TSA 係計個圖形<strong>所有外圍表面</strong>加埋有幾大。</p>
                  <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">Imagine: Painting every face<br/>想像：用油漆油滿柱體每一面</div>
                </div>
              </div>
              <div className="flex justify-center mt-8">
                <button onClick={() => handleStepChange(1)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg md:text-xl font-bold shadow-lg flex flex-col items-center gap-1 transition-transform hover:scale-105">
                  <span className="flex items-center gap-2">Got it, let's unbox! <ArrowRight size={20} /></span>
                  <span className="text-indigo-200 text-sm">明白，開始解剖！</span>
                </button>
              </div>
            </div>
          )}

          {step > 0 && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 w-full space-y-6">
                
                {/* Instruction Banners */}
                {step === 1 && (
                  <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-amber-800 text-lg flex items-center gap-2"><Paintbrush size={24}/> Step 1: Find the "Twin Bases" / 第一步：尋找「孖生兄弟」(底面)</h3>
                    <p className="text-amber-700 mt-1 text-sm md:text-base">A prism always has two identical and parallel "Bases". Use the <strong>yellow paint</strong> to click on the two bases on the 3D model!<br/>柱體一定有兩個形狀、大小完全一樣嘅「底面」。用<strong>黃色油漆</strong>喺立體圖上面點擊嗰兩塊底面！</p>
                    <button onClick={() => setHintActive(true)} className="mt-3 text-xs md:text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors border border-red-200">
                      <span className="flex items-center gap-1">🆘 Stuck? Show me! / 唔識？手把手教我！</span>
                    </button>
                  </div>
                )}
                {step === 2 && (
                  <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-amber-800 text-lg">Step 2: Calculate Base Area / 第二步：計算底面面積</h3>
                    <p className="text-amber-700 mt-1 text-sm md:text-base">Calculate the area of the base. Check the formula and enter the values based on the reference graph!<br/>對照參考圖，輸入正確數值，系統會自動計出面積！</p>
                    <button onClick={() => setHintActive(true)} className="mt-3 text-xs md:text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors border border-red-200">
                      <span className="flex items-center gap-1">🆘 Stuck? Show me! / 唔識？手把手教我！</span>
                    </button>
                  </div>
                )}
                {step === 3 && (
                  <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2"><Box size={24} /> Step 3: Unfold Lateral Faces / 第三步：攤平紙盒 (側面)</h3>
                    <p className="text-blue-700 mt-1 text-sm md:text-base font-bold">Click the items on the checklist or unfold the shape, then enter the dimensions to check them off!<br/>點擊左邊「打卡紙」項目，或者將圖形攤平，逐塊輸入長闊自動打卡！</p>
                    <button onClick={() => setHintActive(true)} className="mt-3 text-xs md:text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors border border-red-200">
                      <span className="flex items-center gap-1">🆘 Stuck? Show me! / 唔識？手把手教我！</span>
                    </button>
                  </div>
                )}
                {step === 4 && !isFinished && (
                  <div className="bg-indigo-100 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                    <h3 className="font-bold text-indigo-800 text-lg flex items-center gap-2">Step 4: Final Sum / 第四步：大結算</h3>
                    <p className="text-indigo-700 mt-1 text-sm md:text-base font-bold">Add everything up! / 將所有面積加埋一齊！</p>
                    <button onClick={() => setHintActive(true)} className="mt-3 text-xs md:text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-colors border border-red-200">
                      <span className="flex items-center gap-1">🆘 Stuck? Show me! / 唔識？手把手教我！</span>
                    </button>
                  </div>
                )}

                {/* Hand-holding Hint Box */}
                {hintActive && (
                  <div className="bg-red-50 border-2 border-red-400 p-4 rounded-xl shadow-md animate-fade-in flex items-start gap-3">
                    <Sparkles className="text-red-500 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-red-800 text-sm md:text-base mb-1">Teacher's Hint / 導師提示：</h4>
                      <p className="text-red-700 text-xs md:text-sm whitespace-pre-line leading-relaxed">{getHintText()}</p>
                    </div>
                  </div>
                )}

                {errorMsg && <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2 font-semibold text-sm md:text-base"><AlertCircle size={20}/> {errorMsg}</div>}

                {/* Step 1 Interactive */}
                {step === 1 && (
                  <div className="animate-fade-in flex flex-col items-center">
                    {render3DPrism()}
                    <div className="flex gap-4 justify-center items-center flex-wrap">
                      <span className="font-bold text-slate-500 flex flex-col items-end text-right">
                        <span>Found Bases</span>
                        <span className="text-xs">已找出嘅底面：</span>
                      </span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors ${selectedBases.length >= 1 ? 'bg-amber-500' : 'bg-slate-300'}`}>1</div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors ${selectedBases.length >= 2 ? 'bg-amber-500' : 'bg-slate-300'}`}>2</div>
                    </div>
                  </div>
                )}

                {/* Step 2 Interactive */}
                {step === 2 && (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 my-4 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200 w-full max-w-sm">
                      <h4 className="font-bold mb-4 text-slate-700 text-center border-b pb-2 text-sm md:text-base">
                        Area of ONE Base<br/>單塊底面面積<br/>
                        <span className="text-amber-600">{config.step2FormulaEN}</span><br/>
                        <span className="text-amber-600 text-xs">{config.step2FormulaZH}</span>
                      </h4>
                      {!baseMath.correct ? (
                        <div className="flex flex-col gap-4">
                          {prismType === '5' ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <input type="number" className={`w-24 p-2 border-2 rounded text-center text-xl outline-none transition-all ${hintActive && !baseMath.b ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-slate-300 focus:border-amber-500'}`} placeholder="Area / 面積" value={baseMath.b} onChange={(e) => handleBaseInput('b', e.target.value)} />
                              <p className="text-center text-xs text-slate-400 mt-2">💡 Enter the Given Area (45) / 輸入已知面積</p>
                            </div>
                          ) : prismType === '4' ? (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="flex flex-wrap items-center justify-center gap-2 text-lg md:text-xl">
                                (
                                <input type="number" className={`w-12 md:w-16 p-1 md:p-2 border-2 rounded text-center outline-none transition-all ${hintActive && !baseMath.a ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-slate-300 focus:border-amber-500'}`} placeholder="Top/上底" value={baseMath.a} onChange={(e) => handleBaseInput('a', e.target.value)} />
                                +
                                <input type="number" className={`w-12 md:w-16 p-1 md:p-2 border-2 rounded text-center outline-none transition-all ${hintActive && baseMath.a && !baseMath.b ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-slate-300 focus:border-amber-500'}`} placeholder="Bot/下底" value={baseMath.b} onChange={(e) => handleBaseInput('b', e.target.value)} />
                                ) ×
                                <input type="number" className={`w-12 md:w-16 p-1 md:p-2 border-2 rounded text-center outline-none transition-all ${hintActive && baseMath.a && baseMath.b && !baseMath.h ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-slate-300 focus:border-amber-500'}`} placeholder="H/高" value={baseMath.h} onChange={(e) => handleBaseInput('h', e.target.value)} />
                                ÷ 2
                              </div>
                              <p className="text-center text-xs text-slate-400 mt-2">💡 Enter numbers to auto-calculate / 入齊數字自動計</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2">
                              <div className="flex flex-wrap items-center justify-center gap-2 text-lg md:text-xl">
                                (
                                <input type="number" className={`w-20 p-2 border-2 rounded text-center outline-none transition-all ${hintActive && !baseMath.b ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-slate-300 focus:border-amber-500'}`} placeholder="Base/底" value={baseMath.b} onChange={(e) => handleBaseInput('b', e.target.value)} />
                                ×
                                <input type="number" className={`w-20 p-2 border-2 rounded text-center outline-none transition-all ${hintActive && baseMath.b && !baseMath.h ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-slate-300 focus:border-amber-500'}`} placeholder="Height/高" value={baseMath.h} onChange={(e) => handleBaseInput('h', e.target.value)} />
                                ) ÷ 2
                              </div>
                              <p className="text-center text-xs text-slate-400 mt-2">💡 Enter numbers to auto-calculate / 入齊數字自動計</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 text-center animate-fade-in">
                          <p className="flex flex-col justify-center items-center gap-1 text-green-600 font-bold bg-green-50 p-2 rounded text-sm md:text-base">
                            <span className="flex items-center gap-2"><CheckCircle2 size={18}/> Area of ONE Base / 單塊面積</span>
                            <span>= {config.baseArea} cm²</span>
                          </p>
                          <div className="bg-amber-100 p-4 rounded-xl border border-amber-300">
                            <p className="font-bold text-amber-800 text-xs md:text-sm">Total area of TWO bases<br/>兩個底面總和：</p>
                            <p className="text-2xl md:text-3xl font-black text-amber-600 mt-1">{config.baseArea} × 2 = {config.totalBaseArea} cm²</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3 Interactive */}
                {step === 3 && (
                  <div className="animate-fade-in space-y-6">
                    <div className="grid md:grid-cols-3 gap-6 items-start">
                      {/* Checklist */}
                      <div className="bg-white p-4 md:p-5 rounded-xl shadow-lg border border-slate-200 md:col-span-1 order-2 md:order-1">
                        <h4 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2 text-center">Area Checklist<br/><span className="text-sm text-slate-500">面積打卡紙</span></h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex justify-between items-center bg-amber-50 p-3 rounded-lg font-bold text-amber-700">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1"><CheckCircle2 className="text-amber-500" size={16}/> Total Base</span>
                              <span className="text-[10px] text-amber-500 ml-5">底面總和</span>
                            </div>
                            <span>{config.totalBaseArea} cm²</span>
                          </li>
                          {lateralFacesDefs.map(f => {
                            const cTheme = COLORS[f.color] || COLORS.blue;
                            const isDone = lateralMath[f.id]?.done;
                            const isActive = activeLateral === f.id;
                            const isHintTarget = hintActive && !activeLateral && f.id === lateralFacesDefs.find(face => !lateralMath[face.id]?.done)?.id;
                            
                            return (
                              <li key={f.id} onClick={() => { if(!isDone) { setActiveLateral(f.id); setIsAutoRotate(false); setErrorMsg(''); setHintActive(false); } }} onMouseEnter={() => setHoverFace(f.id)} onMouseLeave={() => setHoverFace(null)} className={`flex justify-between items-center p-3 rounded-lg font-bold transition-all cursor-pointer ${ isDone ? cTheme.bgDone : isActive ? cTheme.bgActive : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:border-slate-300' } ${isHintTarget ? 'ring-4 ring-red-500 border-transparent animate-pulse' : ''}`}>
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-1">
                                    {isDone ? <CheckCircle2 className={cTheme.iconDone} size={16}/> : <div className={`w-4 h-4 rounded-full border-2 ${isActive ? cTheme.iconBorder : 'border-slate-300'}`}/>} 
                                    {f.nameEN}
                                  </span>
                                  <span className={`text-[10px] ml-5 ${isDone ? cTheme.iconDone : 'text-slate-400'}`}>({f.nameZH} {f.label})</span>
                                </div>
                                {isDone && <span>{config.prismLength * f.w} cm²</span>}
                              </li>
                            );
                          })}
                        </ul>
                        {isAllLateralsDone && (
                          <button onClick={() => handleStepChange(4)} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 animate-bounce text-sm">
                            <span className="flex items-center gap-2">All done! Go to Final Sum <ArrowRight size={16} /></span>
                            <span className="text-indigo-200 text-xs">全部計完！進入結算</span>
                          </button>
                        )}
                      </div>

                      {/* Graphics Area */}
                      <div className="md:col-span-2 flex flex-col items-center order-1 md:order-2">
                        <div className="mb-4 w-full flex justify-center">
                          <button onClick={() => { setIsUnfolded(!isUnfolded); setActiveLateral(null); setErrorMsg(''); setHintActive(false); }} className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105 text-sm ${isUnfolded ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-300'}`}>
                            {isUnfolded ? <Box size={18} className="text-amber-500"/> : <Map size={18} className="text-indigo-500"/>} 
                            <div className="flex flex-col items-start text-left">
                              <span>{isUnfolded ? 'Fold to 3D' : 'Unfold to 2D'}</span>
                              <span className="text-[10px] font-normal">{isUnfolded ? '收合做立體圖' : '展開做平面圖'}</span>
                            </div>
                          </button>
                        </div>
                        
                        {!isUnfolded ? render3DPrism() : renderDynamicNet()}

                        {activeLateral && lateralMath[activeLateral] && !lateralMath[activeLateral].done && (
                          <div className={`mt-4 bg-white p-4 md:p-5 rounded-xl shadow-xl border-2 ${activeColorConfig.boxBorder} animate-slide-up w-full max-w-md mx-auto`}>
                            <h4 className={`font-bold ${activeColorConfig.boxText} mb-3 text-center border-b pb-2 text-sm md:text-base`}>
                              Calculate Area for / 計算面積：<br/>
                              <span className="text-xs font-normal">
                                {activeFaceDef?.nameEN} ({activeFaceDef?.nameZH} {activeFaceDef?.label})
                              </span>
                            </h4>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-lg md:text-xl">
                              <input type="number" className={`w-16 md:w-20 p-1 md:p-2 border-2 rounded text-center outline-none transition-all ${hintActive && !lateralMath[activeLateral]?.l ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : `border-slate-300 ${activeColorConfig.inputFocus}`}`} placeholder="L / 長" value={lateralMath[activeLateral]?.l || ''} onChange={(e) => handleLateralInput('l', e.target.value)} />
                              <span className="font-bold text-slate-400">×</span>
                              <input type="number" className={`w-16 md:w-20 p-1 md:p-2 border-2 rounded text-center outline-none transition-all ${hintActive && lateralMath[activeLateral]?.l && !lateralMath[activeLateral]?.w ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : `border-slate-300 ${activeColorConfig.inputFocus}`}`} placeholder="W / 闊" value={lateralMath[activeLateral]?.w || ''} onChange={(e) => handleLateralInput('w', e.target.value)} />
                              <span className="font-bold text-slate-400">=</span>
                              <div className="w-20 md:w-24 p-1 md:p-2 border-2 border-dashed border-slate-200 rounded text-center font-bold text-slate-400 bg-slate-50">
                                {(lateralMath[activeLateral]?.l && lateralMath[activeLateral]?.w) ? (parseInt(lateralMath[activeLateral].l) * parseInt(lateralMath[activeLateral].w) || '?') : '?'}
                              </div>
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-3">💡 Auto-checks when correct / 輸入正確「長闊」即自動打卡</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✨ BONUS SECTION ✨ */}
                    {isAllLateralsDone && (
                      <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 p-4 md:p-6 rounded-2xl border-2 border-orange-300 shadow-lg animate-slide-up w-full mx-auto">
                        <h3 className="text-lg md:text-xl font-bold text-orange-800 mb-2 flex items-center justify-center gap-2 text-center">
                          <Lightbulb className="text-orange-500 hidden md:block" size={24} /> 
                          <div className="flex flex-col">
                            <span>Ultimate Trick: One Formula for Lateral Area!</span>
                            <span className="text-sm">終極秘技：一條式計曬側面面積！</span>
                          </div>
                        </h3>
                        <p className="text-orange-700 font-bold mb-6 text-center text-sm md:text-base">
                          Combine all lateral faces into a <strong className="text-orange-900 bg-orange-200 px-1 rounded">"Big Rectangle"</strong>!<br/>
                          將所有側面拼埋一齊，其實係一個「大長方形」！
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4">
                          <div className="w-full flex justify-center">
                            {renderDynamicBonus()}
                          </div>

                          <div className="bg-white p-4 md:p-5 rounded-xl shadow border border-orange-200 text-center w-full max-w-[320px]">
                            <p className="text-sm font-bold text-slate-800">
                              Total Lateral Area = <br/><span className="text-amber-600">Base Perimeter</span> × <span className="text-slate-600">Prism Height</span><br/>
                              <span className="text-xs font-normal text-slate-500">總側面面積 = 底周界 × 柱高</span>
                            </p>
                            <p className="text-xl md:text-2xl font-black text-slate-800 mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                              ({lateralFacesDefs.map(f=>f.w).join('+')}) × {config.prismLength} = <span className="text-green-600">{lateralFacesDefs.reduce((s,f)=>s+f.w,0) * config.prismLength} cm²</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2">Much faster! / 快過逐塊計好多倍！</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4 Final */}
                {step === 4 && (
                  <div className="animate-fade-in text-center max-w-2xl mx-auto">
                    {!isFinished ? (
                      <div className="bg-indigo-100 border-t-4 border-indigo-500 p-4 md:p-6 rounded-b-xl shadow-md">
                        <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-2">Final Showdown / 終極大結算</h2>
                        <p className="text-indigo-700 text-sm md:text-base mb-6">Add up all the calculated areas to get the Total Surface Area!<br/>將所有計好嘅面積加埋一齊，就會得出 Total Surface Area！</p>
                        
                        <div className="text-base md:text-xl font-bold font-mono bg-white p-4 md:p-6 rounded-lg border-2 border-indigo-200 inline-block shadow-inner mb-6 text-left w-full max-w-md">
                          <div className="flex justify-between items-center gap-4 text-amber-600 mb-2">
                            <div className="flex flex-col"><span className="text-sm font-bold">Total Base</span><span className="text-xs">底面總和</span></div>
                            <span>{config.totalBaseArea}</span>
                          </div>
                          {lateralFacesDefs.map(f => {
                            const cText = COLORS[f.color] ? COLORS[f.color].iconDone : 'text-slate-500';
                            return (
                              <div key={f.id} className={`flex justify-between items-center gap-4 ${cText} mb-2`}>
                                <div className="flex flex-col"><span className="text-sm font-bold">{f.nameEN}</span><span className="text-xs">{f.nameZH} ({f.label})</span></div>
                                <span>{f.w * config.prismLength}</span>
                              </div>
                            )
                          })}
                          <div className="flex justify-between items-center gap-4 text-slate-800 mt-4 border-t-2 border-slate-300 pt-4">
                            <div className="flex flex-col"><span className="text-sm font-bold">Total</span><span className="text-xs">總和</span></div>
                            <input type="number" className={`w-20 md:w-24 p-2 border-4 rounded-lg text-center outline-none transition-all ${hintActive ? 'ring-4 ring-red-500 border-red-500 animate-pulse' : 'border-indigo-400 focus:border-indigo-600'}`} value={finalSum} onChange={(e) => { setFinalSum(e.target.value); setHintActive(false); setErrorMsg(''); }} />
                          </div>
                        </div>
                        <button onClick={checkFinalSum} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg md:text-xl font-bold shadow-xl w-full transition-transform hover:scale-105 flex flex-col items-center">
                          <span>Submit Answer!</span><span className="text-indigo-200 text-sm">提交答案！</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-6 md:p-8 rounded-2xl border-4 border-green-400 shadow-2xl animate-bounce-short">
                        <PartyPopper size={60} className="text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">Congratulations! Perfect!<br/>恭喜你！完全正確！</h2>
                        <div className="text-base md:text-lg text-green-700 mb-8 max-w-md mx-auto text-left bg-white p-4 rounded-lg shadow-inner">
                          <p className="text-center mb-4">Total Surface Area / 總表面面積 = <strong className="text-2xl text-green-600">{config.totalSurfaceArea} cm²</strong></p>
                          <p className="font-bold text-sm text-green-800 mb-2 border-b border-green-200 pb-1">Remember 2 secrets: / 記住兩大秘訣：</p>
                          <p className="text-sm mb-1">1. Find "twins" for bases (multiply by 2)<br/><span className="text-xs text-green-600 ml-4">搵「孖生兄弟」計底面 (要乘 2)</span></p>
                          <p className="text-sm">2. Lateral Area = Base Perimeter × Prism Height<br/><span className="text-xs text-green-600 ml-4">側面可以「一條式過」: 底周界 × 柱高</span></p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <button onClick={resetApp} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg flex flex-col items-center justify-center">
                            <span>Try Again</span><span className="text-green-200 text-xs">重新挑戰一次</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* The Stable Reference Graphic (Right Sidebar on Desktop) */}
              <div className="w-full lg:w-auto flex justify-center lg:pt-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center w-full max-w-[280px]">
                  <span className="text-xs font-bold text-slate-500 mb-3 tracking-wider text-center uppercase">
                    📌 Standard Reference Graph<br/>標準參考圖
                  </span>
                  {config.renderStatic()}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}