import api from "./api";

export type ApiItem = Record<string, unknown>;

const data = <T>(response: { data: { data: T } }) => response.data.data;

export const workspaceService = {
  // ==============================
  // Session
  // ==============================
  getSession: async () => data(await api.get("/auth/me")),

  // ==============================
  // Organizations
  // ==============================
  getOrganizations: async () =>
    data<ApiItem[]>(await api.get("/organizations")),

  getOrganization: async (id: number) =>
    data<ApiItem>(await api.get(`/organizations/${id}`)),

  createOrganization: async (payload: ApiItem) =>
    data(await api.post("/organizations", payload)),

  updateOrganization: async (id: number, payload: ApiItem) =>
    data(await api.put(`/organizations/${id}`, payload)),

  deleteOrganization: async (id: number) =>
    api.delete(`/organizations/${id}`),

  assignOrganizationUser: async (payload: ApiItem) =>
    api.post("/organizations/assign-user", payload),

  removeOrganizationUser: async (payload: ApiItem) =>
    api.delete("/organizations/remove-user", { data: payload }),

  transferOrganizationOwner: async (payload: ApiItem) =>
    api.put("/organizations/transfer-owner", payload),

  // ==============================
  // Users
  // ==============================
  getUsers: async () =>
    data<ApiItem[]>(await api.get("/users")),

  getUser: async (id: number) =>
    data<ApiItem>(await api.get(`/users/${id}`)),

  updateUser: async (id: number, payload: ApiItem) =>
    data<ApiItem>(await api.patch(`/users/${id}`, payload)),

  getUserTasks: async (userId: number) =>
    data<ApiItem[]>(await api.get(`/tickets/user/${userId}`)),

  deleteUser: async (id: number) =>
    api.delete(`/users/${id}`),

  activateUser: async (id: number) =>
    data<ApiItem>(await api.patch(`/users/${id}/activate`)),

  // ==============================
  // Roles
  // ==============================
  getRoles: async () =>
    data<ApiItem[]>(await api.get("/roles")),

  getRole: async (id: number) =>
    data<ApiItem>(await api.get(`/roles/${id}`)),

  createRole: async (payload: ApiItem) =>
    data(await api.post("/roles", payload)),

  updateRole: async (id: number, payload: ApiItem) =>
    data(await api.put(`/roles/${id}`, payload)),

  deleteRole: async (id: number) =>
    api.delete(`/roles/${id}`),

  getRolePermissions: async (id: number) =>
    data<ApiItem[]>(await api.get(`/roles/${id}/permissions`)),

  assignRolePermission: async (payload: ApiItem) =>
    api.post("/roles/assign-permission", payload),

  removeRolePermission: async (payload: ApiItem) =>
    api.delete("/roles/remove-permission", { data: payload }),

  assignUserRole: async (payload: ApiItem) =>
    api.post("/roles/assign-user", payload),

  removeUserRole: async (payload: ApiItem) =>
    api.delete("/roles/remove-user", { data: payload }),

  // ==============================
  // Permissions
  // ==============================
  getPermissions: async () =>
    data<ApiItem[]>(await api.get("/permissions")),

  getPermission: async (id: number) =>
    data<ApiItem>(await api.get(`/permissions/${id}`)),

  createPermission: async (payload: ApiItem) =>
    data(await api.post("/permissions", payload)),

  updatePermission: async (id: number, payload: ApiItem) =>
    data(await api.put(`/permissions/${id}`, payload)),

  deletePermission: async (id: number) =>
    api.delete(`/permissions/${id}`),

  // ==============================
  // Projects
  // ==============================
  getProjects: async () =>
    data<ApiItem[]>(await api.get("/projects")),

  getProject: async (id: number) =>
    data<ApiItem>(await api.get(`/projects/${id}`)),

  getProjectsByOrganizationId: async (organizationId: number) =>
    data<ApiItem[]>(
      await api.get(`/projects/organization/${organizationId}`),
    ),

  linkProjectToOrganization: async (
    projectId: number,
    organizationId: number,
  ) =>
    data<ApiItem>(
      await api.put(`/projects/${projectId}/link`, {
        OrganizationID: organizationId,
      }),
    ),

  unlinkProjectFromOrganization: async (projectId: number) =>
    data<ApiItem>(
      await api.put(`/projects/${projectId}/unlink`),
    ),

  createProject: async (payload: ApiItem) =>
    data(await api.post("/projects", payload)),

  updateProject: async (id: number, payload: ApiItem) =>
    data(await api.put(`/projects/${id}`, payload)),

  deleteProject: async (id: number) =>
    api.delete(`/projects/${id}`),

  // ==============================
  // Tickets / Tasks
  // ==============================
  getTickets: async () =>
    data<ApiItem[]>(await api.get("/tickets")),

  getTicket: async (id: number) =>
    data<ApiItem>(await api.get(`/tickets/${id}`)),

  getTicketsByProjectId: async (projectId: number) =>
    data<ApiItem[]>(
      await api.get(`/tickets/project/${projectId}`),
    ),

  getTicketsByUserId: async (userId: number) =>
    data<ApiItem[]>(
      await api.get(`/tickets/user/${userId}`),
    ),

  createTicket: async (payload: ApiItem) =>
    data(await api.post("/tickets", payload)),

  updateTicket: async (id: number, payload: ApiItem) =>
    data(await api.put(`/tickets/${id}`, payload)),

  deleteTicket: async (id: number) =>
    api.delete(`/tickets/${id}`),

  assignTicket: async (id: number, userId: number) =>
    api.patch(`/tickets/${id}/assign`, { userId }),

  // ==============================
  // Attachments
  // ==============================
  getAttachments: async (ticketId: number) =>
    data<ApiItem[]>(await api.get(`/tickets/${ticketId}/attachments`)),

  uploadAttachment: async (ticketId: number, file: File) => {
    const form = new FormData();

    form.append("image", file);

    return data(
      await api.post(`/tickets/${ticketId}/attachments`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  },

  deleteAttachment: async (
    ticketId: number,
    attachmentId: number,
  ) =>
    api.delete(
      `/tickets/${ticketId}/attachments/${attachmentId}`,
    ),
};