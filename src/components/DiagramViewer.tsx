"use client";

import { useState } from "react";

type Props = {
  content: string;
};

export function DiagramViewer({ content }: Props) {
  const [showDiagram, setShowDiagram] = useState(false);

  // Extract Mermaid diagrams from content
  const diagrams = content.match(/```mermaid([\s\S]*?)```/g) || [];

  if (diagrams.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setShowDiagram(!showDiagram)}
        className="flex items-center gap-2 text-sm font-semibold text-swiftr-brand hover:underline"
      >
        {showDiagram ? "📊 Hide Diagrams" : "📊 Show Diagrams"} ({diagrams.length})
      </button>
      {showDiagram && (
        <div className="mt-4 space-y-4">
          {diagrams.map((diagram, i) => (
            <div key={i} className="glass-card p-4 overflow-x-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                {diagram.replace(/```mermaid\n?/, "").replace(/```$/, "")}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
