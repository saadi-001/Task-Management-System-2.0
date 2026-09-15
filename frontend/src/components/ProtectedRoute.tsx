import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

    const location = useLocation();
    const { isAuthenticated, isInitializing } = useAuth();

    if (isInitializing) {
        return <div className="auth-loading" role="status" aria-live="polite">Restoring your session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;