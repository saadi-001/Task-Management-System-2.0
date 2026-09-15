import { useEffect, useMemo, useState } from "react";
import { authService, type AuthSession } from "../services/authService";
import { AuthContext, type AuthContextValue } from "./authState";

const TOKEN_KEY = "token";
const SESSION_KEY = "session";

const readStoredSession = (): AuthSession | null => {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) as AuthSession : null;
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
};

const clearStoredAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("rememberMe");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
    const [isInitializing, setIsInitializing] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

    const logout = () => {
        clearStoredAuth();
        setToken(null);
        setSession(null);
        setIsInitializing(false);
    };

    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener("auth:unauthorized", handleUnauthorized);

        if (!token) {
            return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
        }

        authService.getSession()
            .then((nextSession) => {
                setSession(nextSession);
                localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            })
            .catch(() => logout())
            .finally(() => setIsInitializing(false));

        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, [token]);

    const login = async (email: string, password: string) => {
        setIsInitializing(true);
        try {
            const response = await authService.login(email, password);
            const nextSession: AuthSession = {
                user: response.user,
                roles: response.roles || [],
                permissions: response.permissions || [],
            };

            localStorage.setItem(TOKEN_KEY, response.token);
            localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
            setToken(response.token);
            setSession(nextSession);
        } catch (error) {
            setIsInitializing(false);
            throw error;
        }
    };

    const value = useMemo<AuthContextValue>(() => ({
        isAuthenticated: Boolean(token && session),
        isInitializing,
        token,
        session,
        user: session?.user || null,
        roles: session?.roles || [],
        permissions: session?.permissions || [],
        hasPermission: (permission) => Boolean(session?.permissions.includes(permission)),
        login,
        logout,
    }), [isInitializing, session, token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
