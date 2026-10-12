import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { organizationService, Organization } from '../services/organizationService';
import { projectService, Project } from '../services/projectService';
import { ticketService, Ticket } from '../services/ticketService';

interface WorkspaceContextData {
  organizations: Organization[];
  selectedOrgId: number | null; // null represents "All Workspaces / Unified View"
  selectedOrg: Organization | null;
  allProjects: Project[];
  activeProjects: Project[];
  allTickets: Ticket[];
  activeTickets: Ticket[];
  myTickets: Ticket[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  setSelectedOrgId: (id: number | null) => Promise<void>;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextData>({} as WorkspaceContextData);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgIdState] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStorageKey = useCallback(() => {
    return user ? `active_workspace_org_id_${user.UserID}` : null;
  }, [user]);

  const loadWorkspaceData = useCallback(async (isRefresh = false) => {
    if (!user) {
      setOrganizations([]);
      setAllProjects([]);
      setAllTickets([]);
      setSelectedOrgIdState(null);
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [orgsRes, projectsRes, ticketsRes] = await Promise.allSettled([
        organizationService.getOrganizations(),
        projectService.getProjects(),
        ticketService.getTickets(),
      ]);

      const orgsList: Organization[] = orgsRes.status === 'fulfilled' && orgsRes.value?.success
        ? orgsRes.value.data || []
        : [];
      
      const projectsList: Project[] = projectsRes.status === 'fulfilled' && projectsRes.value?.success
        ? projectsRes.value.data || []
        : [];

      const ticketsList: Ticket[] = ticketsRes.status === 'fulfilled' && ticketsRes.value?.success
        ? ticketsRes.value.data || []
        : [];

      setOrganizations(orgsList);
      setAllProjects(projectsList);
      setAllTickets(ticketsList);

      // Restore persisted selection
      const storageKey = `active_workspace_org_id_${user.UserID}`;
      const savedIdStr = await AsyncStorage.getItem(storageKey);
      
      if (savedIdStr !== null) {
        const parsedId = savedIdStr === 'all' ? null : parseInt(savedIdStr, 10);
        if (parsedId === null) {
          setSelectedOrgIdState(null);
        } else if (orgsList.some(o => o.OrganizationID === parsedId)) {
          setSelectedOrgIdState(parsedId);
        } else if (orgsList.length === 1) {
          // If the saved org was deleted or inaccessible, fallback to single org if only 1 exists
          setSelectedOrgIdState(orgsList[0].OrganizationID);
        } else {
          setSelectedOrgIdState(null);
        }
      } else {
        // First-time load: if user has exactly 1 organization, auto-select it
        if (orgsList.length === 1) {
          setSelectedOrgIdState(orgsList[0].OrganizationID);
          await AsyncStorage.setItem(storageKey, String(orgsList[0].OrganizationID));
        } else {
          setSelectedOrgIdState(null);
        }
      }
    } catch (err: any) {
      console.warn('[WorkspaceContext] Failed to load workspace data:', err);
      setError(err?.message || 'Failed to sync workspace');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const setSelectedOrgId = async (id: number | null) => {
    setSelectedOrgIdState(id);
    const key = getStorageKey();
    if (key) {
      if (id === null) {
        await AsyncStorage.setItem(key, 'all');
      } else {
        await AsyncStorage.setItem(key, String(id));
      }
    }
  };

  const selectedOrg = useMemo(() => {
    if (selectedOrgId === null) return null;
    return organizations.find(o => o.OrganizationID === selectedOrgId) || null;
  }, [selectedOrgId, organizations]);

  const activeProjects = useMemo(() => {
    if (selectedOrgId === null) return allProjects;
    return allProjects.filter(p => p.OrganizationID === selectedOrgId);
  }, [selectedOrgId, allProjects]);

  const activeTickets = useMemo(() => {
    if (selectedOrgId === null) return allTickets;
    const projectIds = new Set(activeProjects.map(p => p.ProjectID));
    return allTickets.filter(t => projectIds.has(t.ProjectID));
  }, [selectedOrgId, activeProjects, allTickets]);

  const myTickets = useMemo(() => {
    if (!user) return [];
    return activeTickets.filter(t => t.AssignedTo === user.UserID);
  }, [activeTickets, user]);

  const refreshWorkspace = useCallback(async () => {
    await loadWorkspaceData(true);
  }, [loadWorkspaceData]);

  return (
    <WorkspaceContext.Provider
      value={{
        organizations,
        selectedOrgId,
        selectedOrg,
        allProjects,
        activeProjects,
        allTickets,
        activeTickets,
        myTickets,
        loading,
        refreshing,
        error,
        setSelectedOrgId,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
