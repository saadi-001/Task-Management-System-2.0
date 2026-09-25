import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import AppSidebar from "../components/AppSidebar";
import ConfirmModal from "../components/ConfirmModal";

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
  const { session, user, isInitializing, hasPermission } = useAuth();
  const userId = user?.UserID || 0;
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [ticketData, setTicketData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    Name: "",
    Description: "",
    OrganizationID: "",
    OwnerID: String(userId || ""),
  });

  const [modalFieldErrors, setModalFieldErrors] = useState<{
    Name?: string;
    OrganizationID?: string;
    general?: string;
  }>({});

  const can = (permission: string) => hasPermission(permission);
  const isAdmin = session?.roles.includes("Admin") || false;
  const visibleProjects = isAdmin
    ? projects
    : projects.filter((project) => project.OwnerID === userId);
  const visibleTickets = isAdmin
    ? ticketData
    : ticketData.filter((ticket) => ticket.AssignedTo === userId);
  const tickets = visibleTickets;

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
    setModalFieldErrors({});
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
    setModalFieldErrors({});
    const newErrors: typeof modalFieldErrors = {};

    if (!projectForm.Name.trim()) {
      newErrors.Name = "Project name is required.";
    }
    if (!projectForm.OrganizationID) {
      newErrors.OrganizationID = "Please select an organization.";
    }

    if (Object.keys(newErrors).length > 0) {
      setModalFieldErrors(newErrors);
      return;
    }

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
      const errMsg = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message || "Unable to save project."
        : "Unable to save project.";
      setModalFieldErrors({ general: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    if (!can("DELETE_PROJECT")) {
      showAccessError();
      return;
    }
    setDeletingProject(true);
    try {
      await api.delete(`/projects/${projectToDelete}`);
      setProjectToDelete(null);
      await loadDashboard();
    } catch (requestError: unknown) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to delete project."
          : "Unable to delete project.",
      );
    } finally {
      setDeletingProject(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* ================= SIDEBAR ================= */}
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-header-top">
            <button
              type="button"
              className={`dashboard-mobile-menu-button ${sidebarOpen ? "is-open" : ""}`}
              aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((current) => !current)}
            >
              <span aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>

            <div
              className="dashboard-user clickable-profile"
              onClick={() => navigate("/workspace/profile")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/workspace/profile");
                }
              }}
              aria-label="View My Profile"
              title="View My Profile"
            >
              <div className="dashboard-avatar">
                {session?.user.Name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="dashboard-user-info">
                <strong>{session?.user.Name || "Loading..."}</strong>
                <span>{session?.roles.join(" / ") || "Workspace Member"}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-header-content">
            <div className="dashboard-welcome">Welcome Back</div>

            <h1>Dashboard</h1>

            <p>Manage your teams, projects, and tasks from one place.</p>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="dashboard-stats">
          <div
            className="dashboard-stat-card clickable"
            onClick={() => navigate("/workspace/organizations")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/workspace/organizations")}
          >
            <div className="stat-icon purple">◈</div>

            <div>
              <span>Organizations</span>
              <strong>{organizations.length}</strong>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${can("VIEW_PROJECT") ? "clickable" : ""}`}
            onClick={() => can("VIEW_PROJECT") && navigate("/workspace/projects")}
            role="button"
            tabIndex={can("VIEW_PROJECT") ? 0 : -1}
            onKeyDown={(e) => e.key === "Enter" && can("VIEW_PROJECT") && navigate("/workspace/projects")}
          >
            <div className="stat-icon blue">▣</div>

            <div>
              <span>Projects</span>
              <strong>
                {can("VIEW_PROJECT") ? visibleProjects.length : "-"}
              </strong>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${can("VIEW_TICKET") ? "clickable" : ""}`}
            onClick={() => can("VIEW_TICKET") && navigate("/workspace/tasks")}
            role="button"
            tabIndex={can("VIEW_TICKET") ? 0 : -1}
            onKeyDown={(e) => e.key === "Enter" && can("VIEW_TICKET") && navigate("/workspace/tasks")}
          >
            <div className="stat-icon green">✓</div>

            <div>
              <span>Tasks</span>
              <strong>
                {can("VIEW_TICKET") ? visibleTickets.length : "-"}
              </strong>
            </div>
          </div>

          <div
            className={`dashboard-stat-card ${can("VIEW_TICKET") ? "clickable" : ""}`}
            onClick={() => can("VIEW_TICKET") && navigate("/workspace/tasks")}
            role="button"
            tabIndex={can("VIEW_TICKET") ? 0 : -1}
            onKeyDown={(e) => e.key === "Enter" && can("VIEW_TICKET") && navigate("/workspace/tasks")}
          >
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
            <div
              className="panel-header"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/workspace/organizations")}
            >
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
                {organizations.slice(0, 5).map((organization, index) => (
                  <div
                    className="dashboard-list-row clickable"
                    key={organization.OrganizationID}
                    onClick={() => navigate("/workspace/organizations")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/workspace/organizations")}
                  >
                    <strong>{organization.Name}</strong>
                    <span>#{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-panel" id="projects">
            <div className="panel-header">
              <div>
                <h2
                  style={{ cursor: can("VIEW_PROJECT") ? "pointer" : "default" }}
                  onClick={() => can("VIEW_PROJECT") && navigate("/workspace/projects")}
                >
                  Projects
                </h2>
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
                    <div
                      className="clickable"
                      style={{ cursor: "pointer", flex: 1 }}
                      onClick={() => navigate("/workspace/projects")}
                    >
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
                          type="button"
                          onClick={() => setProjectToDelete(project.ProjectID)}
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
              <h2
                style={{ cursor: can("VIEW_TICKET") ? "pointer" : "default" }}
                onClick={() => can("VIEW_TICKET") && navigate("/workspace/tasks")}
              >
                Recent Tasks
              </h2>

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
                <div
                  className="dashboard-list-row clickable"
                  key={ticket.TaskID}
                  onClick={() => can("VIEW_TICKET") && navigate("/workspace/tasks")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && can("VIEW_TICKET") && navigate("/workspace/tasks")}
                >
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
            <form noValidate className="project-modal" onSubmit={handleProjectSubmit}>
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

              {modalFieldErrors.general && (
                <div className="dashboard-notice error" role="alert" style={{ margin: "10px 0" }}>
                  <span>{modalFieldErrors.general}</span>
                  <button
                    type="button"
                    onClick={() => setModalFieldErrors({ ...modalFieldErrors, general: undefined })}
                  >
                    ×
                  </button>
                </div>
              )}

              <label>
                Project name
                <input
                  required
                  className={modalFieldErrors.Name ? "has-error" : ""}
                  value={projectForm.Name}
                  onChange={(event) => {
                    setProjectForm({ ...projectForm, Name: event.target.value });
                    if (modalFieldErrors.Name) setModalFieldErrors({ ...modalFieldErrors, Name: undefined });
                  }}
                />
                {modalFieldErrors.Name && (
                  <div className="field-error-text" role="alert">
                    <span className="error-bullet">●</span> {modalFieldErrors.Name}
                  </div>
                )}
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
                  className={modalFieldErrors.OrganizationID ? "has-error" : ""}
                  value={projectForm.OrganizationID}
                  onChange={(event) => {
                    setProjectForm({
                      ...projectForm,
                      OrganizationID: event.target.value,
                    });
                    if (modalFieldErrors.OrganizationID)
                      setModalFieldErrors({ ...modalFieldErrors, OrganizationID: undefined });
                  }}
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
                {modalFieldErrors.OrganizationID && (
                  <div className="field-error-text" role="alert">
                    <span className="error-bullet">●</span> {modalFieldErrors.OrganizationID}
                  </div>
                )}
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
        {/* ================= CONFIRM DELETE MODAL ================= */}
        <ConfirmModal
          isOpen={projectToDelete !== null}
          title="Delete Project"
          message="Are you sure you want to permanently delete this project? All associated tasks and assignments will be impacted. This action cannot be undone."
          confirmText="Delete Project"
          isLoading={deletingProject}
          onConfirm={confirmDeleteProject}
          onCancel={() => setProjectToDelete(null)}
        />
      </main>
    </div>
  );
};

export default Dashboard;
