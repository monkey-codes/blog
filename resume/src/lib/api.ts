import { supabase } from "./supabase";
import type {
  CandidateProfile,
  Experience,
  Skill,
  FaqResponse,
} from "./types";

const candidateId = import.meta.env.VITE_CANDIDATE_ID;

export async function fetchCandidateProfile(): Promise<CandidateProfile> {
  const { data, error } = await supabase
    .from("candidate_profiles_public")
    .select()
    .eq("id", candidateId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences_public")
    .select()
    .eq("candidate_id", candidateId)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from("skills_public")
    .select()
    .eq("candidate_id", candidateId);

  if (error) throw error;
  return data;
}

export async function fetchFaqResponses(): Promise<FaqResponse[]> {
  const { data, error } = await supabase
    .from("faq_responses_public")
    .select()
    .eq("candidate_id", candidateId);

  if (error) throw error;
  return data;
}
