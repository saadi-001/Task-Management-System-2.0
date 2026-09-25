import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthError } from "../services/authService";
import { useAuth } from "../context/useAuth";

const EyeIcon = ({ off = false }: { off?: boolean }) => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        {off ? (
            <>
                <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9.88 5.09C10.56 4.86 11.27 4.75 12 4.75C17 4.75 20.5 9 21.5 12C21.13 13.1 20.48 14.3 19.55 15.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.61 6.61C4.82 7.86 3.65 9.78 2.5 12C3.5 15 7 19.25 12 19.25C13.19 19.25 14.31 19.03 15.35 18.64"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>
        ) : (
            <>
                <path
                    d="M2.5 12C3.5 9 7 4.75 12 4.75C17 4.75 20.5 9 21.5 12C20.5 15 17 19.25 12 19.25C7 19.25 3.5 15 2.5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </>
        )}
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { login, isAuthenticated, isInitializing } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [authFailed, setAuthFailed] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const redirectPath =
        (location.state as { from?: string } | null)?.from ||
        "/dashboard";

    useEffect(() => {
        if (!isInitializing && isAuthenticated) {
            navigate(redirectPath, { replace: true });
        }
    }, [
        isAuthenticated,
        isInitializing,
        navigate,
        redirectPath,
    ]);

    if (isInitializing) {
        return (
            <div
                className="auth-loading"
                role="status"
                aria-live="polite"
            >
                Restoring your session...
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setAuthFailed(false);
        const newFieldErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newFieldErrors.email = "Email address is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            newFieldErrors.email = "Please enter a valid email address (e.g. name@company.com).";
        }

        if (!password) {
            newFieldErrors.password = "Password is required.";
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            await login(email.trim(), password);

            localStorage.setItem(
                "rememberMe",
                String(rememberMe)
            );

            setMessage("Login successful!");

            navigate(redirectPath, { replace: true });
        } catch (error: unknown) {
            console.error(error);

            const msg =
                error instanceof AuthError
                    ? error.message
                    : "Something went wrong. Please try again.";

            setError(msg);
            setAuthFailed(true);
            setFieldErrors({});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* LEFT SIDE */}
            <div className="login-brand">
                <div className="brand-logo">
                    ✓
                </div>

                <h2 className="brand-name">
                    Task Management System
                </h2>

                <div className="brand-content">
                    <h1>
                        Organize.
                        <br />
                        Collaborate.
                        <br />
                        <span>Get Things Done.</span>
                    </h1>

                    <p>
                        A simple and powerful way to manage your
                        teams, projects, and tasks — all in one
                        place.
                    </p>

                    <div className="features">
                        <div className="feature">
                            <strong>✓ Work Together</strong>

                            <small>
                                Collaborate with your team seamlessly.
                            </small>
                        </div>

                        <div className="feature">
                            <strong>✓ Stay Organized</strong>

                            <small>
                                Keep all your projects in one place.
                            </small>
                        </div>

                        <div className="feature">
                            <strong>✓ Boost Productivity</strong>

                            <small>
                                Turn ideas into progress.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="login-section">
                <div className="auth-card">
                    <div className="signup-top">
                        New here?

                        <button
                            type="button"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="login-header">
                        <span>Welcome Back</span>

                        <h2>
                            Login to your account
                        </h2>

                        <p>
                            Enter your credentials to continue to
                            your workspace.
                        </p>
                    </div>

                    <form noValidate onSubmit={handleLogin}>
                        {/* EMAIL */}
                        <div className="input-group">
                            <label>Email</label>

                            <div className={`input-wrapper ${fieldErrors.email || authFailed ? "has-error" : ""}`}>
                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                                        if (authFailed) setAuthFailed(false);
                                        if (error) setError("");
                                    }}
                                />
                            </div>
                            {fieldErrors.email && (
                                <div className="field-error-text" role="alert">
                                    <span className="error-bullet">●</span> {fieldErrors.email}
                                </div>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div className="input-group">
                            <label>Password</label>

                            <div className={`input-wrapper ${fieldErrors.password || authFailed ? "has-error" : ""}`}>
                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                                        if (authFailed) setAuthFailed(false);
                                        if (error) setError("");
                                    }}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    title={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <EyeIcon
                                        off={!showPassword}
                                    />
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <div className="field-error-text" role="alert">
                                    <span className="error-bullet">●</span> {fieldErrors.password}
                                </div>
                            )}
                        </div>

                        {/* OPTIONS */}
                        <div className="login-options">
                            <label className="remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(
                                            e.target.checked
                                        )
                                    }
                                />

                                <span>
                                    Remember me
                                </span>
                            </label>

                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() =>
                                    navigate(
                                        "/forgot-password"
                                    )
                                }
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* FORM-LEVEL AUTH ERROR */}
                        {error && (
                            <div className="auth-form-error" role="alert">
                                <span className="auth-form-error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Login →"}
                        </button>

                        {/* SUCCESS */}
                        {message && (
                            <div className="success-message">
                                {message}
                            </div>
                        )}
                    </form>

                    {/* SIGNUP */}
                    <div className="signup-bottom">
                        Don't have an account?

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/signup")
                            }
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;