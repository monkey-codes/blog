import { useState } from "react";
import FitResult from "./FitResult";

type FitResultData = {
  verdict: "strong_fit" | "worth_conversation" | "not_your_person";
  summary: string;
  gaps: string[];
  transfers: string[];
  recommendation: string;
};

export default function FitCheck() {
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FitResultData | null>(null);

  async function handleAnalyze() {
    if (!jd.trim()) return;
    setAnalyzing(true);
    setResult(null);

    // TODO: Wire up to AI backend
    // For now, show a placeholder after a brief delay
    await new Promise((r) => setTimeout(r, 1500));
    setResult({
      verdict: "worth_conversation",
      summary:
        "Fit analysis will be powered by AI once the backend is connected. Paste a real job description to get an honest assessment.",
      gaps: ["AI-powered analysis not yet connected"],
      transfers: ["Placeholder for transferable skills"],
      recommendation:
        "Connect the AI backend to enable real fit analysis.",
    });
    setAnalyzing(false);
  }

  return (
    <section id="fit-check" className="mx-auto max-w-3xl px-6 py-14">
      <h2 className="mb-2 text-3xl font-bold tracking-tight">
        Honest Fit Assessment
      </h2>
      <p className="mb-8 text-text-secondary">
        Paste a job description. Get an honest assessment of whether I'm the
        right person—including when I'm not.
      </p>

      <div className="rounded-lg border border-border-subtle bg-bg-card p-6">
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste job description here..."
          rows={8}
          className="w-full resize-none rounded-lg border border-border-subtle bg-bg-primary p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !jd.trim()}
          className="mt-4 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze Fit"}
        </button>
      </div>

      {result && <FitResult result={result} />}
    </section>
  );
}
