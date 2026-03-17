import { useState } from "react";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">
            Johan Zietsman
          </h1>
          <a href="/index.html" className="text-sm">
            &larr; Back to blog
          </a>
        </header>

        {/* TODO: Resume content goes here */}
        <section className="rounded-lg bg-bg-card p-6">
          <p className="text-text-secondary">Resume content coming soon.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-hover"
          >
            Open Modal
          </button>
        </section>

        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="mx-4 w-full max-w-lg rounded-lg border border-border-subtle bg-bg-secondary p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  Modal Title
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  &times;
                </button>
              </div>
              <p className="text-text-secondary">Modal content goes here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
