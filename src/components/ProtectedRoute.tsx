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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img
          src="/logo_insoz.png"
          alt="InSoz.ai"
          className="w-48 h-48 animate-pulse"
        /><br/>
        <span className="text-2xl text-gray-500 mt-4">Wait 6-7 seconds loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
