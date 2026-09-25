import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError, authService } from "../services/authService";

const EyeIcon = ({ off = false }: { off?: boolean }) => (
    <svg
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
                    d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M9.88 5.09A10.94 10.94 0 0 1 12 4.88C17.1 4.88 20.5 9 21.5 12C21.15 13.05 20.36 14.48 19.11 15.82"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.61 6.61C4.75 8.03 3.4 10.23 2.5 12C3.5 15 6.9 19.12 12 19.12C13.4 19.12 14.69 18.83 15.85 18.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>
        ) : (
            <path
                d="M2.5 12C3.5 9 6.9 4.88 12 4.88C17.1 4.88 20.5 9 21.5 12C20.5 15 17.1 19.12 12 19.12C6.9 19.12 3.5 15 2.5 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        )}
        {!off && (
            <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
            />
        )}
    </svg>
);

const Signup = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        terms?: string;
    }>({});
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const newErrors: typeof fieldErrors = {};
        if (!name.trim()) {
            newErrors.name = "Full name is required.";
        } else if (name.trim().length < 2) {
            newErrors.name = "Full name must be at least 2 characters.";
        }

        if (!email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            newErrors.email = "Please enter a valid email address (e.g. name@company.com).";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            newErrors.password = "Password must be 8+ characters with uppercase, lowercase, and a number.";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required.";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (!acceptedTerms) {
            newErrors.terms = "Please accept the platform rules before continuing.";
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});

        console.log("FRONTEND VALIDATION PASSED");
        console.log("ABOUT TO SEND SIGNUP REQUEST:", {
            name,
            email,
            dateOfBirth: dateOfBirth || null,
            acceptedTerms,
        });

        setLoading(true);

        try {
            console.log("CALLING AUTH SERVICE...");
            await authService.signup({
                name,
                email,
                password,
                dateOfBirth,
                acceptedTerms,
            });

            setMessage("Account created successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error: unknown) {
            console.error(error);

            setError(
                error instanceof AuthError
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            {/* LEFT SIDE */}
            <div className="signup-left">
                <div className="signup-brand">
                    <div className="signup-brand-icon">
                        ✓
                    </div>

                    <div className="signup-brand-name">
                        Task Management System
                    </div>
                </div>

                <div className="signup-hero">
                    <h1>
                        Organize.
                        <br />
                        Collaborate.
                        <br />
                        <span>Get Things Done.</span>
                    </h1>

                    <p>
                        A simple and powerful way to manage your teams,
                        projects, and tasks — all in one place.
                    </p>

                    <div className="signup-features">
                        <div className="signup-feature">
                            <strong>✓ Work Together</strong>
                            <span>
                                Collaborate with your team seamlessly.
                            </span>
                        </div>

                        <div className="signup-feature">
                            <strong>✓ Stay Organized</strong>
                            <span>
                                Keep all your projects in one place.
                            </span>
                        </div>

                        <div className="signup-feature">
                            <strong>✓ Boost Productivity</strong>
                            <span>
                                Turn ideas into progress.
                            </span>
                        </div>
                    </div>
                </div>

                <div className="signup-decoration"></div>
            </div>

            {/* RIGHT SIDE */}
            <div className="signup-right">
                <div className="signup-card">
                    <div className="signup-top-link">
                        Already a member?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                    </div>

                    <div className="signup-content">
                        <div className="signup-welcome">
                            Get Started
                        </div>

                        <h2>Create your account</h2>

                        <p className="signup-subtitle">
                            Sign up to start managing your teams,
                            projects, and tasks.
                        </p>

                        <form
                            noValidate
                            className="signup-form"
                            onSubmit={handleSignup}
                        >
                            <div className="signup-field">
                                <label>Name</label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    className={fieldErrors.name ? "has-error" : ""}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                                        if (error) setError("");
                                    }}
                                />
                                {fieldErrors.name && (
                                    <div className="field-error-text" role="alert">
                                        <span className="error-bullet">●</span> {fieldErrors.name}
                                    </div>
                                )}
                            </div>

                            <div className="signup-field">
                                <label>Email</label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    className={fieldErrors.email ? "has-error" : ""}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                                        if (error) setError("");
                                    }}
                                />
                                {fieldErrors.email && (
                                    <div className="field-error-text" role="alert">
                                        <span className="error-bullet">●</span> {fieldErrors.email}
                                    </div>
                                )}
                            </div>

                            <div className="signup-field">
                                <label>Password</label>

                                <div className={`signup-password-wrapper ${fieldErrors.password ? "has-error" : ""}`}>
                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="8+ chars, uppercase, lowercase and number"
                                        value={password}
                                        className={fieldErrors.password ? "has-error" : ""}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                                            if (error) setError("");
                                        }}
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="signup-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        <EyeIcon off={!showPassword} />
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <div className="field-error-text" role="alert">
                                        <span className="error-bullet">●</span> {fieldErrors.password}
                                    </div>
                                )}
                            </div>

                            <div className="signup-field">
                                <label>Confirm Password</label>

                                <div className={`signup-password-wrapper ${fieldErrors.confirmPassword ? "has-error" : ""}`}>
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        className={fieldErrors.confirmPassword ? "has-error" : ""}
                                        onChange={(e) => {
                                            setConfirmPassword(
                                                e.target.value
                                            );
                                            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                                            if (error) setError("");
                                        }}
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="signup-password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (prev) => !prev
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                    >
                                        <EyeIcon
                                            off={!showConfirmPassword}
                                        />
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <div className="field-error-text" role="alert">
                                        <span className="error-bullet">●</span> {fieldErrors.confirmPassword}
                                    </div>
                                )}
                            </div>

                            <div className="signup-field">
                                <label>Date of Birth (Optional)</label>

                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) =>
                                        setDateOfBirth(e.target.value)
                                    }
                                />
                            </div>

                            <label className={`policy-check ${fieldErrors.terms ? "has-error" : ""}`}>
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => {
                                        setAcceptedTerms(
                                            e.target.checked
                                        );
                                        if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: undefined });
                                        if (error) setError("");
                                    }}
                                />

                                <span>
                                    I agree to use workspace data responsibly
                                    and follow assigned access rules.
                                </span>
                            </label>
                            {fieldErrors.terms && (
                                <div className="field-error-text" role="alert" style={{ marginBottom: "16px" }}>
                                    <span className="error-bullet">●</span> {fieldErrors.terms}
                                </div>
                            )}

                            {/* FORM-LEVEL AUTH ERROR */}
                            {error && (
                                <div className="auth-form-error" role="alert">
                                    <span className="auth-form-error-icon">⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="signup-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create Account →"}
                            </button>
                        </form>

                        {message && (
                            <div className="signup-success">
                                {message}
                            </div>
                        )}

                        <div className="signup-bottom">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
