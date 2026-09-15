import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { workspaceService, type ApiItem } from "../services/workspaceService";
import { useAuth } from "../context/useAuth";

type ModuleKey =
  | "organizations"
  | "projects"
  | "tasks"
  | "users"
  | "roles"
  | "permissions"
  | "attachments"
  | "profile";

const modules: Array<{
  key: ModuleKey;
  label: string;
  icon: string;
  permission?: string;
  admin?: boolean;
}> = [
  { key: "organizations", label: "Organizations", icon: "◈" },
  { key: "projects", label: "Projects", icon: "▣", permission: "VIEW_PROJECT" },
  { key: "tasks", label: "Tasks", icon: "✓", permission: "VIEW_TICKET" },
  { key: "users", label: "Users", icon: "◉", admin: true },
  { key: "roles", label: "Roles", icon: "◇", admin: true },
  { key: "permissions", label: "Permissions", icon: "⌁", admin: true },
  {
    key: "attachments",
    label: "Attachments",
    icon: "▧",
    permission: "VIEW_ATTACHMENT",
  },
  { key: "profile", label: "My Profile", icon: "◉" },
];

const idOf = (item: ApiItem, key: string) => Number(item[key]);
const textOf = (item: ApiItem, key: string) => String(item[key] ?? "");

const Workspace = () => {
  const { module = "organizations" } = useParams<{ module: ModuleKey }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, roles, isInitializing, hasPermission, logout } = useAuth();
  const [items, setItems] = useState<ApiItem[]>([]);
  const [supportingItems, setSupportingItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editing, setEditing] = useState<ApiItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [attachmentTicket, setAttachmentTicket] = useState("");
  const [attachments, setAttachments] = useState<ApiItem[]>([]);
  const [actionForm, setActionForm] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [details, setDetails] = useState<ApiItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const permissions = session?.permissions || [];
  const can = (permission?: string) => !permission || hasPermission(permission);
  const isAdmin = roles.includes("Admin");
  const selected = modules.find((item) => item.key === module) || modules[0];
  const isKnownModule = modules.some((item) => item.key === module);
  const allowed = can(selected.permission) && (!selected.admin || isAdmin);
  const canCreate = selected.key === "organizations"
    ? can("CREATE_ORGANIZATION")
    : selected.key === "projects"
      ? can("CREATE_PROJECT")
      : selected.key === "tasks"
        ? can("CREATE_TICKET")
        : selected.key === "roles" || selected.key === "permissions"
          ? isAdmin
          : false;
  const canUpdate = selected.key === "organizations"
    ? can("UPDATE_ORGANIZATION")
    : selected.key === "projects"
      ? can("UPDATE_PROJECT")
      : selected.key === "tasks"
        ? can("UPDATE_TICKET")
        : selected.key === "roles" || selected.key === "permissions"
          ? isAdmin
          : false;
  const canDelete = selected.key === "organizations"
    ? can("DELETE_ORGANIZATION")
    : selected.key === "projects"
      ? can("DELETE_PROJECT")
      : selected.key === "tasks"
        ? can("DELETE_TICKET")
        : selected.key === "users" || selected.key === "roles" || selected.key === "permissions"
          ? isAdmin
          : false;

  const resourceTitle =
    selected.key === "tasks" ? "Tasks & Tickets" : selected.label;

  const loadModule = async () => {
    if (!session || !allowed) return;
    setLoading(true);
    setNotice(null);
    try {
      const loaders: Record<ModuleKey, () => Promise<ApiItem[]>> = {
        organizations: workspaceService.getOrganizations,
        projects: workspaceService.getProjects,
        tasks: workspaceService.getTickets,
        users: workspaceService.getUsers,
        roles: workspaceService.getRoles,
        permissions: workspaceService.getPermissions,
        attachments: async () => [],
        profile: async () => [],
      };
      setItems(await loaders[selected.key]());
      if (selected.key === "projects" || selected.key === "tasks") {
        setSupportingItems(
          selected.key === "projects"
            ? await workspaceService.getOrganizations()
            : await workspaceService.getUsers(),
        );
      }
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message ||
            "We could not load this information."
          : "We could not load this information.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitializing) return;
    const timer = window.setTimeout(() => {
      void loadModule();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing, session, selected.key, allowed]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(normalized),
      ),
    );
  }, [items, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(
      selected.key === "organizations"
        ? { name: "", email: "", contactNo: "", theme: "" }
        : selected.key === "projects"
          ? {
              Name: "",
              Description: "",
              OrganizationID: String(supportingItems[0]?.OrganizationID || ""),
              OwnerID: String(session?.user.UserID || ""),
            }
          : selected.key === "tasks"
            ? {
                Title: "",
                Description: "",
                Status: "Ready to Do",
                Priority: "Medium",
                ProjectID: "",
              }
            : selected.key === "roles"
              ? { name: "" }
              : { name: "" },
    );
    setShowForm(true);
  };

  const openEdit = (item: ApiItem) => {
    setEditing(item);
    if (selected.key === "organizations")
      setForm({
        name: textOf(item, "Name"),
        email: textOf(item, "Email"),
        contactNo: textOf(item, "ContactNo"),
        theme: textOf(item, "Theme"),
      });
    if (selected.key === "projects")
      setForm({
        Name: textOf(item, "Name"),
        Description: textOf(item, "Description"),
        OrganizationID: textOf(item, "OrganizationID"),
        OwnerID: textOf(item, "OwnerID"),
      });
    if (selected.key === "tasks")
      setForm({
        Title: textOf(item, "Title"),
        Description: textOf(item, "Description"),
        Status: textOf(item, "Status"),
        Priority: textOf(item, "Priority"),
        ProjectID: textOf(item, "ProjectID"),
      });
    if (selected.key === "roles" || selected.key === "permissions")
      setForm({ name: textOf(item, "Name") });
    setShowForm(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (selected.key === "organizations") {
        if (editing)
          await workspaceService.updateOrganization(
            idOf(editing, "OrganizationID"),
            form,
          );
        else
          await workspaceService.createOrganization({
            ...form,
            ownerID: session?.user.UserID,
          });
      }
      if (selected.key === "projects") {
        const payload = {
          ...form,
          OrganizationID: Number(form.OrganizationID),
          OwnerID: Number(form.OwnerID),
        };
        if (editing)
          await workspaceService.updateProject(
            idOf(editing, "ProjectID"),
            payload,
          );
        else await workspaceService.createProject(payload);
      }
      if (selected.key === "tasks") {
        const payload = { ...form, ProjectID: Number(form.ProjectID) };
        if (editing)
          await workspaceService.updateTicket(idOf(editing, "TaskID"), payload);
        else
          await workspaceService.createTicket({
            ...payload,
            AssignedTo: session?.user.UserID,
          });
      }
      if (selected.key === "roles") {
        if (editing)
          await workspaceService.updateRole(idOf(editing, "RoleID"), form);
        else await workspaceService.createRole(form);
      }
      if (selected.key === "permissions") {
        if (editing)
          await workspaceService.updatePermission(
            idOf(editing, "PermissionID"),
            form,
          );
        else await workspaceService.createPermission(form);
      }
      setShowForm(false);
      setNotice({
        type: "success",
        text: `${resourceTitle} saved successfully.`,
      });
      await loadModule();
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message ||
            "The request could not be completed."
          : "The request could not be completed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const runSpecialAction = async (
    action:
      | "assign-member"
      | "remove-member"
      | "transfer-owner"
      | "assign-permission"
      | "remove-permission"
      | "assign-role"
      | "remove-role",
  ) => {
    setSaving(true);
    try {
      if (action === "assign-member")
        await workspaceService.assignOrganizationUser({
          organizationId: Number(actionForm.organizationId),
          userId: Number(actionForm.userId),
          role: actionForm.role,
        });
      if (action === "remove-member")
        await workspaceService.removeOrganizationUser({
          organizationId: Number(actionForm.organizationId),
          userId: Number(actionForm.userId),
        });
      if (action === "transfer-owner")
        await workspaceService.transferOrganizationOwner({
          organizationId: Number(actionForm.organizationId),
          newOwnerId: Number(actionForm.userId),
        });
      if (action === "assign-permission")
        await workspaceService.assignRolePermission({
          roleId: Number(actionForm.roleId),
          permissionName: actionForm.permissionName,
        });
      if (action === "remove-permission")
        await workspaceService.removeRolePermission({
          roleId: Number(actionForm.roleId),
          permissionId: Number(actionForm.permissionId || actionForm.userId),
        });
      if (action === "assign-role")
        await workspaceService.assignUserRole({
          userId: Number(actionForm.userId || actionForm.permissionId),
          roleId: Number(actionForm.roleId),
        });
      if (action === "remove-role")
        await workspaceService.removeUserRole({
          userId: Number(actionForm.userId || actionForm.permissionId),
          roleId: Number(actionForm.roleId),
        });
      setNotice({ type: "success", text: "Action completed successfully." });
      setActionForm({});
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Action could not be completed."
          : "Action could not be completed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const viewDetails = async (item: ApiItem) => {
    const itemId = idOf(
      item,
      selected.key === "organizations"
        ? "OrganizationID"
        : selected.key === "projects"
          ? "ProjectID"
          : selected.key === "tasks"
            ? "TaskID"
            : selected.key === "users"
              ? "UserID"
              : selected.key === "roles"
                ? "RoleID"
                : "PermissionID",
    );
    setDetailsLoading(true);
    try {
      const loaders: Partial<
        Record<ModuleKey, (id: number) => Promise<ApiItem>>
      > = {
        organizations: workspaceService.getOrganization,
        projects: workspaceService.getProject,
        tasks: workspaceService.getTicket,
        users: workspaceService.getUser,
        roles: workspaceService.getRole,
        permissions: workspaceService.getPermission,
      };
      const loader = loaders[selected.key];
      if (loader) setDetails(await loader(itemId));
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Details could not be loaded."
          : "Details could not be loaded.",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const remove = async (item: ApiItem) => {
    if (
      !window.confirm(
        `Delete this ${selected.key === "tasks" ? "task" : selected.key.slice(0, -1)}? This action cannot be undone.`,
      )
    )
      return;
    try {
      if (selected.key === "organizations")
        await workspaceService.deleteOrganization(idOf(item, "OrganizationID"));
      if (selected.key === "projects")
        await workspaceService.deleteProject(idOf(item, "ProjectID"));
      if (selected.key === "tasks")
        await workspaceService.deleteTicket(idOf(item, "TaskID"));
      if (selected.key === "users")
        await workspaceService.deleteUser(idOf(item, "UserID"));
      if (selected.key === "roles")
        await workspaceService.deleteRole(idOf(item, "RoleID"));
      if (selected.key === "permissions")
        await workspaceService.deletePermission(idOf(item, "PermissionID"));
      setNotice({ type: "success", text: "Deleted successfully." });
      await loadModule();
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Delete failed."
          : "Delete failed.",
      });
    }
  };

  const loadAttachments = async () => {
    if (!attachmentTicket) return;
    try {
      setAttachments(
        await workspaceService.getAttachments(Number(attachmentTicket)),
      );
    } catch {
      setNotice({ type: "error", text: "Attachments could not be loaded." });
    }
  };

  const iconFor = (key: ModuleKey) =>
    modules.find((item) => item.key === key)?.icon;

  if (!isKnownModule) {
    return (
      <main className="workspace-main">
        <section className="access-denied">
          <span>404</span>
          <h2>Page Not Found</h2>
          <p>This workspace module does not exist.</p>
          <Link to="/dashboard">Return to dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <div className="workspace-shell">
      {sidebarOpen && (
        <button
          className="workspace-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`workspace-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/dashboard" className="workspace-brand">
          <span>✓</span>
          <strong>Task Management</strong>
        </Link>
        <div className="workspace-nav-group">
          <small>WORKSPACE</small>
          <Link
            to="/dashboard"
            className={`workspace-nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            ▦ Dashboard
          </Link>
          {modules.slice(0, 3).map((item) => (
            <Link
              key={item.key}
              to={`/workspace/${item.key}`}
              className={`workspace-nav-item ${module === item.key ? "active" : ""} ${!can(item.permission) || (item.admin && !isAdmin) ? "locked" : ""}`}
              onClick={(event) => {
                if (!can(item.permission) || (item.admin && !isAdmin)) {
                  event.preventDefault();
                  setNotice({
                    type: "error",
                    text: "Access Denied: you do not have permission to access this feature.",
                  });
                }
              }}
            >
              {item.icon} {item.label}
              {(!can(item.permission) || (item.admin && !isAdmin)) && (
                <span>🔒</span>
              )}
            </Link>
          ))}
        </div>
        <div className="workspace-nav-group">
          <small>ADMINISTRATION</small>
          {modules.slice(3).map((item) => (
            <Link
              key={item.key}
              to={`/workspace/${item.key}`}
              className={`workspace-nav-item ${module === item.key ? "active" : ""} ${!can(item.permission) || (item.admin && !isAdmin) ? "locked" : ""}`}
              onClick={(event) => {
                if (!can(item.permission) || (item.admin && !isAdmin)) {
                  event.preventDefault();
                  setNotice({
                    type: "error",
                    text: "Access Denied: administrator access is required.",
                  });
                }
              }}
            >
              {item.icon} {item.label}
              {(!can(item.permission) || (item.admin && !isAdmin)) && (
                <span>🔒</span>
              )}
            </Link>
          ))}
        </div>
        <button
          className="workspace-logout"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          ↪ Sign out
        </button>
      </aside>
      <main className="workspace-main">
        <header className="workspace-header">
          <button
            className="workspace-menu-button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div>
            <span className="eyebrow">Workspace / {resourceTitle}</span>
            <h1>{resourceTitle}</h1>
            <p>
              Manage your team data with the access granted to your account.
            </p>
          </div>
          <div className="workspace-user">
            <span>{session?.user.Name?.charAt(0).toUpperCase() || "U"}</span>
            <div>
              <strong>{session?.user.Name || "Loading"}</strong>
              <small>{session?.roles.join(" / ") || "Member"}</small>
            </div>
          </div>
        </header>
        {notice && (
          <div className={`workspace-notice ${notice.type}`} role="alert">
            <span>
              {notice.type === "success" ? "✓" : "!"} {notice.text}
            </span>
            <button onClick={() => setNotice(null)}>×</button>
          </div>
        )}
        {!allowed ? (
          <section className="access-denied">
            <span>🔒</span>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this feature.</p>
            <Link to="/dashboard">Return to dashboard</Link>
          </section>
        ) : selected.key === "profile" ? (
          <section className="profile-panel">
            <div className="profile-avatar">
              {session?.user.Name?.charAt(0).toUpperCase()}
            </div>
            <h2>{session?.user.Name}</h2>
            <p>{session?.user.Email}</p>
            <div className="profile-tags">
              {session?.roles.map((role) => (
                <span key={role}>{role}</span>
              ))}
            </div>
            <h3>Effective permissions</h3>
            <div className="permission-cloud">
              {permissions.map((permission) => (
                <span key={permission}>{permission}</span>
              ))}
            </div>
          </section>
        ) : selected.key === "attachments" ? (
          <section className="workspace-panel">
            <div className="toolbar">
              <div>
                <h2>Ticket attachments</h2>
                <p>Upload and inspect images connected to a ticket.</p>
              </div>
              <div className="inline-form">
                <input
                  type="number"
                  placeholder="Ticket ID"
                  value={attachmentTicket}
                  onChange={(event) => setAttachmentTicket(event.target.value)}
                />
                <button
                  className="button secondary"
                  onClick={() => void loadAttachments()}
                >
                  Load
                </button>
              </div>
            </div>
            <div className="attachment-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file && attachmentTicket)
                    void workspaceService
                      .uploadAttachment(Number(attachmentTicket), file)
                      .then(() => {
                        setNotice({
                          type: "success",
                          text: "Attachment uploaded successfully.",
                        });
                        return loadAttachments();
                      })
                      .catch(() =>
                        setNotice({
                          type: "error",
                          text: "Attachment upload failed.",
                        }),
                      );
                }}
              />
              <span>Upload an image for the selected ticket</span>
            </div>
            <div className="attachment-grid">
              {attachments.map((attachment) => (
                <div
                  className="attachment-card"
                  key={idOf(attachment, "AttachmentID")}
                >
                  <strong>{textOf(attachment, "FileName")}</strong>
                  <a
                    href={textOf(attachment, "FileUrl")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open preview
                  </a>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="workspace-panel">
            <div className="toolbar">
              <div>
                <h2>{resourceTitle} directory</h2>
                <p>
                  {filteredItems.length} of {items.length} records
                </p>
              </div>
              <div className="toolbar-actions">
                <input
                  className="search-input"
                  placeholder={`Search ${resourceTitle.toLowerCase()}...`}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {[
                  "organizations",
                  "projects",
                  "tasks",
                  "roles",
                  "permissions",
                ].includes(selected.key) && canCreate && (
                  <button className="button primary" onClick={openCreate}>
                    + Add{" "}
                    {selected.key === "tasks"
                      ? "Task"
                      : selected.key.slice(0, -1)}
                  </button>
                )}
              </div>
            </div>
            {(selected.key === "organizations" || selected.key === "roles") && (
              <div className="action-strip">
                <input
                  placeholder="Record ID"
                  value={actionForm.organizationId || actionForm.roleId || ""}
                  onChange={(event) =>
                    setActionForm({
                      ...actionForm,
                      [selected.key === "organizations"
                        ? "organizationId"
                        : "roleId"]: event.target.value,
                    })
                  }
                />
                <input
                  placeholder="User / permission ID"
                  value={actionForm.userId || actionForm.permissionId || ""}
                  onChange={(event) =>
                    setActionForm({
                      ...actionForm,
                      [selected.key === "organizations"
                        ? "userId"
                        : "permissionId"]: event.target.value,
                    })
                  }
                />
                <input
                  placeholder="Role / permission name"
                  value={actionForm.role || actionForm.permissionName || ""}
                  onChange={(event) =>
                    setActionForm({
                      ...actionForm,
                      [selected.key === "organizations"
                        ? "role"
                        : "permissionName"]: event.target.value,
                    })
                  }
                />
                <button
                  className="button secondary"
                  disabled={saving || (selected.key === "organizations" && !can("ASSIGN_USER"))}
                  onClick={() =>
                    void runSpecialAction(
                      selected.key === "organizations"
                        ? "assign-member"
                        : "assign-permission",
                    )
                  }
                >
                  Assign
                </button>
                <button
                  className="button secondary"
                  disabled={saving || (selected.key === "organizations" && !can("TRANSFER_OWNER"))}
                  onClick={() =>
                    void runSpecialAction(
                      selected.key === "organizations"
                        ? "transfer-owner"
                        : "remove-permission",
                    )
                  }
                >
                  Transfer / Remove
                </button>
                {selected.key === "organizations" && (
                  <button
                    className="button secondary"
                    disabled={saving || !can("REMOVE_USER")}
                    onClick={() => void runSpecialAction("remove-member")}
                  >
                    Remove member
                  </button>
                )}
                {selected.key === "roles" && (
                  <>
                    <button
                      className="button secondary"
                      disabled={saving || !isAdmin}
                      onClick={() => void runSpecialAction("assign-role")}
                    >
                      Assign to user
                    </button>
                    <button
                      className="button secondary"
                      disabled={saving || !isAdmin}
                      onClick={() => void runSpecialAction("remove-role")}
                    >
                      Remove from user
                    </button>
                  </>
                )}
              </div>
            )}
            {selected.key === "tasks" && (
              <div className="action-strip">
                <input
                  type="number"
                  placeholder="Task ID"
                  value={actionForm.taskId || ""}
                  onChange={(event) =>
                    setActionForm({ ...actionForm, taskId: event.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="User ID"
                  value={actionForm.userId || ""}
                  onChange={(event) =>
                    setActionForm({ ...actionForm, userId: event.target.value })
                  }
                />
                <button
                  className="button secondary"
                  disabled={saving || !can("ASSIGN_TICKET")}
                  onClick={() => {
                    setSaving(true);
                    void workspaceService
                      .assignTicket(Number(actionForm.taskId), Number(actionForm.userId))
                      .then(() => {
                        setNotice({ type: "success", text: "Task assigned successfully." });
                        return loadModule();
                      })
                      .catch((error: unknown) =>
                        setNotice({
                          type: "error",
                          text: axios.isAxiosError(error)
                            ? error.response?.data?.message || "Task assignment failed."
                            : "Task assignment failed.",
                        }),
                      )
                      .finally(() => setSaving(false));
                  }}
                >
                  Assign task
                </button>
              </div>
            )}
            {loading ? (
              <div className="workspace-empty">
                Loading {resourceTitle.toLowerCase()}...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="workspace-empty">
                <span>{iconFor(selected.key)}</span>
                <h3>No {resourceTitle.toLowerCase()} found</h3>
                <p>Try a different search or add a new record.</p>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name / title</th>
                      <th>Details</th>
                      <th>Owner / status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const itemId = idOf(
                        item,
                        selected.key === "organizations"
                          ? "OrganizationID"
                          : selected.key === "projects"
                            ? "ProjectID"
                            : selected.key === "tasks"
                              ? "TaskID"
                              : selected.key === "users"
                                ? "UserID"
                                : selected.key === "roles"
                                  ? "RoleID"
                                  : "PermissionID",
                      );
                      const name = textOf(
                        item,
                        selected.key === "tasks" ? "Title" : "Name",
                      );
                      const editable = canUpdate;
                      const removable = canDelete;
                      return (
                        <tr key={itemId}>
                          <td>
                            <strong>{name || "Untitled"}</strong>
                            <small>#{itemId}</small>
                          </td>
                          <td>
                            {textOf(
                              item,
                              selected.key === "organizations"
                                ? "Email"
                                : selected.key === "tasks"
                                  ? "Description"
                                  : selected.key === "projects"
                                    ? "Description"
                                    : "ContactNo",
                            ) || "—"}
                          </td>
                          <td>
                            <span className="table-badge">
                              {textOf(
                                item,
                                selected.key === "tasks"
                                  ? "Status"
                                  : selected.key === "organizations"
                                    ? "Theme"
                                    : "Email",
                              ) || "Active"}
                            </span>
                          </td>
                          <td className="table-actions">
                            {selected.key !== "attachments" && (
                              <button onClick={() => void viewDetails(item)}>
                                View
                              </button>
                            )}
                            {editable && (
                              <button onClick={() => openEdit(item)}>
                                Edit
                              </button>
                            )}
                            {removable && (
                              <button
                                className="danger-link"
                                onClick={() => void remove(item)}
                              >
                                Delete
                              </button>
                            )}
                            {selected.key === "tasks" && (
                              <button
                                onClick={() => {
                                  setAttachmentTicket(String(itemId));
                                  navigate("/workspace/attachments");
                                }}
                              >
                                Files
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {details && (
          <div className="modal-backdrop">
            <section className="workspace-modal detail-modal">
              <div className="modal-title">
                <div>
                  <span className="eyebrow">{resourceTitle}</span>
                  <h2>{detailsLoading ? "Loading details..." : "Details"}</h2>
                </div>
                <button type="button" onClick={() => setDetails(null)}>
                  ×
                </button>
              </div>
              {detailsLoading ? (
                <div className="workspace-empty">Loading details...</div>
              ) : (
                <div className="detail-grid">
                  {Object.entries(details)
                    .filter(([key]) => key !== "Password")
                    .map(([key, value]) => (
                      <div key={key}>
                        <small>{key}</small>
                        <strong>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value ?? "—")}
                        </strong>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </div>
        )}
        {showForm && (
          <div className="modal-backdrop">
            <form className="workspace-modal" onSubmit={save}>
              <div className="modal-title">
                <div>
                  <span className="eyebrow">{resourceTitle}</span>
                  <h2>{editing ? "Edit record" : "Create record"}</h2>
                </div>
                <button type="button" onClick={() => setShowForm(false)}>
                  ×
                </button>
              </div>
              {Object.entries(form).map(([key, value]) =>
                key === "Description" ? (
                  <label key={key}>
                    {key}
                    <textarea
                      value={value}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                    />{" "}
                  </label>
                ) : key === "Status" ? (
                  <label key={key}>
                    {key}
                    <select
                      value={value}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                    >
                      <option>Ready to Do</option>
                      <option>In Progress</option>
                      <option>Blocked</option>
                      <option>Testing</option>
                      <option>Done</option>
                    </select>
                  </label>
                ) : key === "Priority" ? (
                  <label key={key}>
                    {key}
                    <select
                      value={value}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>
                ) : (
                  <label key={key}>
                    {key}
                    <input
                      required={key !== "OwnerID"}
                      type={
                        key.toLowerCase().includes("id")
                          ? "number"
                          : key === "email"
                            ? "email"
                            : "text"
                      }
                      value={value}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                    />
                  </label>
                ),
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="button primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Workspace;
