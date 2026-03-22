import type { CandidateProfile } from "../lib/types";

const labels = [
  "Professional identity",
  "Scale & technical depth",
  "Unique edge",
  "Reliability & execution",
  "Consulting breadth",
  "How I work",
];

interface ProfileSectionProps {
  profile: CandidateProfile;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  if (!profile.bullet_points || profile.bullet_points.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-10 text-3xl font-bold tracking-tight">Profile</h2>
      <dl className="space-y-6">
        {profile.bullet_points.map((point, i) => (
          <div key={i} className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="w-48 shrink-0 text-sm font-semibold text-accent">
              {labels[i]}
            </dt>
            <dd className="text-text-secondary">{point}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
