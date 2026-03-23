import { useState } from "react";
import type { FaqResponse } from "../lib/types";
import { sendChatMessage } from "../lib/api";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  faqResponses: FaqResponse[];
}

const defaultSuggestions = [
  "What's your biggest weakness?",
  "Tell me about a project that failed",
  "Why did you leave your last role?",
  "What would your last manager say about you?",
];

export default function ChatDrawer({
  open,
  onClose,
  faqResponses,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");

  const suggestions =
    faqResponses.length > 0
      ? faqResponses.slice(0, 4).map((f) => f.question)
      : defaultSuggestions;

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(text.trim(), conversationId);
      setConversationId(response.conversation_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-bg-secondary transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Ask me anything
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted transition-colors hover:text-text-primary"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.length === 0 && (
            <SuggestedQuestions
              questions={suggestions}
              onSelect={sendMessage}
            />
          )}
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-bg-card px-4 py-2.5 text-sm text-text-muted">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border-subtle p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about my experience..."
              className="flex-1 rounded-lg border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
