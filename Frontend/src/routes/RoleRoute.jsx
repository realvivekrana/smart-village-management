import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getDashboardPath, isAdmin } from "../utils/permissions";

export default function RoleRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // super_admin passes all role checks
  if (user.role === "super_admin") return children;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return children;
}
