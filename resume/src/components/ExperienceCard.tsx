import { useState } from "react";
import type { Experience } from "../lib/types";
import AiContext from "./AiContext";

interface ExperienceCardProps {
  experience: Experience;
}

function formatDateRange(start: string, end: string | null): string {
  const fmt = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-card p-6 transition-colors hover:border-border-hover">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {experience.company_name}
          </h3>
          <p className="text-sm text-accent">{experience.title}</p>
        </div>
        <span className="shrink-0 font-mono text-sm text-text-muted">
          {formatDateRange(experience.start_date, experience.end_date)}
        </span>
      </div>

      {experience.bullet_points && experience.bullet_points.length > 0 && (
        <ul className="mt-4 space-y-2">
          {experience.bullet_points.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/40" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {/* AI Context toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent"
      >
        <span>{expanded ? "Hide" : "Show"} AI Context</span>
        <svg
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && <AiContext context={{}} />}
    </div>
  );
}
