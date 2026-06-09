import type { MDXComponents } from "mdx/types";
import React from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mt-10 mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold text-indigo-700 mt-8 mb-4 border-b border-indigo-100 pb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold text-slate-700 mt-6 mb-3">{children}</h3>,
    p: ({ children }) => <p className="text-lg text-slate-600 leading-relaxed mb-6">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside text-lg text-slate-600 mb-6 space-y-2">{children}</ul>,
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-indigo-400 bg-indigo-50 px-6 py-4 rounded-r-xl italic text-slate-700 my-6 shadow-sm">
        {children}
      </blockquote>
    ),
    a: (props) => {
      const href = props.href;
      const isInternalLink = href && (href.startsWith('/') || href.startsWith('#'));
      
      // If it's styled like a button (we can check children or just style all links nicely)
      // Actually, standard links:
      return (
        <a 
          href={href} 
          className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline decoration-2 underline-offset-2 transition-colors"
          {...props}
        >
          {props.children}
        </a>
      );
    },
    ...components,
  };
}
