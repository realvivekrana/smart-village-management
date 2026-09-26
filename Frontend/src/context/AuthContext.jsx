import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Failed to load saved user:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Verify existing token when the application starts
  useEffect(() => {
    let mounted = true;

    const verifyAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getMe();

        const fetchedUser = response?.data?.data?.user;

        if (!fetchedUser) {
          throw new Error("Invalid user data received from server.");
        }

        if (mounted) {
          setUser(fetchedUser);
          localStorage.setItem(
            "user",
            JSON.stringify(fetchedUser)
          );
        }
      } catch (error) {
        console.error("Authentication verification failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    verifyAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    const response = await authService.login({
      email,
      password,
    });

    const loggedUser = response?.data?.data?.user;
    const token = response?.data?.data?.token;

    if (!loggedUser || !token) {
      throw new Error("Invalid login response from server.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify(loggedUser)
    );

    setUser(loggedUser);

    return loggedUser;
  }, []);

  // Register
  const register = useCallback(async (data) => {
    const response = await authService.register(data);

    const newUser = response?.data?.data?.user;
    const token = response?.data?.data?.token;

    if (!newUser || !token) {
      throw new Error("Invalid registration response from server.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );

    setUser(newUser);

    return newUser;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn(
        "Logout API request failed:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  // Update current user locally
  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser) {
      return;
    }

    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}