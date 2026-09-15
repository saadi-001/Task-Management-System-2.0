import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post(
                "/auth/forgot-password",
                {
                    email,
                }
            );

            const resetToken = response.data.data.resetToken;

            setMessage("Password reset link generated.");

            setTimeout(() => {
                navigate(`/reset-password?token=${resetToken}`);
            }, 700);

        } catch (error: unknown) {
            console.error(error);

            setError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message || "Something went wrong"
                    : "Something went wrong"
            );
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

                    <form onSubmit={handleForgotPassword}>

                        <div className="input-group">

                            <label>
                                Email
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="login-button"
                        >
                            Reset Password →
                        </button>

                    </form>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
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