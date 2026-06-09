import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ChaptersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Universal Navigation Bar for MOCs */}
      <div className="bg-slate-800 text-white p-3 flex items-center justify-between shadow-md relative z-50">
        <Link href="/" className="flex items-center gap-2 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors font-semibold">
          <ArrowLeft size={20} />
          Back to Hub
        </Link>
        <div className="font-bold text-lg tracking-wide hidden sm:block">
          S1 Math Modules
        </div>
        <div className="w-24"></div> {/* Spacer to center title */}
      </div>

      {/* Render MDX Content */}
      <div className="max-w-4xl mx-auto py-10 px-6 sm:px-10">
        {children}
      </div>
    </div>
  );
}
