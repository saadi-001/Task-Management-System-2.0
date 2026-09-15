import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError, authService } from "../services/authService";

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
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        console.log("========== SIGNUP DEBUG START ==========");
        console.log("Signup form values:", {
            name,
            email,
            password: password ? "[PROVIDED]" : "[EMPTY]",
            confirmPassword: confirmPassword ? "[PROVIDED]" : "[EMPTY]",
            dateOfBirth,
            acceptedTerms,
        });

        if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
            setError("Please check the highlighted fields.");
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            setError("Password must be 8+ characters with uppercase, lowercase, and a number.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!acceptedTerms) {
            setError("Please accept the platform rules before continuing.");
            return;
        }

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

            setError(error instanceof AuthError ? error.message : "Something went wrong. Please try again.");
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
                            className="signup-form"
                            onSubmit={handleSignup}
                        >

                            <div className="signup-field">
                                <label>Name</label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    required
                                />
                            </div>


                            <div className="signup-field">
                                <label>Email</label>

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


                            <div className="signup-field">
                                <label>Password</label>

                                <div className="signup-password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="8+ chars, uppercase, lowercase and number"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="signup-password-toggle"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>


                            <div className="signup-field">
                                <label>Confirm Password</label>

                                <div className="signup-password-wrapper">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
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
                                        {showConfirmPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
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

                            <label className="policy-check">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    required
                                />
                                <span>I agree to use workspace data responsibly and follow assigned access rules.</span>
                            </label>


                            <button
                                type="submit"
                                className="signup-button"
                                disabled={loading}
                            >
                                {loading ? "Creating account..." : "Create Account →"}
                            </button>

                        </form>


                        {message && (
                            <div className="signup-success">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="signup-error">
                                {error}
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