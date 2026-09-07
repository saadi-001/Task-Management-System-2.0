import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Signup = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post("/auth/signup", {
                name,
                email,
                password,
                dateOfBirth: dateOfBirth || null,
            });

            console.log(response.data);

            setMessage("Account created successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error: any) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Signup failed"
            );
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

                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>


                            <div className="signup-field">
                                <label>Date of Birth</label>

                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) =>
                                        setDateOfBirth(e.target.value)
                                    }
                                />
                            </div>


                            <button
                                type="submit"
                                className="signup-button"
                            >
                                Create Account →
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