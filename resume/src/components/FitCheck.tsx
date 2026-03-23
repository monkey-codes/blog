import { useState } from "react";
import FitResult from "./FitResult";
import { analyzeJobFit } from "../lib/api";
import type { FitResult as FitResultType } from "../lib/types";

export default function FitCheck() {
  const [jd, setJd] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FitResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!jd.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeJobFit(jd.trim());
      setResult(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      setAnalyzing(false);
    }
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

      {error && (
        <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {result && <FitResult result={result} />}
    </section>
  );
}
