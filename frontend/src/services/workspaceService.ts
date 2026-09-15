import api from "./api";

export type ApiItem = Record<string, unknown>;

const data = <T>(response: { data: { data: T } }) => response.data.data;

export const workspaceService = {
  getSession: async () => data(await api.get("/auth/me")),
  getOrganizations: async () =>
    data<ApiItem[]>(await api.get("/organizations")),
  getOrganization: async (id: number) =>
    data<ApiItem>(await api.get(`/organizations/${id}`)),
  createOrganization: async (payload: ApiItem) =>
    data(await api.post("/organizations", payload)),
  updateOrganization: async (id: number, payload: ApiItem) =>
    data(await api.put(`/organizations/${id}`, payload)),
  deleteOrganization: async (id: number) => api.delete(`/organizations/${id}`),
  assignOrganizationUser: async (payload: ApiItem) =>
    api.post("/organizations/assign-user", payload),
  removeOrganizationUser: async (payload: ApiItem) =>
    api.delete("/organizations/remove-user", { data: payload }),
  transferOrganizationOwner: async (payload: ApiItem) =>
    api.put("/organizations/transfer-owner", payload),

  getUsers: async () => data<ApiItem[]>(await api.get("/users")),
  getUser: async (id: number) => data<ApiItem>(await api.get(`/users/${id}`)),
  deleteUser: async (id: number) => api.delete(`/users/${id}`),

  getRoles: async () => data<ApiItem[]>(await api.get("/roles")),
  getRole: async (id: number) => data<ApiItem>(await api.get(`/roles/${id}`)),
  createRole: async (payload: ApiItem) =>
    data(await api.post("/roles", payload)),
  updateRole: async (id: number, payload: ApiItem) =>
    data(await api.put(`/roles/${id}`, payload)),
  deleteRole: async (id: number) => api.delete(`/roles/${id}`),
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

  getPermissions: async () => data<ApiItem[]>(await api.get("/permissions")),
  getPermission: async (id: number) =>
    data<ApiItem>(await api.get(`/permissions/${id}`)),
  createPermission: async (payload: ApiItem) =>
    data(await api.post("/permissions", payload)),
  updatePermission: async (id: number, payload: ApiItem) =>
    data(await api.put(`/permissions/${id}`, payload)),
  deletePermission: async (id: number) => api.delete(`/permissions/${id}`),

  getProjects: async () => data<ApiItem[]>(await api.get("/projects")),
  getProject: async (id: number) =>
    data<ApiItem>(await api.get(`/projects/${id}`)),
  createProject: async (payload: ApiItem) =>
    data(await api.post("/projects", payload)),
  updateProject: async (id: number, payload: ApiItem) =>
    data(await api.put(`/projects/${id}`, payload)),
  deleteProject: async (id: number) => api.delete(`/projects/${id}`),

  getTickets: async () => data<ApiItem[]>(await api.get("/tickets")),
  getTicket: async (id: number) =>
    data<ApiItem>(await api.get(`/tickets/${id}`)),
  createTicket: async (payload: ApiItem) =>
    data(await api.post("/tickets", payload)),
  updateTicket: async (id: number, payload: ApiItem) =>
    data(await api.put(`/tickets/${id}`, payload)),
  deleteTicket: async (id: number) => api.delete(`/tickets/${id}`),
  assignTicket: async (id: number, userId: number) =>
    api.patch(`/tickets/${id}/assign`, { userId }),
  getAttachments: async (ticketId: number) =>
    data<ApiItem[]>(await api.get(`/tickets/${ticketId}/attachments`)),
  uploadAttachment: async (ticketId: number, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return data(
      await api.post(`/tickets/${ticketId}/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
};
