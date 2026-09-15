import { useAuth } from "../context/useAuth";

export const PermissionGate = ({
    permission,
    children,
    fallback = null,
}: {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) => {
    const { hasPermission } = useAuth();
    return hasPermission(permission) ? children : fallback;
};

export const AccessDenied = ({ message = "You don't have permission to access this feature." }: { message?: string }) => (
    <section className="access-denied" role="alert">
        <span>🔒</span>
        <h2>Access Denied</h2>
        <p>{message}</p>
    </section>
);
