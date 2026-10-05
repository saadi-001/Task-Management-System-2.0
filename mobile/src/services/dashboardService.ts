import { fetchApi } from './api';

export const dashboardService = {
  async getDashboardStats() {
    try {
      const [projects, organizations, tickets, users] = await Promise.allSettled([
        fetchApi('/projects').catch(() => null),
        fetchApi('/organizations').catch(() => null),
        fetchApi('/tickets').catch(() => null),
        fetchApi('/users').catch(() => null),
      ]);

      const ticketList = tickets.status === 'fulfilled' && tickets.value ? tickets.value.data || [] : [];
      // Sort by TaskID descending to get recent tasks
      const recentTickets = [...ticketList].sort((a: any, b: any) => b.TaskID - a.TaskID).slice(0, 5);

      return {
        projects: projects.status === 'fulfilled' && projects.value ? projects.value.data?.length ?? 0 : null,
        organizations: organizations.status === 'fulfilled' && organizations.value ? organizations.value.data?.length ?? 0 : null,
        tickets: ticketList.length,
        users: users.status === 'fulfilled' && users.value ? users.value.data?.length ?? 0 : null,
        recentTickets,
        doneTickets: ticketList.filter((t: any) => t.Status?.toLowerCase() === 'done').length,
        inProgressTickets: ticketList.filter((t: any) => t.Status?.toLowerCase() === 'in progress' || t.Status?.toLowerCase() === 'testing').length
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      throw error;
    }
  }
};
