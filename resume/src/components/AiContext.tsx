interface AiContextProps {
  context: {
    situation?: string;
    approach?: string;
    technical_work?: string;
    lessons_learned?: string;
  };
}

export default function AiContext({ context }: AiContextProps) {
  const sections = [
    { label: "SITUATION", value: context.situation },
    { label: "APPROACH", value: context.approach },
    { label: "TECHNICAL WORK", value: context.technical_work },
    { label: "LESSONS LEARNED", value: context.lessons_learned },
  ].filter((s) => s.value);

  if (sections.length === 0) {
    return (
      <div className="mt-4 rounded-lg bg-bg-primary/60 p-4 text-sm text-text-muted italic">
        AI context not yet available for this role.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg bg-bg-primary/60 p-4">
      {sections.map((section) => (
        <div key={section.label}>
          <h4 className="mb-1 font-mono text-xs font-semibold tracking-wider text-text-muted uppercase">
            {section.label}
          </h4>
          <p
            className={`text-sm text-text-secondary ${section.label === "LESSONS LEARNED" ? "italic" : ""}`}
          >
            {section.value}
          </p>
        </div>
      ))}
    </div>
  );
}
