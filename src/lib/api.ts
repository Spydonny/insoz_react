// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function fetchWithHandling<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(input, init);
  } catch (e) {
    // network error, CORS, offline, DNS
    throw new Error("Нет соединения с сервером");
  }

  let payload: any = null;
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  } else {
    payload = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      payload ||
      `HTTP ${res.status}`;

    switch (res.status) {
      case 400:
        throw new Error(message || "Некорректный запрос");
      case 401:
        throw new Error("Неверный логин или пароль");
      case 403:
        throw new Error("Доступ запрещён");
      case 404:
        throw new Error("Ресурс не найден");
      case 409:
        throw new Error(message || "Конфликт данных");
      case 422:
        throw new Error(message || "Ошибка валидации");
      case 500:
        throw new Error("Ошибка сервера");
      default:
        throw new Error(message);
    }
  }

  return payload as T;
}


// ======== TOKEN HELPERS ========
export function saveToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function clearToken() {
  localStorage.removeItem("access_token");
}

// ======== USERS API ========
export async function registerUser(data: {
  full_name: string;
  username: string;
  password: string;
}) {
  return fetchWithHandling(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const formData = new URLSearchParams({
    grant_type: "password",
    username: data.email, 
    password: data.password,
    scope: "",
    client_id: "string",
    client_secret: "string",
  });

  const result = await fetchWithHandling<{
    access_token?: string;
    token_type?: string;
  }>(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (result.access_token) {
    localStorage.setItem("access_token", result.access_token);
  }

  return result;
}

export async function logoutUser() {
  clearToken();
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) throw new Error("Нет токена");
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Ошибка получения пользователя");
  return res.json();
}

// ======== CHILDREN ========
import { Child, PhonemeAnalysis } from "@/types/child";

export async function fetchChildren(): Promise<Child[]> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/children/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Ошибка загрузки");
    return await res.json();
  } catch (err) {
    // fallback mock
    return [
    ];
  }
}

export async function getChildById(uuid: string): Promise<Child | null> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/children/id/${uuid}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Ошибка загрузки");
    return await res.json();
  } catch {
    return null;
  }
}

export async function createChild(data: Omit<Child, "uuid">): Promise<Child | null> {
  try {
    const token = getToken();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("age", String(data.age));

    for (const item of data.diagnosis) {
      formData.append("diagnosis", item);
    }

    if (data.picture) {
      formData.append("picture", data.picture);
    }

    const res = await fetch(`${API_URL}/children/`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Не указываем Content-Type — fetch сам установит границы multipart/form-data
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка при создании ребёнка: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}


export async function fetchPicture(pictureId: string): Promise<Blob> {
  try {
    const token = getToken(); // если используешь авторизацию
    const res = await fetch(`${pictureId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      throw new Error(`Ошибка при загрузке картинки: ${res.statusText}`);
    }

    // возвращаем как Blob, чтобы можно было использовать в img src
    return await res.blob();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export interface DiagnosisProbabilities {
  rhotacism?: number;
  lisp?: number;
  general_speech_disorder?: number;
  phonetic_phonemic_disorder?: number;
  stuttering?: number;
  aphasia?: number;
  dysarthria?: number;
  normal?: number;
}

export interface RecordItem {
  id: string;
  child_uuid: string;
  uploaded_at: string;
  file_path: string;
  diagnosis_probabilities?: DiagnosisProbabilities;
}

export async function fetchChildRecords(childId: string): Promise<RecordItem[]> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/children/record/${childId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      throw new Error(`Ошибка получения записей: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Ошибка fetchChildRecords:", err);
    return [];
  }
}

export async function uploadChildRecord(childId: string, file: File): Promise<any> {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append("record", file);

    const res = await fetch(`${API_URL}/children/record/${childId}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка загрузки записи: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Ошибка uploadChildRecord:", err);
    throw err;
  }
}

export async function playChildRecord(recordPath: string): Promise<void> {
  try {
    const token = getToken();
    const res = await fetch(`${recordPath}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) throw new Error("Ошибка при загрузке аудиофайла");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (err) {
    console.error("Ошибка при воспроизведении:", err);
  }
}

// ======== THERAPY ASSISTANT (RAG) ========

export interface RagTherapyAnswerRequest {
  child_uuid: string;
  question: string;
  k_total?: number;
  include_context?: boolean;
}

export interface RagTherapyAnswerResponse {
  answer: string;
  sources: string[];
  context?: string | null;
}

export async function ragTherapyAnswer(
  payload: RagTherapyAnswerRequest
): Promise<RagTherapyAnswerResponse> {
  const token = getToken();

  return fetchWithHandling<RagTherapyAnswerResponse>(`${API_URL}/rag/therapy-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

// ======== PHONEME ANALYSIS ========

export interface AnalyzePhonemesRequest {
  child_uuid: string;
  language: string;
  phonemes: string[];
  max_score: number;
  record: File;
}

export interface AnalyzePhonemesResponse {
  analysis: PhonemeAnalysis;
}

export async function analyzePhonemes(
  payload: AnalyzePhonemesRequest
): Promise<AnalyzePhonemesResponse> {
  const token = getToken();
  const formData = new FormData();

  // 👇 извлекаем IPA (после слеша)
  const ipaPhonemes = payload.phonemes.map((p) => {
    const parts = p.split("/");
    return parts[1] || parts[0]; // если вдруг нет слеша
  });

  formData.append("language", payload.language);
  formData.append("phonemes", JSON.stringify(ipaPhonemes)); // 👈 отправляем IPA
  formData.append("max_score", String(payload.max_score));
  formData.append("record", payload.record);

  return fetchWithHandling<AnalyzePhonemesResponse>(
    `${API_URL}/children/phonemes/analyze/${payload.child_uuid}`,
    {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );
}

export interface ManualPhonemeScoreRequest {
  child_uuid: string;
  language: string;
  phonemes: string[];
  scores: Record<string, number>;
  max_score: number;
  comment?: string;
}

export interface ManualPhonemeScoreResponse {
  analysis: PhonemeAnalysis;
}

export async function submitManualPhonemeScore(
  payload: ManualPhonemeScoreRequest
): Promise<ManualPhonemeScoreResponse> {
  const token = getToken();

  return fetchWithHandling<ManualPhonemeScoreResponse>(`${API_URL}/children/phonemes/manual-score/${payload.child_uuid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}
