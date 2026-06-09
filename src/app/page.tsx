import Link from "next/link";
import { BookOpen, Calculator, PenTool, LayoutGrid } from "lucide-react";

export default function Home() {
  const topics = [
    {
      id: "algebra",
      title: "Algebra & Linear Equations",
      description: "Master variables and solve equations step-by-step.",
      icon: <Calculator className="w-8 h-8 text-blue-500" />,
      color: "border-blue-200 bg-blue-50",
      apps: [
        { name: "Chapter 4 Syllabus", path: "/chapters/ch4-linear-equations" }
      ]
    },
    {
      id: "geometry",
      title: "Geometry & Angles",
      description: "Visualize and measure angles, lines, and shapes.",
      icon: <PenTool className="w-8 h-8 text-purple-500" />,
      color: "border-purple-200 bg-purple-50",
      apps: [
        { name: "Chapter 11 Syllabus", path: "/chapters/geometry" }
      ]
    },
    {
      id: "triangles",
      title: "Congruent Triangles",
      description: "Prove shapes are exactly the same size and shape.",
      icon: <LayoutGrid className="w-8 h-8 text-green-500" />,
      color: "border-green-200 bg-green-50",
      apps: [
        { name: "Congruence Practice", path: "/topic/congruent-triangles" }
      ]
    },
    {
      id: "ratios",
      title: "Ratios & Proportions",
      description: "Compare quantities and solve proportional problems.",
      icon: <BookOpen className="w-8 h-8 text-amber-500" />,
      color: "border-amber-200 bg-amber-50",
      apps: [
        { name: "Ratio Visualizer Pro", path: "/topic/ratio-visualizer" }
      ]
    },
    {
      id: "3d",
      title: "3D Figures & Prisms",
      description: "Explore areas and volumes of 3-dimensional shapes.",
      icon: <LayoutGrid className="w-8 h-8 text-rose-500" />,
      color: "border-rose-200 bg-rose-50",
      apps: [
        { name: "Prism Unboxer", path: "/topic/prism-unboxer" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Calculator className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">S1 Math Hub</h1>
          </div>
          <div className="text-sm font-medium text-slate-500">Welcome, Student!</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-8">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">Choose Your Topic</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Select a module below to start your interactive learning, practice exercises, or quiz preparation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topics.map((topic) => (
            <div key={topic.id} className={`rounded-3xl border-2 ${topic.color} p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  {topic.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{topic.title}</h3>
              </div>
              <p className="text-slate-600 mb-6">{topic.description}</p>
              
              <div className="space-y-3">
                {topic.apps.map((app, idx) => (
                  <Link href={app.path} key={idx} className="block">
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
                      <span className="font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{app.name}</span>
                      <span className="text-indigo-400 group-hover:text-indigo-600 font-bold">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
