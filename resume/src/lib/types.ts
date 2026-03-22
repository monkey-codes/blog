export interface CandidateProfile {
  id: string;
  full_name: string;
  headline: string | null;
  elevator_pitch: string | null;
  location: string | null;
  remote_preference: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  bullet_points: string[] | null;
}

export interface Experience {
  id: string;
  candidate_id: string;
  company_name: string;
  title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  bullet_points: string[] | null;
  display_order: number;
}

export interface Skill {
  id: string;
  candidate_id: string;
  skill_name: string;
  category: "strong" | "moderate" | "gap";
  years_experience: number | null;
}

export interface FaqResponse {
  id: string;
  candidate_id: string;
  question: string;
  answer: string;
}
