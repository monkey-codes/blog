import type { Experience } from "../lib/types";
import ExperienceCard from "./ExperienceCard";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({
  experiences,
}: ExperienceSectionProps) {
  return (
    <section id="experience" className="mx-auto max-w-3xl px-6 py-14">
      <h2 className="mb-10 text-3xl font-bold tracking-tight">Experience</h2>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </div>
    </section>
  );
}
