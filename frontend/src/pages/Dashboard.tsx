import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div className="dashboard-page">

            {/* ================= SIDEBAR ================= */}

            <aside className="dashboard-sidebar">

                <div>
                    <div className="dashboard-brand">
                        <div className="dashboard-brand-icon">
                            ✓
                        </div>

                        <span>
                            Task Management System
                        </span>
                    </div>

                    <nav className="dashboard-nav">

                        <button className="dashboard-nav-item active">
                            <span>▦</span>
                            Dashboard
                        </button>

                        <button className="dashboard-nav-item">
                            <span>◈</span>
                            Organizations
                        </button>

                        <button className="dashboard-nav-item">
                            <span>▣</span>
                            Projects
                        </button>

                        <button className="dashboard-nav-item">
                            <span>✓</span>
                            Tasks
                        </button>

                    </nav>
                </div>

                <button
                    className="dashboard-logout"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    Logout
                </button>

            </aside>


            {/* ================= MAIN CONTENT ================= */}

            <main className="dashboard-main">

                <div className="dashboard-header">

                    <div>
                        <div className="dashboard-welcome">
                            Welcome Back
                        </div>

                        <h1>Dashboard</h1>

                        <p>
                            Manage your teams, projects, and tasks
                            from one place.
                        </p>
                    </div>

                    <div className="dashboard-user">
                        <div className="dashboard-avatar">
                            U
                        </div>

                        <div>
                            <strong>User</strong>
                            <span>Workspace Member</span>
                        </div>
                    </div>

                </div>


                {/* ================= STATS ================= */}

                <div className="dashboard-stats">

                    <div className="dashboard-stat-card">

                        <div className="stat-icon purple">
                            ◈
                        </div>

                        <div>
                            <span>Organizations</span>
                            <strong>0</strong>
                        </div>

                    </div>


                    <div className="dashboard-stat-card">

                        <div className="stat-icon blue">
                            ▣
                        </div>

                        <div>
                            <span>Projects</span>
                            <strong>0</strong>
                        </div>

                    </div>


                    <div className="dashboard-stat-card">

                        <div className="stat-icon green">
                            ✓
                        </div>

                        <div>
                            <span>Tasks</span>
                            <strong>0</strong>
                        </div>

                    </div>


                    <div className="dashboard-stat-card">

                        <div className="stat-icon orange">
                            ◷
                        </div>

                        <div>
                            <span>Pending Tasks</span>
                            <strong>0</strong>
                        </div>

                    </div>

                </div>


                {/* ================= CONTENT CARDS ================= */}

                <div className="dashboard-grid">

                    <div className="dashboard-panel">

                        <div className="panel-header">
                            <div>
                                <h2>Organizations</h2>
                                <p>
                                    Manage your organizations and team members.
                                </p>
                            </div>

                            <button className="panel-button">
                                View All →
                            </button>
                        </div>

                        <div className="empty-state">

                            <div className="empty-icon">
                                ◈
                            </div>

                            <h3>No organizations yet</h3>

                            <p>
                                Create an organization to start
                                collaborating with your team.
                            </p>

                            <button className="primary-dashboard-button">
                                Create Organization →
                            </button>

                        </div>

                    </div>


                    <div className="dashboard-panel">

                        <div className="panel-header">
                            <div>
                                <h2>Projects</h2>
                                <p>
                                    Keep track of your active projects.
                                </p>
                            </div>

                            <button className="panel-button">
                                View All →
                            </button>
                        </div>

                        <div className="empty-state">

                            <div className="empty-icon blue-empty">
                                ▣
                            </div>

                            <h3>No projects yet</h3>

                            <p>
                                Your projects will appear here once
                                you create them.
                            </p>

                            <button className="primary-dashboard-button">
                                Create Project →
                            </button>

                        </div>

                    </div>

                </div>


                {/* ================= TASKS ================= */}

                <div className="dashboard-panel tasks-panel">

                    <div className="panel-header">

                        <div>
                            <h2>Recent Tasks</h2>

                            <p>
                                Stay on top of your team's latest work.
                            </p>
                        </div>

                        <button className="panel-button">
                            View All →
                        </button>

                    </div>

                    <div className="tasks-empty">

                        <div className="tasks-empty-icon">
                            ✓
                        </div>

                        <div>
                            <h3>No tasks available</h3>

                            <p>
                                Tasks assigned to you will appear here.
                            </p>
                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
};

export default Dashboard;