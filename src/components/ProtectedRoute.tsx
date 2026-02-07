import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken, getCurrentUser } from "@/lib/api";
import { JSX } from "react/jsx-runtime";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const token = getToken();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return null; // или спиннер
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
