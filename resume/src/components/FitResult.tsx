import { useState } from "react";
import type { FitResult as FitResultType } from "../lib/types";

const verdictConfig = {
  strong_fit: {
    label: "Strong Fit",
    badgeClass: "border-cta/30 bg-cta/10 text-cta",
    iconColor: "text-cta",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  worth_conversation: {
    label: "Worth a Conversation",
    badgeClass: "border-accent/30 bg-accent/10 text-accent",
    iconColor: "text-accent",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  probably_not: {
    label: "Probably Not",
    badgeClass: "border-rose-400/30 bg-rose-400/10 text-rose-400",
    iconColor: "text-rose-400",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
};

const INITIAL_STRENGTHS = 4;

export default function FitResult({ result }: { result: FitResultType }) {
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const verdict = verdictConfig[result.verdict];
  const confidencePercent = Math.round(result.confidence * 100);

  const visibleStrengths = showAllStrengths
    ? result.strengths
    : result.strengths.slice(0, INITIAL_STRENGTHS);
  const hiddenCount = result.strengths.length - INITIAL_STRENGTHS;

  return (
    <div className="mt-8 space-y-6">
      {/* Verdict header */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={verdict.iconColor}>{verdict.icon}</span>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${verdict.badgeClass}`}
        >
          {verdict.label}
        </span>
        <span className="text-xs text-text-muted">
          {confidencePercent}% confidence
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-xl font-semibold leading-snug text-text-primary">
        {result.headline}
      </h3>

      {/* Opening narrative */}
      <p className="text-[15px] leading-relaxed text-text-secondary">
        {result.opening}
      </p>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div>
          <h4 className="mb-3 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
            Where I Fit
          </h4>
          <ul className="space-y-3">
            {visibleStrengths.map((s, i) => (
              <li
                key={i}
                className="rounded-lg border-l-2 border-cta/40 bg-bg-card py-2 pl-4 pr-3"
              >
                <span className="text-base font-medium text-text-primary">
                  {s.requirement}
                </span>
                <p className="mt-0.5 text-base text-text-secondary">{s.match}</p>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAllStrengths(!showAllStrengths)}
              className="mt-2 text-sm text-accent hover:text-accent-hover"
            >
              {showAllStrengths
                ? "Show fewer"
                : `Show all ${result.strengths.length} strengths`}
            </button>
          )}
        </div>
      )}

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div>
          <h4 className="mb-3 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
            Where I Don't Fit
          </h4>
          <ul className="space-y-3">
            {result.gaps.map((g, i) => (
              <li
                key={i}
                className="rounded-lg border-l-2 border-rose-400/40 bg-bg-card py-2 pl-4 pr-3"
              >
                <span className="text-base font-medium text-text-primary">
                  {g.gap_title}
                </span>
                <p className="mt-0.5 text-base text-text-secondary">
                  {g.explanation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transfers */}
      {result.transfers && (
        <div className="rounded-lg border-l-2 border-accent/40 bg-accent/5 py-3 pl-4 pr-4">
          <h4 className="mb-2 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
            What Transfers
          </h4>
          <p className="text-base leading-relaxed text-text-secondary">
            {result.transfers}
          </p>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-lg border border-border-subtle bg-bg-card p-5">
        <h4 className="mb-2 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
          The Bottom Line
        </h4>
        <p className="text-base leading-relaxed text-text-secondary">
          {result.recommendation}
        </p>
      </div>
    </div>
  );
}
