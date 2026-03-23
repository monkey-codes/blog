import { useEffect, useState } from "react";
import {
  fetchCandidateProfile,
  fetchExperiences,
  fetchSkills,
  fetchFaqResponses,
} from "../lib/api";
import type {
  CandidateProfile,
  Experience,
  Skill,
  FaqResponse,
} from "../lib/types";

interface ResumeData {
  profile: CandidateProfile | null;
  experiences: Experience[];
  skills: Skill[];
  faqResponses: FaqResponse[];
  loading: boolean;
  error: Error | null;
}

export function useResumeData(): ResumeData {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [faqResponses, setFaqResponses] = useState<FaqResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, experiencesData, skillsData, faqData] =
          await Promise.all([
            fetchCandidateProfile(),
            fetchExperiences(),
            fetchSkills(),
            fetchFaqResponses(),
          ]);

        setProfile(profileData);
        setExperiences(experiencesData);
        setSkills(skillsData);
        setFaqResponses(faqData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { profile, experiences, skills, faqResponses, loading, error };
}
