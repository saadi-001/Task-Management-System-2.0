import { createContext } from "react";
import type { AuthSession } from "../services/authService";

export type AuthContextValue = {
    isAuthenticated: boolean;
    isInitializing: boolean;
    token: string | null;
    session: AuthSession | null;
    user: AuthSession["user"] | null;
    roles: string[];
    permissions: string[];
    hasPermission: (permission: string) => boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
