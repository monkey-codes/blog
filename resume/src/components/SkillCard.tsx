import type { Skill } from "../lib/types";

interface SkillCardProps {
  label: string;
  icon: string;
  accentClass: string;
  skills: Skill[];
}

export default function SkillCard({
  label,
  icon,
  accentClass,
  skills,
}: SkillCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-card p-5">
      <h3 className={`mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${accentClass}`}>
        <span>{icon}</span>
        {label}
      </h3>
      <ul className="space-y-2">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-text-secondary">{skill.skill_name}</span>
            {skill.years_experience != null && skill.years_experience > 0 && (
              <span className="font-mono text-xs text-text-muted">
                {skill.years_experience}y
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
