import { useState } from "react";
import { useResumeData } from "./hooks/useResumeData";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import ExperienceSection from "./components/ExperienceSection";
import SkillsSection from "./components/SkillsSection";
import FitCheck from "./components/FitCheck";
import Footer from "./components/Footer";
import ChatDrawer from "./components/ChatDrawer";

export default function App() {
  const { profile, experiences, skills, faqResponses, loading, error } =
    useResumeData();
  const [chatOpen, setChatOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
        <p className="text-text-muted">
          {error ? error.message : "Failed to load profile."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Nav name={profile.full_name} onChatOpen={() => setChatOpen(true)} />

      <Hero
        profile={profile}
        experiences={experiences}
        onChatOpen={() => setChatOpen(true)}
      />

      <ExperienceSection experiences={experiences} />

      <SkillsSection skills={skills} />

      <FitCheck />

      <Footer profile={profile} />

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        faqResponses={faqResponses}
      />
    </div>
  );
}
