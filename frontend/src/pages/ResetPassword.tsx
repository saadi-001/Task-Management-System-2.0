import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [token] = useState(
        searchParams.get("token") || ""
    );

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ password?: string }>({});
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");
        const newErrors: { password?: string } = {};

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            newErrors.password = "Password must be 8+ characters with uppercase, lowercase, and a number.";
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/reset-password",
                {
                    resetToken: token,
                    newPassword: password,
                }
            );

            setMessage(
                response.data.message ||
                "Password reset successfully!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error: unknown) {
            console.error(error);
            const errMsg = axios.isAxiosError(error)
                ? error.response?.data?.message || "Password reset failed"
                : "Password reset failed";

            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-page">

            {/* LEFT SIDE */}
            <div className="reset-left">

                <div className="reset-brand">
                    <div className="reset-brand-icon">
                        ✓
                    </div>

                    <div className="reset-brand-name">
                        Task Management System
                    </div>
                </div>

                <div className="reset-hero">

                    <h1>
                        Secure.<br />
                        Simple.<br />
                        <span>Reliable.</span>
                    </h1>

                    <p>
                        Manage your teams, projects, and tasks with
                        everything organized in one place.
                    </p>

                    <div className="reset-features">

                        <div className="reset-feature">
                            <strong>✓ Work Together</strong>
                            <span>
                                Collaborate with your team seamlessly.
                            </span>
                        </div>

                        <div className="reset-feature">
                            <strong>✓ Stay Organized</strong>
                            <span>
                                Keep your projects and tasks in one place.
                            </span>
                        </div>

                        <div className="reset-feature">
                            <strong>✓ Stay Secure</strong>
                            <span>
                                Your account and information stay protected.
                            </span>
                        </div>

                    </div>
                </div>

                <div className="reset-decoration"></div>

            </div>


            {/* RIGHT SIDE */}
            <div className="reset-right">

                <div className="reset-card">

                    <div className="reset-top">
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

                    <div className="reset-content">

                        <div className="reset-welcome">
                            Secure Your Account
                        </div>

                        <h2>
                            Reset your password
                        </h2>

                        <p className="reset-subtitle">
                            Create a new password for your account.
                        </p>


                        <form noValidate onSubmit={handleResetPassword}>

                            <div className="reset-field">
                                <label>New Password</label>

                                <input
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={password}
                                    className={fieldErrors.password ? "has-error" : ""}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) setFieldErrors({ password: undefined });
                                        if (error) setError("");
                                    }}
                                />
                                {fieldErrors.password && (
                                    <div className="field-error-text" role="alert">
                                        <span className="error-bullet">●</span> {fieldErrors.password}
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
                                className="reset-button"
                                disabled={loading}
                            >
                                {loading ? "Updating password..." : "Update Password →"}
                            </button>

                        </form>


                        {message && (
                            <div className="success-message">
                                {message}
                            </div>
                        )}


                        <div className="reset-bottom">
                            Back to{" "}

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

export default ResetPassword;