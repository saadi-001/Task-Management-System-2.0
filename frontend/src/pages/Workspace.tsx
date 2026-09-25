import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import { workspaceService, type ApiItem } from "../services/workspaceService";
import { useAuth } from "../context/useAuth";
import AppSidebar from "../components/AppSidebar";
import ConfirmModal from "../components/ConfirmModal";

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
  { key: "users", label: "Users", icon: "◉", permission: "VIEW_USER" },
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

const getStatusBadgeClass = (status?: string) => {
  const s = (status || "").toLowerCase().trim().replace(/\s+/g, "-");
  return `status-${s}`;
};

const getPriorityBadgeClass = (priority?: string) => {
  const p = (priority || "").toLowerCase().trim();
  return `priority-${p}`;
};

const getRoleBadgeClass = (role?: string) => {
  const r = (role || "").toLowerCase().trim().replace(/[\s_]+/g, "-");
  return `role-${r}`;
};

const PaperclipIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m21.4 11.6-8.8 8.8a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.6-8.6" />
  </svg>
);

const PlusIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const displayNumber = (
  item: ApiItem,
  key: string,
  list: ApiItem[],
) => {
  const index = list.findIndex(
    (entry) => Number(entry[key]) === Number(item[key]),
  );

  return index >= 0 ? index + 1 : Number(item[key]);
};

const userRolesOf = (item: ApiItem): string[] => {
  const raw = item.Roles ?? item.Role ?? item.UserRoles ?? [];

  const values = Array.isArray(raw) ? raw : [raw];

  return values
    .map((role) => {
      if (typeof role === "string") return role;
      if (!role || typeof role !== "object") return "";

      const value = role as Record<string, unknown>;

      if (typeof value.Name === "string") return value.Name;
      if (typeof value.RoleName === "string") return value.RoleName;

      const nestedRole = value.Role;
      if (nestedRole && typeof nestedRole === "object") {
        const nested = nestedRole as Record<string, unknown>;
        if (typeof nested.Name === "string") return nested.Name;
        if (typeof nested.RoleName === "string") return nested.RoleName;
      }

      return "";
    })
    .map((role) => role.trim())
    .filter(Boolean);
};

