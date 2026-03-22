import type { Experience } from "../lib/types";

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
            <li key={i} className="flex gap-2 text-base text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/40" />
              {point}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
