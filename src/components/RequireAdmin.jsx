import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] text-[#B08A57]">DIDAR</div>;
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (!new Set(["admin", "editor", "support"]).has(user?.role)) return <Navigate to="/account" replace />;

  return children;
}
