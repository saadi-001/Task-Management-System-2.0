import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  roles: string[];
  permissions: string[];
  loginUser: (token: string, user: User, roles?: string[], permissions?: string[]) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        const sessionRes = await authService.getSession();
        if (sessionRes && sessionRes.success) {
          setUser(sessionRes.data.user || sessionRes.data);
          // Wait, session API usually returns roles/permissions too
          setRoles(sessionRes.data.roles || sessionRes.roles || []);
          setPermissions(sessionRes.data.permissions || sessionRes.permissions || []);
        } else {
          setToken(null);
          await authService.removeToken();
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth data', error);
      setToken(null);
      await authService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (newToken: string, newUser: User, newRoles: string[] = [], newPerms: string[] = []) => {
    await authService.saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setRoles(newRoles);
    setPermissions(newPerms);
  };

  const logout = async () => {
    await authService.removeToken();
    setToken(null);
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const can = (permission: string) => {
    if (roles.includes("Workspace Admin")) return true;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, roles, permissions, loginUser, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

