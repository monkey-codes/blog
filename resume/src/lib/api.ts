import { supabase } from "./supabase";
import type {
  CandidateProfile,
  Experience,
  Skill,
  FaqResponse,
  FitResult,
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

export async function sendChatMessage(
  message: string,
  conversationId: string,
): Promise<{ conversation_id: string; reply: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      message,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  return response.json();
}

export async function analyzeJobFit(
  jobDescription: string,
): Promise<FitResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/job-fit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      candidate_id: candidateId,
      job_description: jobDescription,
    }),
  });

  if (!response.ok) {
    throw new Error(`Job fit analysis failed: ${response.status}`);
  }

  return response.json();
}
