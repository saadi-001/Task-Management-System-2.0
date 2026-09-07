import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            // Save JWT token
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Save remember-me preference
            localStorage.setItem(
                "rememberMe",
                rememberMe.toString()
            );

            setMessage("Login successful!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

        } catch (error: any) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to login. Please check your credentials."
            );

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
                        Organize.<br />
                        Collaborate.<br />
                        <span>Get Things Done.</span>
                    </h1>

                    <p>
                        A simple and powerful way to manage your teams,
                        projects, and tasks — all in one place.
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
                            Enter your credentials to continue to your workspace.
                        </p>

                    </div>


                    <form onSubmit={handleLogin}>

                        {/* EMAIL */}
                        <div className="input-group">

                            <label>Email</label>

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


                        {/* PASSWORD */}
                        <div className="input-group">

                            <label>Password</label>

                            <div className="input-wrapper">

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
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    👁
                                </button>

                            </div>

                        </div>


                        {/* OPTIONS */}
                        <div className="login-options">

                            <label className="remember">

                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
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
                                    navigate("/forgot-password")
                                }
                            >
                                Forgot Password?
                            </button>

                        </div>


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


                        {/* ERROR */}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                    </form>


                    {/* SIGNUP */}
                    <div className="signup-bottom">

                        Don't have an account?

                        <button
                            type="button"
                            onClick={() => navigate("/signup")}
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