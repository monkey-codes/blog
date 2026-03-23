import type { Skill } from "../lib/types";
import SkillCard from "./SkillCard";

interface SkillsSectionProps {
  skills: Skill[];
}

const categories = [
  {
    key: "strong" as const,
    label: "Strong",
    icon: "\u2713",
    accentClass: "text-cta",
  },
  {
    key: "moderate" as const,
    label: "Moderate",
    icon: "\u25CB",
    accentClass: "text-text-secondary",
  },
  {
    key: "gap" as const,
    label: "Gaps",
    icon: "\u2717",
    accentClass: "text-amber-400",
  },
];

export default function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <h2 className="mb-10 text-3xl font-bold tracking-tight">Skills</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <SkillCard
            key={cat.key}
            label={cat.label}
            icon={cat.icon}
            accentClass={cat.accentClass}
            skills={skills.filter((s) => s.category === cat.key)}
          />
        ))}
      </div>
    </section>
  );
}
