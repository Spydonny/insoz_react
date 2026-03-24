export interface PhonemeScoreItem {
  phoneme: string;
  letter: string;
  score: number;
  best_similarity?: number | null;
}

export interface PhonemeAnalysis {
  id: string;
  child_uuid: string;
  analysis_type: "manual" | "ai";
  language: string;
  phonemes: string[];
  scores: Record<string, number>;
  results: PhonemeScoreItem[];
  max_score: number;
  average_score: number;
  summary?: string | null;
  comment?: string | null;
  audio_file_path?: string | null;
  created_at: string;
}

export interface Child {
  uuid: string;
  doctor_id?: string;
  name: string;
  age: number;
  diagnosis: string[];
  picture_id?: string;
  picture?: File;
  phoneme_analyses?: PhonemeAnalysis[];
}
