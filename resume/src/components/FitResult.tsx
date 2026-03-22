interface FitResultProps {
  result: {
    verdict: "strong_fit" | "worth_conversation" | "not_your_person";
    summary: string;
    gaps: string[];
    transfers: string[];
    recommendation: string;
  };
}

const verdictConfig = {
  strong_fit: {
    label: "Strong Fit",
    className: "border-cta/30 bg-cta/10 text-cta",
  },
  worth_conversation: {
    label: "Worth a Conversation",
    className: "border-accent/30 bg-accent/10 text-accent",
  },
  not_your_person: {
    label: "Probably Not Your Person",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-400",
  },
};

export default function FitResult({ result }: FitResultProps) {
  const verdict = verdictConfig[result.verdict];

  return (
    <div className="mt-6 space-y-6 rounded-lg border border-border-subtle bg-bg-card p-6">
      {/* Verdict badge */}
      <span
        className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${verdict.className}`}
      >
        {verdict.label}
      </span>

      <p className="text-text-secondary">{result.summary}</p>

      {result.gaps.length > 0 && (
        <div>
          <h4 className="mb-2 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
            Where I Don't Fit
          </h4>
          <ul className="space-y-1">
            {result.gaps.map((gap, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-amber-400">&times;</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.transfers.length > 0 && (
        <div>
          <h4 className="mb-2 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
            What Transfers
          </h4>
          <ul className="space-y-1">
            {result.transfers.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-cta">&check;</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="mb-2 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
          My Recommendation
        </h4>
        <p className="text-sm text-text-secondary">{result.recommendation}</p>
      </div>
    </div>
  );
}
