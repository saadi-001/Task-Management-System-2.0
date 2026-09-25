import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");
        const newErrors: { email?: string } = {};

        if (!email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            newErrors.email = "Please enter a valid email address (e.g. name@company.com).";
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim(),
                }
            );

            const resetToken = response.data.data.resetToken;

            setMessage("Password reset link generated.");

            setTimeout(() => {
                navigate(`/reset-password?token=${resetToken}`);
            }, 700);

        } catch (error: unknown) {
            console.error(error);
            const errMsg = axios.isAxiosError(error)
                ? error.response?.data?.message || "Something went wrong"
                : "Something went wrong";

            setError(errMsg);
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

                <div className="brand-name">
                    Task Management System
                </div>

                <div className="brand-content">

                    <h1>
                        Secure.
                        <br />
                        Simple.
                        <br />
                        <span>Reliable.</span>
                    </h1>

                    <p>
                        Manage your teams, projects, and tasks
                        with everything organized in one place.
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
                                Keep your projects and tasks in one place.
                            </small>
                        </div>

                        <div className="feature">
                            <strong>✓ Stay Secure</strong>
                            <small>
                                Your account and information stay protected.
                            </small>
                        </div>

                    </div>

                </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="login-section">

                <div className="auth-card forgot-card">

                    <div className="forgot-top">

                        <span>
                            Remember your password?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>

                    </div>

                    <div className="login-header">

                        <span>
                            Account Recovery
                        </span>

                        <h2>
                            Forgot your password?
                        </h2>

                        <p>
                            Enter your email address and we'll help
                            you reset your password.
                        </p>

                    </div>

                    <form noValidate onSubmit={handleForgotPassword}>

                        <div className="input-group">

                            <label>
                                Email
                            </label>

                            <div className={`input-wrapper ${fieldErrors.email ? "has-error" : ""}`}>

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email) setFieldErrors({ email: undefined });
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

                        {/* FORM-LEVEL AUTH ERROR */}
                        {error && (
                            <div className="auth-form-error" role="alert">
                                <span className="auth-form-error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Generating reset link..." : "Reset Password →"}
                        </button>

                    </form>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    <div className="forgot-bottom">

                        <span>
                            Remember your password?
                        </span>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Back to Login
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ForgotPassword;