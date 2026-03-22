import type { CandidateProfile, Experience } from "../lib/types";

interface HeroProps {
  profile: CandidateProfile;
  experiences: Experience[];
  onChatOpen: () => void;
}

export default function Hero({ profile, experiences, onChatOpen }: HeroProps) {
  const companies = [
    ...new Set(experiences.map((e) => e.company_name)),
  ];

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-20 text-center">
      {/* Status badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-card/70 px-4 py-2 backdrop-blur-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cta opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cta" />
        </span>
        <span className="font-mono text-sm text-text-secondary">
          Open to Senior Engineering roles
        </span>
      </div>

      {/* Name */}
      <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
        {profile.full_name}
      </h1>

      {/* Positioning statement */}
      {profile.headline && (
        <p className="mb-8 max-w-2xl text-lg text-text-secondary">
          {profile.headline}
        </p>
      )}

      {/* Company badges */}
      {companies.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {companies.map((company) => (
            <span
              key={company}
              className="rounded-full border border-border-subtle bg-bg-card px-3 py-1 text-sm text-text-muted"
            >
              {company}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onChatOpen}
        className="group flex items-center gap-2 rounded-lg border border-white/15 bg-cta/90 px-6 py-3 text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition-colors hover:bg-cta"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Ask AI About Me
      </button>

      {/* Scroll indicator */}
      <div className="mt-16 animate-bounce text-text-muted">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
