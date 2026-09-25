import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ConfirmModal from "./ConfirmModal";
import "./AppSidebar.css";
import {
  IconLogo,
  IconDashboard,
  IconOrganizations,
  IconProjects,
  IconTasks,
  IconAttachments,
  IconUsers,
  IconRoles,
  IconPermissions,
  IconLogout,
  IconLock
} from "./SidebarIcons";

interface AppSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, hasPermission, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAdmin = session?.roles.includes("Admin") || false;
  const can = (permission?: string) => (permission ? hasPermission(permission) : true);

  const closeSidebar = () => setSidebarOpen(false);

  const handleNav = (path: string, allowed: boolean) => {
    if (!allowed) {
      alert("Access Denied: you do not have permission to access this module.");
      return;
    }
    if (window.innerWidth < 768) {
      closeSidebar();
    }
    navigate(path);
  };

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate("/login", { replace: true });
  };

  const isDashboard = location.pathname === "/dashboard";
  const isModule = (mod: string) => location.pathname === `/workspace/${mod}`;

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside className={`dashboard-sidebar app-unified-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-scrollable-content">
          <div className="sidebar-header-area">
            <div
              className="dashboard-brand"
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/dashboard", true)}
            >
              <div className="dashboard-brand-icon">
                <IconLogo />
              </div>
              <span className="brand-text">
                Task Management<br />System
              </span>
            </div>
          </div>

          <div className="sidebar-section-label">WORKSPACE</div>
          <nav className="dashboard-nav">
            <button
              type="button"
              className={`dashboard-nav-item ${isDashboard ? "active" : ""}`}
              onClick={() => handleNav("/dashboard", true)}
              title="Dashboard"
            >
              <span className="nav-item-icon"><IconDashboard /></span>
              <span className="nav-item-text">Dashboard</span>
            </button>

            <button
              type="button"
              className={`dashboard-nav-item ${isModule("organizations") ? "active" : ""}`}
              onClick={() => handleNav("/workspace/organizations", true)}
              title="Organizations"
            >
              <span className="nav-item-icon"><IconOrganizations /></span>
              <span className="nav-item-text">Organizations</span>
            </button>

            {can("VIEW_PROJECT") && (
              <button
                type="button"
                className={`dashboard-nav-item ${isModule("projects") ? "active" : ""}`}
                onClick={() => handleNav("/workspace/projects", can("VIEW_PROJECT"))}
                title="Projects"
              >
                <span className="nav-item-icon"><IconProjects /></span>
                <span className="nav-item-text">Projects</span>
              </button>
            )}

            {can("VIEW_TICKET") && (
              <button
                type="button"
                className={`dashboard-nav-item ${isModule("tasks") ? "active" : ""}`}
                onClick={() => handleNav("/workspace/tasks", can("VIEW_TICKET"))}
                title="Tasks"
              >
                <span className="nav-item-icon"><IconTasks /></span>
                <span className="nav-item-text">Tasks</span>
              </button>
            )}

            <button
              type="button"
              className={`dashboard-nav-item ${isModule("attachments") ? "active" : ""} ${!can("VIEW_ATTACHMENT") ? "locked" : ""}`}
              onClick={() => handleNav("/workspace/attachments", can("VIEW_ATTACHMENT"))}
              title="Attachments"
            >
              <span className="nav-item-icon"><IconAttachments /></span>
              <span className="nav-item-text">Attachments</span>
              {!can("VIEW_ATTACHMENT") && <span className="locked-icon"><IconLock /></span>}
            </button>

            {can("VIEW_USER") && (
              <button
                type="button"
                className={`dashboard-nav-item ${isModule("users") ? "active" : ""}`}
                onClick={() => handleNav("/workspace/users", can("VIEW_USER"))}
                title="Users"
              >
                <span className="nav-item-icon"><IconUsers /></span>
                <span className="nav-item-text">Users</span>
              </button>
            )}
          </nav>

          {isAdmin && (
            <>
              <div className="sidebar-section-divider"></div>
              <div className="sidebar-section-label">ADMINISTRATION</div>
              <nav className="dashboard-nav">
                <button
                  type="button"
                  className={`dashboard-nav-item ${isModule("roles") ? "active" : ""}`}
                  onClick={() => handleNav("/workspace/roles", isAdmin)}
                  title="Roles"
                >
                  <span className="nav-item-icon"><IconRoles /></span>
                  <span className="nav-item-text">Roles</span>
                </button>

                <button
                  type="button"
                  className={`dashboard-nav-item ${isModule("permissions") ? "active" : ""}`}
                  onClick={() => handleNav("/workspace/permissions", isAdmin)}
                  title="Permissions"
                >
                  <span className="nav-item-icon"><IconPermissions /></span>
                  <span className="nav-item-text">Permissions</span>
                </button>
              </nav>
            </>
          )}

        </div>

        <div className="sidebar-bottom-actions">
          <div 
            className="sidebar-profile-card"
            onClick={() => handleNav("/workspace/profile", true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleNav("/workspace/profile", true);
              }
            }}
          >
            <div className="sidebar-profile-avatar">
              {session?.user?.Name ? session.user.Name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="sidebar-profile-info">
              <strong className="sidebar-profile-name">{session?.user?.Name || "User"}</strong>
              <span className="sidebar-profile-role">{session?.roles?.[0] || "User"}</span>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
          >
            <span className="nav-item-icon"><IconLogout /></span>
            <span className="nav-item-text">Logout</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default AppSidebar;
