"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";

// Mapping of topic slugs to the local component file
const appMapping: Record<string, React.ComponentType> = {
  "algebra-sandbox": dynamic(() => import("@/components/apps/algebra_sandbox"), { ssr: false }),
  "algebra-bubble": dynamic(() => import("@/components/apps/algebrabubblecutter"), { ssr: false }),
  "geometry-lab": dynamic(() => import("@/components/apps/geometry_lab"), { ssr: false }),
  "geometry-trainer": dynamic(() => import("@/components/apps/dse_geometry_trainer"), { ssr: false }),
  "geometry-learner": dynamic(() => import("@/components/apps/geometry_learner"), { ssr: false }),
  "congruent-triangles": dynamic(() => import("@/components/apps/congruent_triangles_practice"), { ssr: false }),
  "ratio-visualizer": dynamic(() => import("@/components/apps/ratio_visualizer_pro"), { ssr: false }),
  "prism-unboxer": dynamic(() => import("@/components/apps/prism_unboxer"), { ssr: false }),
};

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const AppComponent = appMapping[id];

  if (!AppComponent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <h1 className="text-3xl font-bold mb-4">Module not found!</h1>
        <p className="mb-6">The requested module "{id}" does not exist.</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md">
          Back to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Universal Navigation Bar for Apps */}
      <div className="bg-slate-800 text-white p-3 flex items-center justify-between shadow-md relative z-50">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Hub
        </button>
        <div className="font-bold text-lg tracking-wide hidden sm:block">
          S1 Math Hub
        </div>
        <div className="w-24"></div> {/* Spacer to center title */}
      </div>

      {/* Render the specific App */}
      <div className="w-full relative isolate" style={{ height: 'calc(100vh - 64px)' }}>
        <AppComponent />
      </div>
    </div>
  );
}
