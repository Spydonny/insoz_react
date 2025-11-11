// src/lib/api.ts
const API_URL = "http://localhost:8000"; // или https://localhosy/api

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
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка регистрации");
  return res.json();
}

export async function loginUser(data: { email: string; password: string }) {
  const formData = new URLSearchParams();
  formData.append("grant_type", "password");
  formData.append("username", data.email); // важно: backend ожидает 'username'
  formData.append("password", data.password);
  formData.append("scope", "");
  formData.append("client_id", "string");
  formData.append("client_secret", "string");

  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) throw new Error("Ошибка входа");
  const result = await res.json();

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
import { Child } from "@/types/child";

export async function fetchChildren(): Promise<Child[]> {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/children`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Ошибка загрузки");
    return await res.json();
  } catch {
    // fallback mock
    return [
      {
        uuid: "1",
        name: "Алихан Садыков",
        age: 7,
        diagnosis: ["ОНР Сторой степени", "Заикание"],
      },
      {
        uuid: "2",
        name: "Мадина Ержанова",
        age: 5,
        diagnosis: ["Картавость"],
      },
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
    const res = await fetch(`${API_URL}/pictures/${pictureId}`, {
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
    const res = await fetch(`${API_URL}/${recordPath}`, {
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