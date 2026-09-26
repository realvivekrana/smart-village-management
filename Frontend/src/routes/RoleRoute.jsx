import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getDashboardPath } from "../utils/permissions";

export default function RoleRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return children;
}