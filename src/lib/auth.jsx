import { createContext, useContext, useEffect, useState } from \"react\";
import { api } from \"./api\";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(\"transitops_user\")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post(\"/auth/login\", { email, password });
    localStorage.setItem(\"transitops_token\", data.access_token);
    localStorage.setItem(\"transitops_user\", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post(\"/auth/register\", payload);
    localStorage.setItem(\"transitops_token\", data.access_token);
    localStorage.setItem(\"transitops_user\", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(\"transitops_token\");
    localStorage.removeItem(\"transitops_user\");
    setUser(null);
    window.location.href = \"/login\";
  };

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, loading, setLoading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
