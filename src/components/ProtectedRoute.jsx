import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ roles }) {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return <LoadingSpinner label="Preparing secure session" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
