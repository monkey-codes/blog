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
          className="flex items-center gap-2 no-underline"
        >
          <svg className="h-8 w-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="16" fill="#0f1117" />
            <text x="18" y="70" fontSize="82" fill="#e8943a" fontFamily="monospace" fontWeight="bold">&gt;</text>
            <rect x="60" y="70" width="22" height="6" fill="#e8943a" />
          </svg>
          <span className="font-mono text-lg font-bold tracking-tight text-white">
            {initials}
          </span>
        </a>

        <div className="flex items-center gap-3">
          <a
            href="#fit-check"
            className="rounded-lg border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 no-underline"
          >
            Fit Check
          </a>
          <button
            onClick={onChatOpen}
            className="rounded-lg border border-white/15 bg-cta/90 px-4 py-1.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition-colors hover:bg-cta"
          >
            Ask AI
          </button>
        </div>
      </div>
    </nav>
  );
}
