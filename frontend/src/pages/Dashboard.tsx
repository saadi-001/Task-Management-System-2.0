import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

type Project = {
  ProjectID: number;
  Name: string;
  Description?: string | null;
  OrganizationID: number;
  OwnerID: number;
};

type Organization = {
  OrganizationID: number;
  Name: string;
};

type Ticket = {
  TaskID: number;
  Title: string;
  Status: string;
  Priority: string;
  AssignedTo?: number;
};

const getData = <T,>(response: { data: { data: T } }) => response.data.data;

const Dashboard = () => {
  const navigate = useNavigate();
  const { session, user, isInitializing, hasPermission, logout } = useAuth();
  const userId = user?.UserID || 0;
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    Name: "",
    Description: "",
    OrganizationID: "",
    OwnerID: String(userId || ""),
  });

  const can = (permission: string) => hasPermission(permission);
  const isAdmin = session?.roles.includes("Admin") || false;
  const visibleProjects = isAdmin
    ? projects
    : projects.filter((project) => project.OwnerID === userId);
  const visibleTickets = isAdmin
    ? ticketData
    : ticketData.filter((ticket) => ticket.AssignedTo === userId);
  const tickets = visibleTickets;

  const openModule = (path: string, allowed: boolean) => {
    if (!allowed) {
      setError(
        "Access Denied: you do not have permission to access this feature.",
      );
      return;
    }
    navigate(`/workspace/${path}`);
  };

  const showAccessError = () => {
    setError("You do not have permission to perform this action.");
  };

  const loadDashboard = async (activeSession = session) => {
    setError("");

    const requests = [
      activeSession?.permissions.includes("VIEW_PROJECT")
        ? api.get("/projects")
        : Promise.resolve(null),
      api.get("/organizations"),
      activeSession?.permissions.includes("VIEW_TICKET")
        ? api.get("/tickets")
        : Promise.resolve(null),
    ];
    const [projectResult, organizationResult, ticketResult] =
      await Promise.allSettled(requests);

    if (projectResult.status === "fulfilled" && projectResult.value)
      setProjects(getData<Project[]>(projectResult.value) || []);
    if (organizationResult.status === "fulfilled" && organizationResult.value)
      setOrganizations(getData<Organization[]>(organizationResult.value) || []);
    if (ticketResult.status === "fulfilled" && ticketResult.value)
      setTicketData(getData<Ticket[]>(ticketResult.value) || []);

    const failed = [projectResult, organizationResult, ticketResult].find(
      (result) => result.status === "rejected",
    );
    if (failed?.status === "rejected") {
      setError(
        axios.isAxiosError(failed.reason)
          ? failed.reason.response?.data?.message ||
              "Some dashboard data could not be loaded."
          : "Some dashboard data could not be loaded.",
      );
    }

    setLoading(false);
  };

  // The initial session request must run once when the protected page mounts.
  useEffect(() => {
    if (isInitializing) return;
    const timer = window.setTimeout(() => {
      void loadDashboard(session || undefined);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing, session]);

  const openProjectForm = (project?: Project) => {
    if (!can(project ? "UPDATE_PROJECT" : "CREATE_PROJECT")) {
      showAccessError();
      return;
    }
    setEditingProject(project || null);
    setProjectForm({
      Name: project?.Name || "",
      Description: project?.Description || "",
      OrganizationID: String(
        project?.OrganizationID || organizations[0]?.OrganizationID || "",
      ),
      OwnerID: String(project?.OwnerID || userId || ""),
    });
    setShowProjectForm(true);
  };

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      Name: projectForm.Name.trim(),
      Description: projectForm.Description.trim() || null,
      OrganizationID: Number(projectForm.OrganizationID),
      OwnerID: Number(projectForm.OwnerID),
    };

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.ProjectID}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      setShowProjectForm(false);
      await loadDashboard();
    } catch (requestError: unknown) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to save project."
          : "Unable to save project.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!can("DELETE_PROJECT")) {
      showAccessError();
      return;
    }
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      await loadDashboard();
    } catch (requestError: unknown) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to delete project."
          : "Unable to delete project.",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-page">
      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">
        <div>
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">✓</div>

            <span>Task Management System</span>
          </div>

          <nav className="dashboard-nav">
            <button className="dashboard-nav-item active">
              <span>▦</span>
              Dashboard
            </button>

            <button
              className="dashboard-nav-item"
              onClick={() => openModule("organizations", true)}
            >
              <span>◈</span>
              Organizations
            </button>

            {can("VIEW_PROJECT") && (
              <button
                className="dashboard-nav-item"
                onClick={() => openModule("projects", can("VIEW_PROJECT"))}
              >
                <span>▣</span>
                Projects
              </button>
            )}

            {can("VIEW_TICKET") && (
              <button
                className="dashboard-nav-item"
                onClick={() => openModule("tasks", can("VIEW_TICKET"))}
              >
                <span>✓</span>
                Tasks
              </button>
            )}

            <button
              className={`dashboard-nav-item ${!can("VIEW_ATTACHMENT") ? "locked" : ""}`}
              onClick={() => openModule("attachments", can("VIEW_ATTACHMENT"))}
            >
              <span>▧</span>
              Attachments {!can("VIEW_ATTACHMENT") && <small>🔒</small>}
            </button>

            <button
              className={`dashboard-nav-item ${!isAdmin ? "locked" : ""}`}
              onClick={() => openModule("users", isAdmin)}
            >
              <span>◉</span>
              Users {!isAdmin && <small>🔒</small>}
            </button>

            <button
              className={`dashboard-nav-item ${!isAdmin ? "locked" : ""}`}
              onClick={() => openModule("roles", isAdmin)}
            >
              <span>◇</span>
              Roles {!isAdmin && <small>🔒</small>}
            </button>

            <button
              className={`dashboard-nav-item ${!isAdmin ? "locked" : ""}`}
              onClick={() => openModule("permissions", isAdmin)}
            >
              <span>⌁</span>
              Permissions {!isAdmin && <small>🔒</small>}
            </button>

            <button
              className="dashboard-nav-item"
              onClick={() => navigate("/workspace/profile")}
            >
              <span>◉</span>
              My Profile
            </button>
          </nav>
        </div>

        <button className="dashboard-logout" onClick={handleLogout}>
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-welcome">Welcome Back</div>

            <h1>Dashboard</h1>

            <p>Manage your teams, projects, and tasks from one place.</p>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-avatar">
              {session?.user.Name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <strong>{session?.user.Name || "Loading..."}</strong>
              <span>{session?.roles.join(" / ") || "Workspace Member"}</span>
            </div>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="stat-icon purple">◈</div>

            <div>
              <span>Organizations</span>
              <strong>{organizations.length}</strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon blue">▣</div>

            <div>
              <span>Projects</span>
              <strong>
                {can("VIEW_PROJECT") ? visibleProjects.length : "-"}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <span>Tasks</span>
              <strong>
                {can("VIEW_TICKET") ? visibleTickets.length : "-"}
              </strong>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon orange">◷</div>

            <div>
              <span>Pending Tasks</span>
              <strong>
                {can("VIEW_TICKET")
                  ? visibleTickets.filter((ticket) => ticket.Status !== "Done")
                      .length
                  : "-"}
              </strong>
            </div>
          </div>
        </div>

        {/* ================= CONTENT CARDS ================= */}

        <div className="dashboard-grid">
          <div className="dashboard-panel" id="organizations">
            <div className="panel-header">
              <div>
                <h2>Organizations</h2>
                <p>Manage your organizations and team members.</p>
              </div>

              <span className="panel-count">{organizations.length} total</span>
            </div>

            {organizations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◈</div>
                <h3>No organizations yet</h3>
                <p>Organizations returned by the API will appear here.</p>
              </div>
            ) : (
              <div className="dashboard-list">
                {organizations.slice(0, 5).map((organization) => (
                  <div
                    className="dashboard-list-row"
                    key={organization.OrganizationID}
                  >
                    <strong>{organization.Name}</strong>
                    <span>#{organization.OrganizationID}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-panel" id="projects">
            <div className="panel-header">
              <div>
                <h2>Projects</h2>
                <p>Keep track of your active projects.</p>
              </div>

              {can("CREATE_PROJECT") && (
                <button
                  className="primary-dashboard-button compact"
                  onClick={() => openProjectForm()}
                >
                  + New Project
                </button>
              )}
            </div>

            {!can("VIEW_PROJECT") ? (
              <div className="empty-state">
                <h3>Projects are restricted</h3>
                <p>Your current role does not include project access.</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon blue-empty">▣</div>
                <h3>No projects yet</h3>
                <p>Create your first project using the API-backed form.</p>
                {can("CREATE_PROJECT") && (
                  <button
                    className="primary-dashboard-button"
                    onClick={() => openProjectForm()}
                  >
                    Create Project →
                  </button>
                )}
              </div>
            ) : (
              <div className="dashboard-list">
                {projects.slice(0, 5).map((project) => (
                  <div className="dashboard-list-row" key={project.ProjectID}>
                    <div>
                      <strong>{project.Name}</strong>
                      <span>{project.Description || "No description"}</span>
                    </div>
                    <div className="row-actions">
                      {can("UPDATE_PROJECT") && (
                        <button onClick={() => openProjectForm(project)}>
                          Edit
                        </button>
                      )}
                      {can("DELETE_PROJECT") && (
                        <button
                          onClick={() =>
                            void handleDeleteProject(project.ProjectID)
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= TASKS ================= */}

        <div className="dashboard-panel tasks-panel" id="tasks">
          <div className="panel-header">
            <div>
              <h2>Recent Tasks</h2>

              <p>Stay on top of your team's latest work.</p>
            </div>

            <span className="panel-count">{visibleTickets.length} total</span>
          </div>

          {!can("VIEW_TICKET") ? (
            <div className="tasks-empty">
              <div className="tasks-empty-icon">⌘</div>
              <div>
                <h3>Tasks are restricted</h3>
                <p>Your current role does not include task access.</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="tasks-empty">
              <div className="tasks-empty-icon">✓</div>
              <div>
                <h3>No tasks available</h3>
                <p>Tasks returned by the API will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="dashboard-list">
              {tickets.slice(0, 6).map((ticket) => (
                <div className="dashboard-list-row" key={ticket.TaskID}>
                  <div>
                    <strong>{ticket.Title}</strong>
                    <span>{ticket.Priority}</span>
                  </div>
                  <span
                    className={`status status-${ticket.Status.toLowerCase().replaceAll(" ", "-")}`}
                  >
                    {ticket.Status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="dashboard-notice">Loading workspace data...</div>
        )}
        {error && (
          <div className="dashboard-notice error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        {showProjectForm && (
          <div className="modal-backdrop" role="presentation">
            <form className="project-modal" onSubmit={handleProjectSubmit}>
              <div className="panel-header">
                <div>
                  <span className="dashboard-welcome">Projects</span>
                  <h2>{editingProject ? "Edit project" : "Create project"}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowProjectForm(false)}
                >
                  ×
                </button>
              </div>
              <label>
                Project name
                <input
                  required
                  value={projectForm.Name}
                  onChange={(event) =>
                    setProjectForm({ ...projectForm, Name: event.target.value })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  value={projectForm.Description}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      Description: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Organization
                <select
                  required
                  value={projectForm.OrganizationID}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      OrganizationID: event.target.value,
                    })
                  }
                >
                  <option value="">Select organization</option>
                  {organizations.map((organization) => (
                    <option
                      value={organization.OrganizationID}
                      key={organization.OrganizationID}
                    >
                      {organization.Name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="panel-button"
                  onClick={() => setShowProjectForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-dashboard-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save project"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
