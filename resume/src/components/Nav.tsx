interface NavProps {
  name: string;
  onChatOpen: () => void;
}

export default function Nav({ name, onChatOpen }: NavProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a
          href="/resume/index.html"
          className="font-mono text-lg font-bold tracking-tight text-text-primary no-underline"
        >
          {initials}
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#experience"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary no-underline"
          >
            Experience
          </a>
          <a
            href="#fit-check"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary no-underline"
          >
            Fit Check
          </a>
          <button
            onClick={onChatOpen}
            className="rounded-lg bg-cta px-4 py-1.5 text-sm font-medium text-bg-primary transition-colors hover:bg-cta-hover"
          >
            Ask AI
          </button>
        </div>
      </div>
    </nav>
  );
}
