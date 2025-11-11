import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/api";

export interface User {
  _id: string;
  username: string;
  full_name: string;
  disabled: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data: User) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  return { user, setUser, loading, logout };
}
