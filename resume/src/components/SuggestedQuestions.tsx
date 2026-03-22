interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({
  questions,
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-text-muted">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-lg border border-border-subtle bg-bg-card px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
