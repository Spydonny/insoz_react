const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Ошибка сервера" }));
    throw new Error(err.detail || "Ошибка запроса");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Post types ──────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  image_url?: string;
  likes: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  posts_count: number;
  joined_at?: string;
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export const getPosts = (skip = 0, limit = 20) =>
  apiFetch<Post[]>(`/social/posts?skip=${skip}&limit=${limit}`);

export const createPost = (content: string, image_url?: string) =>
  apiFetch<Post>("/social/posts", {
    method: "POST",
    body: JSON.stringify({ content, image_url }),
  });

export const getPost = (postId: string) =>
  apiFetch<Post>(`/social/posts/${postId}`);

export const deletePost = (postId: string) =>
  apiFetch<void>(`/social/posts/${postId}`, { method: "DELETE" });

export const likePost = (postId: string) =>
  apiFetch<Post>(`/social/posts/${postId}/like`, { method: "POST" });

// ─── Comments ─────────────────────────────────────────────────────────────────

export const getComments = (postId: string) =>
  apiFetch<Comment[]>(`/social/posts/${postId}/comments`);

export const addComment = (postId: string, content: string) =>
  apiFetch<Comment>(`/social/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const deleteComment = (postId: string, commentId: string) =>
  apiFetch<void>(`/social/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getUserProfile = (userId: string) =>
  apiFetch<UserProfile>(`/social/profile/${userId}`);

export const getUserProfilePosts = (userId: string, skip = 0, limit = 20) =>
  apiFetch<Post[]>(`/social/profile/${userId}/posts?skip=${skip}&limit=${limit}`);
