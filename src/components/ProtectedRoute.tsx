import { Navigate } from "react-router-dom";
import { getToken, getCurrentUser } from "@/lib/api";
import { JSX } from "react";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const token = getToken();

  const user = token ? getCurrentUser().catch(() => null) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
