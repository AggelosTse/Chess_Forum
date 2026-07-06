import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

//protected route makes sure only autorized users can route to specific endpoints via URL
export function ProtectedRoute({ roleAllowed }) {
  const { token, role } = useAuth();
    

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roleAllowed && role !== roleAllowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}