const Workspace = () => {
  const { module = "organizations" } = useParams<{ module: ModuleKey }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, roles, isInitializing, hasPermission } = useAuth();
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
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentTask, setAttachmentTask] = useState<ApiItem | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [actionForm, setActionForm] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (window.innerWidth <= 800) {
      document.body.style.overflow = sidebarOpen ? "hidden" : "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const [details, setDetails] = useState<ApiItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [relatedProjects, setRelatedProjects] = useState<ApiItem[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ApiItem[]>([]);
  const [organizationProjectFormOpen, setOrganizationProjectFormOpen] = useState(false);
  const [organizationProjectForm, setOrganizationProjectForm] = useState({
    Name: "",
    Description: "",
    OwnerID: String(session?.user.UserID || ""),
  });
  const [linkProjectFormOpen, setLinkProjectFormOpen] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<ApiItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    action: () => Promise<void> | void;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleConfirmDialog = async () => {
    if (!confirmDialog) return;
    setConfirmLoading(true);
    try {
      await confirmDialog.action();
      setConfirmDialog(null);
    } finally {
      setConfirmLoading(false);
    }
  };
  const [linkProjectLoading, setLinkProjectLoading] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState("All");
  const [projectTaskFormOpen, setProjectTaskFormOpen] = useState(false);
  const [projectTaskForm, setProjectTaskForm] = useState({
    Title: "",
    Description: "",
    Status: "Ready to Do",
    Priority: "Medium",
  });
  const [projectContext, setProjectContext] = useState<ApiItem | null>(null);
  const [userTasks, setUserTasks] = useState<ApiItem[]>([]);
  const [userTasksUser, setUserTasksUser] = useState<ApiItem | null>(null);
  const [userTasksLoading, setUserTasksLoading] = useState(false);

  const permissions = session?.permissions || [];
  const can = (permission?: string) => !permission || hasPermission(permission);
  const isAdmin = roles.includes("Admin");
  const selected = modules.find((item) => item.key === module) || modules[0];
  const isKnownModule = modules.some((item) => item.key === module);
  const allowed = selected.key === "users"
    ? isAdmin || can("VIEW_USER")
    : can(selected.permission) && (!selected.admin || isAdmin);
  const projectIdFromUrl = useMemo(() => {
    if (selected.key !== "tasks" && selected.key !== "projects") return null;

    const value = new URLSearchParams(location.search).get("projectId");
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
  }, [location.search, selected.key]);
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

  const canEditUser = (item: ApiItem) =>
    isAdmin || idOf(item, "UserID") === Number(session?.user.UserID);

  const resourceTitle =
    selected.key === "tasks" ? "Tasks & Tickets" : selected.label;

  const loadModule = async () => {
    if (!session || !allowed) return;
    setLoading(true);
    setNotice(null);
    setRelatedProjects([]);
    setRelatedTasks([]);
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
      let loadedItems: ApiItem[];

      if (projectIdFromUrl && (selected.key === "projects" || selected.key === "tasks")) {
        const project = await workspaceService.getProject(projectIdFromUrl);
        setProjectContext(project);

        loadedItems =
          selected.key === "tasks"
            ? await workspaceService.getTicketsByProjectId(projectIdFromUrl)
            : [project];

        const projectTasks =
          await workspaceService.getTicketsByProjectId(projectIdFromUrl);
        setRelatedTasks(projectTasks);
      } else {
        setProjectContext(null);
        loadedItems = await loaders[selected.key]();
      }

      setItems(loadedItems);

      if (selected.key === "projects") {
        setSupportingItems(await workspaceService.getOrganizations());
      } else if (selected.key === "tasks") {
        // User data is only needed for task-assignment controls.
        // A member without VIEW_USER can still use the Tasks page.
        if (can("VIEW_USER")) {
          try {
            setSupportingItems(
              (await workspaceService.getUsers()).filter(
                (user) => user.IsActive !== false,
              ),
            );
          } catch {
            // Do not show an access-denied notice just because optional
            // user-assignment data is unavailable.
            setSupportingItems([]);
          }
        } else {
          setSupportingItems([]);
        }
      } else {
        setSupportingItems([]);
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
  }, [isInitializing, session, selected.key, allowed, location.search, projectIdFromUrl]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !normalized ||
        (selected.key === "users"
          ? textOf(item, "Name").toLowerCase().includes(normalized)
          : Object.values(item).some((value) =>
              String(value).toLowerCase().includes(normalized),
            ));

      const matchesStatus =
        selected.key !== "tasks" ||
        taskStatusFilter === "All" ||
        textOf(item, "Status") === taskStatusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, selected.key, taskStatusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormErrors({});
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
                ProjectID: projectIdFromUrl ? String(projectIdFromUrl) : "",
              }
            : selected.key === "roles"
              ? { name: "" }
              : { name: "" },
    );
    setShowForm(true);
  };

  const openEdit = (item: ApiItem) => {
    setEditing(item);
    setFormErrors({});
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
    if (selected.key === "users")
      setForm({
        Name: textOf(item, "Name"),
        Email: textOf(item, "Email"),
      });
    if (selected.key === "roles" || selected.key === "permissions")
      setForm({ name: textOf(item, "Name") });
    setShowForm(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (selected.key === "organizations") {
      if (!form.name?.trim()) errors.name = "Organization name is required.";
      if (!form.email?.trim()) errors.email = "Contact email is required.";
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Please enter a valid email address.";
    }
    if (selected.key === "projects") {
      if (!form.Name?.trim()) errors.Name = "Project name is required.";
      if (!form.OrganizationID) errors.OrganizationID = "Organization ID is required.";
    }
    if (selected.key === "tasks") {
      if (!form.Title?.trim()) errors.Title = "Task title is required.";
      if (!form.ProjectID) errors.ProjectID = "Project ID is required.";
    }
    if (selected.key === "users" && editing) {
      if (!form.Name?.trim()) errors.Name = "User name is required.";
      if (!form.Email?.trim()) errors.Email = "Email address is required.";
      else if (!/^\S+@\S+\.\S+$/.test(form.Email.trim())) errors.Email = "Please enter a valid email address.";
    }
    if (selected.key === "roles" || selected.key === "permissions") {
      if (!form.name?.trim()) errors.name = `${resourceTitle} name is required.`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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
      if (selected.key === "users" && editing) {
        const name = String(form.Name || "").trim();
        const email = String(form.Email || "").trim();

        if (!name || !email) {
          setFormErrors({ general: "Name and email are required." });
          setSaving(false);
          return;
        }

        await workspaceService.updateUser(
          idOf(editing, "UserID"),
          {
            Name: name,
            Email: email,
          },
        );
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
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          "The request could not be completed."
        : "The request could not be completed.";
      setFormErrors({ general: errMsg });
      setNotice({
        type: "error",
        text: errMsg,
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
    const isDestructive =
      action === "remove-member" ||
      action === "remove-role" ||
      action === "remove-permission" ||
      action === "transfer-owner";

    const executeAction = async () => {
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
            permissionId: Number(
              actionForm.permissionId || actionForm.userId,
            ),
          });

        if (action === "assign-role" || action === "remove-role") {
          const roleNumber = Number(actionForm.roleId);
          const userNumber = Number(
            actionForm.userId || actionForm.permissionId,
          );

          if (!Number.isInteger(roleNumber) || roleNumber < 1) {
            throw new Error("Please enter a valid Role #.");
          }

          if (!Number.isInteger(userNumber) || userNumber < 1) {
            throw new Error("Please enter a valid User #.");
          }

          // The UI shows sequential numbers (#1, #2, ...), while the API
          // still receives the real RoleID/UserID from the database.
          const selectedRole = items[roleNumber - 1];

          if (!selectedRole) {
            throw new Error("That Role # does not exist in the current list.");
          }

          const roleId = idOf(selectedRole, "RoleID");

          const users = await workspaceService.getUsers();
          const selectedUser = users[userNumber - 1];

          if (!selectedUser) {
            throw new Error("That User # does not exist in the current list.");
          }

          const userId = idOf(selectedUser, "UserID");

          if (action === "assign-role") {
            await workspaceService.assignUserRole({
              userId,
              roleId,
            });
          } else {
            await workspaceService.removeUserRole({
              userId,
              roleId,
            });
          }
        }

        setActionForm({});
        setNotice({
          type: "success",
          text:
            action === "assign-role"
              ? "Role assigned to user successfully."
              : action === "remove-role"
                ? "Role removed from user successfully."
                : "Action completed successfully.",
        });

        await loadModule();
      } catch (error: unknown) {
        setNotice({
          type: "error",
          text:
            axios.isAxiosError(error)
              ? error.response?.data?.message ||
                "Action could not be completed."
              : error instanceof Error
                ? error.message
                : "Action could not be completed.",
        });
      } finally {
        setSaving(false);
      }
    };

    if (isDestructive) {
      setConfirmDialog({
        isOpen: true,
        title:
          action === "remove-member"
            ? "Remove Member"
            : action === "remove-role"
              ? "Remove Role"
              : action === "transfer-owner"
                ? "Transfer Ownership"
                : "Remove Permission",
        message:
          action === "transfer-owner"
            ? "Transfer ownership of this organization to the specified user? You will yield primary owner control."
            : `Are you sure you want to perform this ${action.replace("-", " ")} action?`,
        confirmText: action === "transfer-owner" ? "Transfer" : "Remove",
        action: executeAction,
      });
      return;
    }

    await executeAction();
  };

  const viewUserTasks = async (user: ApiItem) => {
    const userId = idOf(user, "UserID");

    setUserTasksUser(user);
    setUserTasks([]);
    setUserTasksLoading(true);

    try {
      const tasks = await workspaceService.getUserTasks(userId);
      setUserTasks(tasks);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message ||
            "User tasks could not be loaded."
          : "User tasks could not be loaded.",
      });
      setUserTasksUser(null);
    } finally {
      setUserTasksLoading(false);
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
    setRelatedProjects([]);
    setRelatedTasks([]);

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

      if (loader) {
        const loadedDetails = await loader(itemId);
        setDetails(loadedDetails);

        if (selected.key === "organizations") {
          const projects =
            await workspaceService.getProjectsByOrganizationId(itemId);

          setRelatedProjects(projects);
        }

        if (selected.key === "projects") {
          const tasks =
            await workspaceService.getTicketsByProjectId(itemId);

          setRelatedTasks(tasks);
        }
      }
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

  const openOrganizationProjectForm = () => {
    if (!details) return;

    setOrganizationProjectForm({
      Name: "",
      Description: "",
      OwnerID: String(session?.user.UserID || ""),
    });
    setOrganizationProjectFormOpen(true);
  };

  const createProjectFromOrganization = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!details) return;

    setSaving(true);

    try {
      await workspaceService.createProject({
        Name: organizationProjectForm.Name.trim(),
        Description: organizationProjectForm.Description || null,
        OrganizationID: idOf(details, "OrganizationID"),
        OwnerID: Number(organizationProjectForm.OwnerID),
      });

      setOrganizationProjectFormOpen(false);
      setNotice({
        type: "success",
        text: "Project added to organization successfully.",
      });

      const projects = await workspaceService.getProjectsByOrganizationId(
        idOf(details, "OrganizationID"),
      );
      setRelatedProjects(projects);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Project could not be created."
          : "Project could not be created.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openLinkProjectForm = async () => {
    if (!details) return;

    setLinkProjectLoading(true);

    try {
      const projects = await workspaceService.getProjects();

      setAvailableProjects(
        projects.filter((project) => {
          const organizationId = project.OrganizationID;

          return (
            organizationId === null ||
            organizationId === undefined ||
            organizationId === "" ||
            Number(organizationId) === 0
          );
        }),
      );

      setLinkProjectFormOpen(true);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Projects could not be loaded."
          : "Projects could not be loaded.",
      });
    } finally {
      setLinkProjectLoading(false);
    }
  };

  const linkExistingProject = async (project: ApiItem) => {
    if (!details) return;

    const projectId = idOf(project, "ProjectID");
    const organizationId = idOf(details, "OrganizationID");

    setSaving(true);

    try {
      await workspaceService.linkProjectToOrganization(
        projectId,
        organizationId,
      );

      setLinkProjectFormOpen(false);
      setNotice({
        type: "success",
        text: "Project linked to organization successfully.",
      });

      const projects = await workspaceService.getProjectsByOrganizationId(
        organizationId,
      );
      setRelatedProjects(projects);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Project could not be linked."
          : "Project could not be linked.",
      });
    } finally {
      setSaving(false);
    }
  };

  const unlinkProjectFromOrganization = (project: ApiItem) => {
    if (!details) return;
    const projectId = idOf(project, "ProjectID");
    const projName = textOf(project, "Name") || "this project";

    setConfirmDialog({
      isOpen: true,
      title: "Unlink Project",
      message: `Are you sure you want to unlink "${projName}" from this organization?`,
      confirmText: "Unlink",
      action: async () => {
        setSaving(true);
        try {
          await workspaceService.unlinkProjectFromOrganization(projectId);
          setNotice({
            type: "success",
            text: "Project unlinked from organization successfully.",
          });
          const projects = await workspaceService.getProjectsByOrganizationId(
            idOf(details, "OrganizationID"),
          );
          setRelatedProjects(projects);
        } catch (error: unknown) {
          setNotice({
            type: "error",
            text: axios.isAxiosError(error)
              ? error.response?.data?.message || "Project could not be unlinked."
              : "Project could not be unlinked.",
          });
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const deleteProjectFromOrganization = (project: ApiItem) => {
    const projectName = textOf(project, "Name") || "this project";

    setConfirmDialog({
      isOpen: true,
      title: "Delete Project",
      message: `Delete "${projectName}" permanently? This will delete the project and cannot be undone.`,
      confirmText: "Delete Project",
      action: async () => {
        setSaving(true);
        try {
          await workspaceService.deleteProject(idOf(project, "ProjectID"));
          setNotice({
            type: "success",
            text: "Project deleted successfully.",
          });
          if (details) {
            const projects = await workspaceService.getProjectsByOrganizationId(
              idOf(details, "OrganizationID"),
            );
            setRelatedProjects(projects);
          }
        } catch (error: unknown) {
          setNotice({
            type: "error",
            text: axios.isAxiosError(error)
              ? error.response?.data?.message || "Project could not be deleted."
              : "Project could not be deleted.",
          });
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const viewProjectFromOrganization = (project: ApiItem) => {
    const projectId = idOf(project, "ProjectID");

    setDetails(null);
    setRelatedProjects([]);
    setRelatedTasks([]);
    setTaskStatusFilter("All");
    setQuery("");

    navigate(`/workspace/projects?projectId=${projectId}`);
  };

  const openProjectTaskForm = () => {
    if (!projectIdFromUrl) return;

    setProjectTaskForm({
      Title: "",
      Description: "",
      Status: "Ready to Do",
      Priority: "Medium",
    });
    setProjectTaskFormOpen(true);
  };

  const createTaskFromProject = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!projectIdFromUrl) return;

    setSaving(true);

    try {
      await workspaceService.createTicket({
        ...projectTaskForm,
        ProjectID: projectIdFromUrl,
        AssignedTo: session?.user.UserID,
      });

      setProjectTaskFormOpen(false);
      setNotice({
        type: "success",
        text: "Task created successfully. Opening Tasks & Tickets...",
      });

      navigate(`/workspace/tasks?projectId=${projectIdFromUrl}`);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Task could not be created."
          : "Task could not be created.",
      });
    } finally {
      setSaving(false);
    }
  };

  const activate = (item: ApiItem) => {
    const userName = textOf(item, "Name") || "this user";
    setConfirmDialog({
      isOpen: true,
      title: "Activate User",
      message: `Are you sure you want to activate ${userName}?`,
      confirmText: "Activate",
      action: async () => {
        try {
          await workspaceService.activateUser(idOf(item, "UserID"));

          setNotice({
            type: "success",
            text: "User activated successfully.",
          });

          await loadModule();
        } catch (error: unknown) {
          setNotice({
            type: "error",
            text: axios.isAxiosError(error)
              ? error.response?.data?.message || "Activation failed."
              : "Activation failed.",
          });
        }
      },
    });
  };

  const remove = (item: ApiItem) => {
    const isUser = selected.key === "users";
    const title = isUser
      ? "Deactivate User"
      : `Delete ${selected.key === "tasks" ? "Task" : selected.key.slice(0, -1)}`;
    const message = isUser
      ? "Are you sure you want to deactivate this user? Their activity history will be preserved."
      : `Delete this ${selected.key === "tasks" ? "task" : selected.key.slice(0, -1)}? This action cannot be undone.`;

    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText: isUser ? "Deactivate" : "Delete",
      action: async () => {
        try {
          if (selected.key === "organizations")
            await workspaceService.deleteOrganization(
              idOf(item, "OrganizationID"),
            );

          if (selected.key === "projects")
            await workspaceService.deleteProject(
              idOf(item, "ProjectID"),
            );

          if (selected.key === "tasks")
            await workspaceService.deleteTicket(
              idOf(item, "TaskID"),
            );

          if (selected.key === "users")
            await workspaceService.deleteUser(
              idOf(item, "UserID"),
            );

          if (selected.key === "roles")
            await workspaceService.deleteRole(
              idOf(item, "RoleID"),
            );

          if (selected.key === "permissions")
            await workspaceService.deletePermission(
              idOf(item, "PermissionID"),
            );

          setNotice({
            type: "success",
            text: isUser
              ? "User deactivated successfully."
              : "Deleted successfully.",
          });

          await loadModule();
        } catch (error: unknown) {
          setNotice({
            type: "error",
            text: axios.isAxiosError(error)
              ? error.response?.data?.message || "Delete failed."
              : "Delete failed.",
          });
        }
      },
    });
  };

  const loadAttachments = async (taskId?: number) => {
    const id = taskId ?? Number(attachmentTicket);
    if (!id) return;

    setAttachmentLoading(true);
    try {
      setAttachments(await workspaceService.getAttachments(id));
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Attachments could not be loaded."
          : "Attachments could not be loaded.",
      });
    } finally {
      setAttachmentLoading(false);
    }
  };

  const openTaskAttachments = async (task: ApiItem) => {
    const taskId = idOf(task, "TaskID");

    setAttachmentTask(task);
    setAttachmentTicket(String(taskId));
    setAttachmentFile(null);
    setAttachmentModalOpen(true);
    await loadAttachments(taskId);
  };

  const uploadTaskAttachment = async () => {
    if (!attachmentTask || !attachmentFile) return;

    const taskId = idOf(attachmentTask, "TaskID");
    setAttachmentLoading(true);

    try {
      await workspaceService.uploadAttachment(taskId, attachmentFile);
      setAttachmentFile(null);
      setNotice({
        type: "success",
        text: "Attachment uploaded successfully.",
      });
      await loadAttachments(taskId);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Attachment upload failed."
          : "Attachment upload failed.",
      });
      setAttachmentLoading(false);
    }
  };

  const deleteTaskAttachment = (attachment: ApiItem) => {
    if (!attachmentTask) return;

    const taskId = idOf(attachmentTask, "TaskID");
    const attachmentId = idOf(attachment, "AttachmentID");
    const fileName = textOf(attachment, "FileName") || "this attachment";

    setConfirmDialog({
      isOpen: true,
      title: "Delete Attachment",
      message: `Delete "${fileName}" permanently? This file cannot be recovered.`,
      confirmText: "Delete Attachment",
      action: async () => {
        setAttachmentLoading(true);
        try {
          await workspaceService.deleteAttachment(taskId, attachmentId);
          setNotice({
            type: "success",
            text: "Attachment deleted successfully.",
          });
          await loadAttachments(taskId);
        } catch (error: unknown) {
          setNotice({
            type: "error",
            text: axios.isAxiosError(error)
              ? error.response?.data?.message || "Attachment delete failed."
              : "Attachment delete failed.",
          });
        } finally {
          setAttachmentLoading(false);
        }
      },
    });
  };

  const openAttachmentFile = async (attachment: ApiItem) => {
    const fileUrl = textOf(attachment, "FileUrl");

    if (!fileUrl) {
      setNotice({
        type: "error",
        text: "Attachment file URL is missing.",
      });
      return;
    }

    try {
      setAttachmentLoading(true);

      // Use the authenticated Axios client so the JWT is sent
      // to the protected backend attachment endpoint.
      const response = await api.get(
        fileUrl.startsWith("/api/")
          ? fileUrl.substring(4)
          : fileUrl,
        {
          responseType: "blob",
        },
      );

      const blobUrl = window.URL.createObjectURL(response.data);
      const newWindow = window.open(blobUrl, "_blank");

      if (!newWindow) {
        window.URL.revokeObjectURL(blobUrl);
        setNotice({
          type: "error",
          text: "The browser blocked the attachment window. Please allow pop-ups.",
        });
        return;
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60_000);
    } catch (error: unknown) {
      setNotice({
        type: "error",
        text: axios.isAxiosError(error)
          ? error.response?.data?.message || "Attachment could not be opened."
          : "Attachment could not be opened.",
      });
    } finally {
      setAttachmentLoading(false);
    }
  };

  const closeAttachmentModal = () => {
    setAttachmentModalOpen(false);
    setAttachmentTask(null);
    setAttachmentFile(null);
    setAttachments([]);
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
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="workspace-main">
        <header className="workspace-header">
          <div className="workspace-header-top">
            <button
              type="button"
              className={`workspace-menu-button ${sidebarOpen ? "is-open" : ""}`}
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
              className="workspace-user clickable-profile"
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
              <span className="workspace-avatar">
                {session?.user.Name?.charAt(0).toUpperCase() || "U"}
              </span>
              <div className="workspace-user-info">
                <strong>{session?.user.Name || "Loading..."}</strong>
                <small>{session?.roles.join(" / ") || "Member"}</small>
              </div>
            </div>
          </div>
          <div className="workspace-header-content">
            <span className="eyebrow">Workspace / {resourceTitle}</span>
            <h1>{resourceTitle}</h1>
            <p>
              Manage your team data with the access granted to your account.
            </p>
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
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => void openAttachmentFile(attachment)}
                    disabled={attachmentLoading}
                  >
                    {attachmentLoading ? "Opening..." : "Open preview"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : selected.key === "projects" && projectIdFromUrl && projectContext ? (
          <section className="workspace-panel">
            <div
              className="project-hero"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "24px",
                alignItems: "flex-start",
                flexWrap: "wrap",
                padding: "28px",
                borderRadius: "18px",
                marginBottom: "22px",
                background: "linear-gradient(135deg, #eef0ff 0%, #f8f9ff 100%)",
                border: "1px solid #dfe3f7",
              }}
            >
              <div style={{ flex: "1 1 420px" }}>
                <span className="eyebrow">PROJECT / #{projectIdFromUrl}</span>
                <h2 style={{ margin: "8px 0 8px", fontSize: "32px" }}>
                  {textOf(projectContext, "Name") || "Untitled Project"}
                </h2>
                <p style={{ margin: 0, maxWidth: "760px", lineHeight: 1.6 }}>
                  {textOf(projectContext, "Description") ||
                    "No project description available."}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => navigate("/workspace/projects")}
                >
                  ← All Projects
                </button>
                {can("CREATE_TICKET") && (
                  <button
                    className="button primary workspace-add-button"
                    type="button"
                    onClick={openProjectTaskForm}
                  >
                    <PlusIcon className="button-icon" />
                    <span>Add Task / Ticket</span>
                  </button>
                )}
              </div>
            </div>

            <div className="toolbar">
              <div>
                <h2>Project Tasks & Tickets</h2>
                <p>Manage everything assigned to this project.</p>
              </div>
              <div className="toolbar-actions">
                <span className="table-badge">
                  {relatedTasks.length} task{relatedTasks.length === 1 ? "" : "s"}
                </span>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() =>
                    navigate(`/workspace/tasks?projectId=${projectIdFromUrl}`)
                  }
                >
                  Open Tasks Page
                </button>
              </div>
            </div>

            {relatedTasks.length === 0 ? (
              <div className="workspace-empty" style={{ marginTop: "18px" }}>
                <span>✓</span>
                <h3>No tasks yet</h3>
                <p>Add the first task or ticket for this project.</p>
              </div>
            ) : (
              <div className="related-list" style={{ marginTop: "18px" }}>
                {relatedTasks.map((task) => (
                  <div className="related-card" key={idOf(task, "TaskID")}>
                    <div>
                      <strong>{textOf(task, "Title") || "Untitled Task"}</strong>
                      <small>Task #{displayNumber(task, "TaskID", relatedTasks)}</small>
                      <p>{textOf(task, "Description") || "No task description."}</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span className={`table-badge ${getStatusBadgeClass(textOf(task, "Status"))}`}>
                        {textOf(task, "Status") || "Ready to Do"}
                      </span>
                      <span className={`table-badge ${getPriorityBadgeClass(textOf(task, "Priority"))}`}>
                        {textOf(task, "Priority") || "Medium"}
                      </span>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => void openTaskAttachments(task)}
                      >
                        <PaperclipIcon className="button-icon" />
                        <span>Files</span>
                      </button>
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetails(null);
                            openEdit(task);
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {selected.key === "tasks" && (
                  <select
                    className="search-input"
                    value={taskStatusFilter}
                    onChange={(event) => setTaskStatusFilter(event.target.value)}
                    aria-label="Filter tasks by status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Ready to Do">Ready to Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Done">Done</option>
                  </select>
                )}
                {[
                  "organizations",
                  "projects",
                  "tasks",
                  "roles",
                  "permissions",
                ].includes(selected.key) && canCreate && (
                  <button
                    className="button primary workspace-add-button"
                    onClick={openCreate}
                    type="button"
                  >
                    <PlusIcon className="button-icon" />
                    <span>
                      Add {selected.key === "tasks" ? "Task" : selected.key.slice(0, -1)}
                    </span>
                  </button>
                )}
              </div>
            </div>
            {selected.key === "tasks" && projectIdFromUrl && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "18px",
                  borderRadius: "16px",
                  border: "1px solid #dfe3f7",
                  background: "#f8f9ff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span className="eyebrow">PROJECT / #{projectIdFromUrl}</span>
                    <h3 style={{ margin: "5px 0" }}>
                      {textOf(projectContext || {}, "Name") || `Project #${projectIdFromUrl}`}
                    </h3>
                    <p style={{ margin: 0 }}>Tasks & tickets for this project</p>
                  </div>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => navigate(`/workspace/projects?projectId=${projectIdFromUrl}`)}
                  >
                    ← Back to Project
                  </button>
                </div>
              </div>
            )}

            {selected.key === "tasks" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                {[
                  "Ready to Do",
                  "In Progress",
                  "Testing",
                  "Blocked",
                  "Done",
                ].map((status) => {
                  const count = items.filter(
                    (item) => textOf(item, "Status") === status,
                  ).length;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTaskStatusFilter(status)}
                      style={{
                        textAlign: "left",
                        padding: "16px",
                        borderRadius: "14px",
                        border: taskStatusFilter === status
                          ? "2px solid #5146e5"
                          : "1px solid #e1e5ef",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "24px" }}>
                        {count}
                      </strong>
                      <span style={{ display: "block", marginTop: "5px" }}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {(selected.key === "organizations" || selected.key === "roles") && (
              <div className="action-strip">
                <input
                  placeholder={selected.key === "roles" ? "Role #" : "Record ID"}
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
                  placeholder={selected.key === "roles" ? "User #" : "User / permission ID"}
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
                  placeholder={selected.key === "roles" ? "Role / permission name" : "Role / permission name"}
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
                <table className={`data-table table-${selected.key}`}>
                  <colgroup>
                    <col className="col-name" />
                    <col className="col-details" />
                    <col className="col-status" />
                    <col className="col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="col-name">
                        {selected.key === "users"
                          ? "User"
                          : selected.key === "tasks"
                            ? "Task Name"
                            : selected.key === "projects"
                              ? "Project Name"
                              : selected.key === "organizations"
                                ? "Organization"
                                : selected.key === "roles"
                                  ? "Role Name"
                                  : selected.key === "permissions"
                                    ? "Permission"
                                    : "Name / title"}
                      </th>
                      <th className="col-details">
                        {selected.key === "users"
                          ? "Roles"
                          : selected.key === "organizations"
                            ? "Email / Contact"
                            : "Description"}
                      </th>
                      <th className="col-status">
                        {selected.key === "organizations"
                          ? "Theme"
                          : "Status"}
                      </th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => {
                      const rowNumber = index + 1;
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
                      const editable =
                        selected.key === "users"
                          ? canEditUser(item)
                          : canUpdate;
                      const removable = canDelete;
                      return (
                        <tr key={`${selected.key}-${itemId}-${index}`}>
                          <td className="col-name" data-label={selected.key === "users" ? "User" : selected.key === "tasks" ? "Task" : selected.key === "projects" ? "Project" : selected.key === "organizations" ? "Organization" : selected.key === "roles" ? "Role Name" : selected.key === "permissions" ? "Permission" : "Name"}>
                            <strong>
                              {selected.key === "permissions"
                                ? (name || "Untitled").replace(/_/g, "_\u200B")
                                : name || "Untitled"}
                            </strong>
                            <small>#{rowNumber}</small>
                          </td>
                          <td className="col-details" data-label={selected.key === "users" ? "Roles" : selected.key === "organizations" ? "Email" : "Description"}>
                            {selected.key === "users" ? (
                              <div className="user-role-badges">
                                {userRolesOf(item).length > 0 ? (
                                  userRolesOf(item).map((role) => (
                                    <span
                                      className={`table-badge role-badge ${getRoleBadgeClass(role)}`}
                                      key={role}
                                    >
                                      {role}
                                    </span>
                                  ))
                                ) : (
                                  <span className="table-badge role-badge">
                                    No role
                                  </span>
                                )}
                              </div>
                            ) : (
                              textOf(
                                item,
                                selected.key === "organizations"
                                  ? "Email"
                                  : "Description",
                              ) || "—"
                            )}
                          </td>
                          <td className="col-status" data-label={selected.key === "organizations" ? "Theme" : "Status"}>
                            <span
                              className={`table-badge ${
                                selected.key === "users"
                                  ? item.IsActive === false
                                    ? "status-left"
                                    : "status-active"
                                  : selected.key === "tasks"
                                    ? getStatusBadgeClass(textOf(item, "Status"))
                                    : selected.key === "projects"
                                      ? getStatusBadgeClass(textOf(item, "Status"))
                                      : "status-active"
                              }`}
                            >
                              {selected.key === "users"
                                ? item.IsActive === false
                                  ? "Left"
                                  : "Active"
                                : textOf(
                                    item,
                                    selected.key === "tasks" || selected.key === "projects"
                                      ? "Status"
                                      : selected.key === "organizations"
                                        ? "Theme"
                                        : "Status",
                                  ) || "Active"}
                            </span>
                          </td>
                          <td className="col-actions" data-label="Actions">
                            <div className="table-actions">
                              {selected.key === "users" &&
                                (isAdmin || can("VIEW_USER_TASKS")) && (
                                  <button
                                    className="btn-tasks"
                                    type="button"
                                    onClick={() => void viewUserTasks(item)}
                                  >
                                    View Tasks
                                  </button>
                                )}
                              {selected.key !== "attachments" &&
                                (selected.key !== "users" ||
                                  isAdmin ||
                                  idOf(item, "UserID") ===
                                    Number(session?.user.UserID)) && (
                                  <button
                                    className="btn-view"
                                    type="button"
                                    onClick={() => void viewDetails(item)}
                                  >
                                    View
                                  </button>
                                )}
                              {editable && (
                                <button
                                  className="btn-edit"
                                  type="button"
                                  onClick={() => openEdit(item)}
                                >
                                  Edit
                                </button>
                              )}
                              {selected.key === "users" ? (
                                item.IsActive === false ? (
                                  isAdmin && (
                                  <button
                                    className="btn-activate"
                                    type="button"
                                    onClick={() => activate(item)}
                                  >
                                    Activate
                                  </button>
                                  )
                                ) : (
                                  removable && (
                                    <button
                                      className="btn-deactivate"
                                      type="button"
                                      onClick={() => void remove(item)}
                                    >
                                      Deactivate
                                    </button>
                                  )
                                )
                              ) : (
                                removable && (
                                  <button
                                    className="btn-deactivate"
                                    type="button"
                                    onClick={() => void remove(item)}
                                  >
                                    Delete
                                  </button>
                                )
                              )}
                              {selected.key === "tasks" && (
                                <button
                                  className="btn-view"
                                  type="button"
                                  onClick={() => void openTaskAttachments(item)}
                                >
                                  <PaperclipIcon className="button-icon" />
                                  <span>Files</span>
                                </button>
                              )}
                            </div>
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
        {attachmentModalOpen && attachmentTask && (
          <div className="modal-backdrop">
            <section
              className="workspace-modal detail-modal"
              style={{ maxWidth: "760px" }}
            >
              <div className="modal-title">
                <div>
                  <span className="eyebrow">TASK ATTACHMENTS</span>
                  <h2>Files & Attachments</h2>
                  <p style={{ margin: "6px 0 0", color: "#70809c" }}>
                    {textOf(attachmentTask, "Title") || "Untitled Task"}
                    <span style={{ marginLeft: "8px" }}>
                      #{displayNumber(attachmentTask, "TaskID", items)}
                    </span>
                  </p>
                </div>
                <button type="button" onClick={closeAttachmentModal}>
                  ×
                </button>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "18px",
                  border: "1px solid #e1e6f2",
                  background: "linear-gradient(135deg, #f8f9ff, #ffffff)",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "14px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: "18px" }}>
                      Add a file to this task
                    </strong>
                    <small style={{ display: "block", marginTop: "5px", color: "#70809c" }}>
                      Attach a task-related image or design for your team.
                    </small>
                  </div>
                  <span className="table-badge">
                    {attachments.length} file
                    {attachments.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "16px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setAttachmentFile(event.target.files?.[0] || null)
                    }
                    style={{ flex: "1 1 280px" }}
                  />
                  <button
                    className="button primary"
                    type="button"
                    disabled={!attachmentFile || attachmentLoading}
                    onClick={() => void uploadTaskAttachment()}
                  >
                    {attachmentLoading ? "Working..." : "+ Upload File"}
                  </button>
                </div>

                {attachmentFile && (
                  <small style={{ display: "block", marginTop: "10px", color: "#53627b" }}>
                    Selected: {attachmentFile.name}
                  </small>
                )}
              </div>

              <div className="related-section">
                <div className="related-section-header">
                  <div>
                    <span className="eyebrow">LINKED TO TASK</span>
                    <h3>Task Files</h3>
                  </div>
                </div>

                {attachmentLoading && attachments.length === 0 ? (
                  <div className="workspace-empty">Loading attachments...</div>
                ) : attachments.length === 0 ? (
                  <div className="workspace-empty">
                    <span className="attachment-empty-icon" aria-hidden="true">
                      <PaperclipIcon />
                    </span>
                    <h3>No attachments yet</h3>
                    <p>Add the first file to keep the task documentation in one place.</p>
                  </div>
                ) : (
                  <div className="related-list">
                    {attachments.map((attachment, index) => (
                      <div
                        className="related-card"
                        key={idOf(attachment, "AttachmentID")}
                      >
                        <div>
                          <strong>
                            {textOf(attachment, "FileName") || "Task attachment"}
                          </strong>
                          <small>
                            Attachment #{index + 1}
                          </small>
                          <p>
                            File attached to task #{displayNumber(attachmentTask, "TaskID", items)}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => void openAttachmentFile(attachment)}
                            disabled={attachmentLoading}
                          >
                            {attachmentLoading ? "Working..." : "Open File"}
                          </button>
                          <button
                            type="button"
                            className="danger-link"
                            onClick={() => void deleteTaskAttachment(attachment)}
                            disabled={attachmentLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={closeAttachmentModal}
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}
        {userTasksUser && (
          <div className="modal-backdrop">
            <section
              className="workspace-modal detail-modal"
              style={{ maxWidth: "850px" }}
            >
              <div className="modal-title">
                <div>
                  <span className="eyebrow">USER TASKS</span>
                  <h2>
                    {textOf(userTasksUser, "Name") || "User"} — Assigned Tasks
                  </h2>
                  <p style={{ margin: "6px 0 0", color: "#70809c" }}>
                    User #{displayNumber(userTasksUser, "UserID", items)}
                    {" · "}
                    {textOf(userTasksUser, "Email") || "Assigned tasks"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserTasksUser(null);
                    setUserTasks([]);
                  }}
                >
                  ×
                </button>
              </div>

              {userTasksLoading ? (
                <div className="workspace-empty">
                  Loading assigned tasks...
                </div>
              ) : userTasks.length === 0 ? (
                <div className="workspace-empty">
                  <span>✓</span>
                  <h3>No assigned tasks</h3>
                  <p>This user currently has no tasks assigned to them.</p>
                </div>
              ) : (
                <div className="related-list">
                  {userTasks.map((task, index) => (
                    <div
                      className="related-card"
                      key={idOf(task, "TaskID")}
                    >
                      <div>
                        <small style={{ display: "block", marginBottom: "4px" }}>
                          #{index + 1}
                        </small>
                        <strong>
                          {textOf(task, "Title") || "Untitled Task"}
                        </strong>
                        <small>
                          Task #{displayNumber(task, "TaskID", userTasks)}
                        </small>
                        <p>
                          {textOf(task, "Description") ||
                            "No task description."}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <span className={`table-badge ${getStatusBadgeClass(textOf(task, "Status"))}`}>
                          {textOf(task, "Status") || "Ready to Do"}
                        </span>
                        <span className={`table-badge ${getPriorityBadgeClass(textOf(task, "Priority"))}`}>
                          {textOf(task, "Priority") || "Medium"}
                        </span>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => void openTaskAttachments(task)}
                        >
                          <PaperclipIcon className="button-icon" />
                          <span>Files</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setUserTasksUser(null);
                    setUserTasks([]);
                  }}
                >
                  Close
                </button>
              </div>
            </section>
          </div>
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
              ) : details ? (
                <>
                  {selected.key === "organizations" ? (
                    <div className="detail-grid">
                      <div>
                        <small>Organization</small>
                        <strong>{textOf(details, "Name") || "—"}</strong>
                      </div>
                      <div>
                        <small>Email</small>
                        <strong>{textOf(details, "Email") || "—"}</strong>
                      </div>
                      <div>
                        <small>Contact</small>
                        <strong>{textOf(details, "ContactNo") || "—"}</strong>
                      </div>
                      <div>
                        <small>Theme</small>
                        <strong>{textOf(details, "Theme") || "—"}</strong>
                      </div>
                      <div>
                        <small>Owner ID</small>
                        <strong>{textOf(details, "OwnerID") || "—"}</strong>
                      </div>
                    </div>
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

                  {selected.key === "organizations" && (
                    <div className="related-section">
                      <div className="related-section-header">
                        <div>
                          <span className="eyebrow">Organization</span>
                          <h3>Projects</h3>
                        </div>

                        <span className="table-badge">
                          {relatedProjects.length} project
                          {relatedProjects.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div
                        className="table-actions"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          alignItems: "center",
                          marginBottom: "16px",
                        }}
                      >
                        {can("CREATE_PROJECT") && (
                          <button
                            className="button primary"
                            type="button"
                            onClick={openOrganizationProjectForm}
                          >
                            + Add Project
                          </button>
                        )}

                        {can("UPDATE_PROJECT") && (
                          <button
                            className="button secondary"
                            type="button"
                            disabled={linkProjectLoading || saving}
                            onClick={() => void openLinkProjectForm()}
                          >
                            {linkProjectLoading ? "Loading..." : "Link Existing Project"}
                          </button>
                        )}
                      </div>

                      {relatedProjects.length === 0 ? (
                        <div className="workspace-empty">
                          <span>▣</span>
                          <h3>No projects linked</h3>
                          <p>
                            Add a new project or link an existing unlinked project
                            to this organization.
                          </p>
                        </div>
                      ) : (
                        <div className="related-list">
                          {relatedProjects.map((project) => (
                            <div
                              className="related-card"
                              key={idOf(project, "ProjectID")}
                            >
                              <div>
                                <strong>
                                  {textOf(project, "Name") ||
                                    "Untitled Project"}
                                </strong>

                                <small>
                                  #{displayNumber(project, "ProjectID", relatedProjects)}
                                </small>

                                <p>
                                  {textOf(project, "Description") ||
                                    "No project description."}
                                </p>
                              </div>

                              <div
                                className="table-actions"
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "10px",
                                  alignItems: "center",
                                }}
                              >
                                <button
                                  className="button secondary"
                                  type="button"
                                  onClick={() => {
                                    setDetails(null);
                                    void viewProjectFromOrganization(project);
                                  }}
                                >
                                  Open Project
                                </button>

                                {can("UPDATE_PROJECT") && (
                                  <button
                                    className="button secondary"
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                      void unlinkProjectFromOrganization(project)
                                    }
                                  >
                                    Unlink
                                  </button>
                                )}

                                {can("DELETE_PROJECT") && (
                                  <button
                                    className="danger-link"
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                      void deleteProjectFromOrganization(project)
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
                  )}

                  {selected.key === "projects" && (
                    <div className="related-section">
                      <div className="related-section-header">
                        <div>
                          <span className="eyebrow">Project</span>
                          <h3>Related Tasks</h3>
                        </div>

                        <div className="table-actions">
                          <span className="table-badge">
                            {relatedTasks.length} task
                            {relatedTasks.length === 1 ? "" : "s"}
                          </span>
                          <button
                            className="button secondary"
                            type="button"
                            onClick={() => {
                              const projectId = idOf(details, "ProjectID");
                              setDetails(null);
                              setTaskStatusFilter("All");
                              setQuery("");
                              navigate(`/workspace/tasks?projectId=${projectId}`);
                            }}
                          >
                            View Tasks
                          </button>
                        </div>
                      </div>

                      {relatedTasks.length === 0 ? (
                        <div className="workspace-empty">
                          <span>✓</span>
                          <h3>No tasks linked</h3>
                          <p>
                            Create a task and select this project to see it
                            here.
                          </p>
                        </div>
                      ) : (
                        <div className="related-list">
                          {relatedTasks.map((task) => (
                            <div
                              className="related-card"
                              key={idOf(task, "TaskID")}
                            >
                              <div>
                                <strong>
                                  {textOf(task, "Title") ||
                                    "Untitled Task"}
                                </strong>

                                <small>
                                  Task #{displayNumber(task, "TaskID", relatedTasks)}
                                </small>

                                <p>
                                  {textOf(task, "Description") ||
                                    "No task description."}
                                </p>
                              </div>

                              <div className="table-actions">
                                <span className={`table-badge ${getStatusBadgeClass(textOf(task, "Status"))}`}>
                                  {textOf(task, "Status") ||
                                    "Ready to Do"}
                                </span>
                                <span className={`table-badge ${getPriorityBadgeClass(textOf(task, "Priority"))}`}>
                                  {textOf(task, "Priority") ||
                                    "Medium"}
                                </span>
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => void openTaskAttachments(task)}
                                >
                                  <PaperclipIcon className="button-icon" />
                                  <span>Files</span>
                                </button>
                                {canUpdate && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDetails(null);
                                      openEdit(task);
                                    }}
                                  >
                                    Edit Status
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </section>
          </div>
        )}
        {organizationProjectFormOpen && (
          <div className="modal-backdrop">
            <form
              noValidate
              className="workspace-modal"
              onSubmit={(event) => void createProjectFromOrganization(event)}
            >
              <div className="modal-title">
                <div>
                  <span className="eyebrow">Organization</span>
                  <h2>Add Project</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOrganizationProjectFormOpen(false)}
                >
                  ×
                </button>
              </div>

              <label>
                Name
                <input
                  required
                  type="text"
                  value={organizationProjectForm.Name}
                  onChange={(event) =>
                    setOrganizationProjectForm({
                      ...organizationProjectForm,
                      Name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  value={organizationProjectForm.Description}
                  onChange={(event) =>
                    setOrganizationProjectForm({
                      ...organizationProjectForm,
                      Description: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                OwnerID
                <input
                  required
                  type="number"
                  min="1"
                  value={organizationProjectForm.OwnerID}
                  onChange={(event) =>
                    setOrganizationProjectForm({
                      ...organizationProjectForm,
                      OwnerID: event.target.value,
                    })
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setOrganizationProjectFormOpen(false)}
                >
                  Cancel
                </button>
                <button className="button primary" disabled={saving}>
                  {saving ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        )}

        {linkProjectFormOpen && (
          <div className="modal-backdrop">
            <section className="workspace-modal">
              <div className="modal-title">
                <div>
                  <span className="eyebrow">Organization</span>
                  <h2>Link Existing Project</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkProjectFormOpen(false)}
                >
                  ×
                </button>
              </div>

              {availableProjects.length === 0 ? (
                <div className="workspace-empty">
                  <span>▣</span>
                  <h3>No unlinked projects</h3>
                  <p>
                    There are no existing projects available to link to this
                    organization.
                  </p>
                </div>
              ) : (
                <div className="related-list">
                  {availableProjects.map((project) => (
                    <div
                      className="related-card"
                      key={idOf(project, "ProjectID")}
                    >
                      <div>
                        <strong>
                          {textOf(project, "Name") || "Untitled Project"}
                        </strong>
                        <small>#{displayNumber(project, "ProjectID", relatedProjects)}</small>
                        <p>
                          {textOf(project, "Description") ||
                            "No project description."}
                        </p>
                      </div>

                      <button
                        className="button secondary"
                        type="button"
                        disabled={saving}
                        onClick={() => void linkExistingProject(project)}
                      >
                        {saving ? "Linking..." : "Link Project"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setLinkProjectFormOpen(false)}
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}

        {projectTaskFormOpen && (
          <div className="modal-backdrop">
            <form
              noValidate
              className="workspace-modal"
              onSubmit={(event) => void createTaskFromProject(event)}
            >
              <div className="modal-title">
                <div>
                  <span className="eyebrow">PROJECT TASK</span>
                  <h2>Add Task / Ticket</h2>
                </div>
                <button type="button" onClick={() => setProjectTaskFormOpen(false)}>
                  ×
                </button>
              </div>

              <label>
                Title
                <input
                  required
                  type="text"
                  value={projectTaskForm.Title}
                  onChange={(event) =>
                    setProjectTaskForm({ ...projectTaskForm, Title: event.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  value={projectTaskForm.Description}
                  onChange={(event) =>
                    setProjectTaskForm({
                      ...projectTaskForm,
                      Description: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={projectTaskForm.Status}
                  onChange={(event) =>
                    setProjectTaskForm({ ...projectTaskForm, Status: event.target.value })
                  }
                >
                  <option>Ready to Do</option>
                  <option>In Progress</option>
                  <option>Testing</option>
                  <option>Blocked</option>
                  <option>Done</option>
                </select>
              </label>

              <label>
                Priority
                <select
                  value={projectTaskForm.Priority}
                  onChange={(event) =>
                    setProjectTaskForm({ ...projectTaskForm, Priority: event.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setProjectTaskFormOpen(false)}
                >
                  Cancel
                </button>
                <button className="button primary" disabled={saving}>
                  {saving ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        )}

        {showForm && (
          <div className="modal-backdrop">
            <form noValidate className="workspace-modal" onSubmit={save}>
              <div className="modal-title">
                <div>
                  <span className="eyebrow">{resourceTitle}</span>
                  <h2>
                    {editing
                      ? selected.key === "users"
                        ? "Edit User"
                        : "Edit record"
                      : "Create record"}
                  </h2>
                </div>
                <button type="button" onClick={() => setShowForm(false)}>
                  ×
                </button>
              </div>

              {formErrors.general && (
                <div className="workspace-notice error" role="alert" style={{ margin: "10px 0" }}>
                  <span>{formErrors.general}</span>
                  <button
                    type="button"
                    onClick={() => setFormErrors({ ...formErrors, general: "" })}
                  >
                    ×
                  </button>
                </div>
              )}

              {Object.entries(form).map(([key, value]) =>
                key === "Description" ? (
                  <label key={key}>
                    {key}
                    <textarea
                      value={value}
                      className={formErrors[key] ? "has-error" : ""}
                      onChange={(event) => {
                        setForm({ ...form, [key]: event.target.value });
                        if (formErrors[key]) setFormErrors({ ...formErrors, [key]: "" });
                      }}
                    />
                    {formErrors[key] && (
                      <div className="field-error-text" role="alert">
                        <span className="error-bullet">●</span> {formErrors[key]}
                      </div>
                    )}
                  </label>
                ) : key === "Status" ? (
                  <label key={key}>
                    {key}
                    <select
                      value={value}
                      className={formErrors[key] ? "has-error" : ""}
                      onChange={(event) => {
                        setForm({ ...form, [key]: event.target.value });
                        if (formErrors[key]) setFormErrors({ ...formErrors, [key]: "" });
                      }}
                    >
                      <option>Ready to Do</option>
                      <option>In Progress</option>
                      <option>Blocked</option>
                      <option>Testing</option>
                      <option>Done</option>
                    </select>
                    {formErrors[key] && (
                      <div className="field-error-text" role="alert">
                        <span className="error-bullet">●</span> {formErrors[key]}
                      </div>
                    )}
                  </label>
                ) : key === "Priority" ? (
                  <label key={key}>
                    {key}
                    <select
                      value={value}
                      className={formErrors[key] ? "has-error" : ""}
                      onChange={(event) => {
                        setForm({ ...form, [key]: event.target.value });
                        if (formErrors[key]) setFormErrors({ ...formErrors, [key]: "" });
                      }}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                    {formErrors[key] && (
                      <div className="field-error-text" role="alert">
                        <span className="error-bullet">●</span> {formErrors[key]}
                      </div>
                    )}
                  </label>
                ) : (
                  <label key={key}>
                    {key}
                    <input
                      required={key !== "OwnerID"}
                      className={formErrors[key] ? "has-error" : ""}
                      type={
                        key.toLowerCase().includes("id")
                          ? "number"
                          : key === "email"
                            ? "email"
                            : "text"
                      }
                      value={value}
                      onChange={(event) => {
                        setForm({ ...form, [key]: event.target.value });
                        if (formErrors[key]) setFormErrors({ ...formErrors, [key]: "" });
                      }}
                    />
                    {formErrors[key] && (
                      <div className="field-error-text" role="alert">
                        <span className="error-bullet">●</span> {formErrors[key]}
                      </div>
                    )}
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
        {/* ================= CONFIRM WARNING MODAL ================= */}
        <ConfirmModal
          isOpen={Boolean(confirmDialog?.isOpen)}
          title={confirmDialog?.title || "Confirm Action"}
          message={confirmDialog?.message || "Are you sure you want to perform this action?"}
          confirmText={confirmDialog?.confirmText || "Confirm"}
          isLoading={confirmLoading}
          onConfirm={handleConfirmDialog}
          onCancel={() => setConfirmDialog(null)}
        />
      </main>
    </div>
  );
};

export default Workspace;
