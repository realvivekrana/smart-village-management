import { createContext, useCallback, useEffect, useState } from "react";
import * as authService from "../services/authService";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((res) => {
        const fetchedUser = res.data.data.user;
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: loggedUser, token } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { user: newUser, token } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
