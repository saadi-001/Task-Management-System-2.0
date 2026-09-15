import { useEffect, useState } from "react";

type Toast = {
    type: "success" | "error" | "warning" | "info";
    text: string;
};

const AppToast = () => {
    const [toast, setToast] = useState<Toast | null>(null);

    useEffect(() => {
        const handleToast = (event: Event) => {
            const detail = (event as CustomEvent<Toast>).detail;
            setToast(detail);
            window.setTimeout(() => setToast(null), 4500);
        };

        window.addEventListener("app:toast", handleToast);
        return () => window.removeEventListener("app:toast", handleToast);
    }, []);

    if (!toast) return null;

    return (
        <div className={`app-toast ${toast.type}`} role="status" aria-live="polite">
            <span>{toast.type === "error" ? "!" : "✓"}</span>
            <strong>{toast.text}</strong>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button>
        </div>
    );
};

export default AppToast;
