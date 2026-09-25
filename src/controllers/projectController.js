const projectService = require("../services/projectService");

const getProjectId = (value) => {
    const projectId = Number(value);

    if (!Number.isInteger(projectId) || projectId < 1) {
        const error = new Error("Project id must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    return projectId;
};

const getOrganizationId = (value) => {
    const organizationId = Number(value);

    if (!Number.isInteger(organizationId) || organizationId < 1) {
        const error = new Error(
            "Organization id must be a positive integer"
        );
        error.statusCode = 400;
        throw error;
    }

    return organizationId;
};

const getProjectData = (body, { required = false } = {}) => {
    const { Name, Description, OrganizationID, OwnerID } = body || {};
    const data = {};

    if (required && (!Name || !String(Name).trim())) {
        const error = new Error("Name is required");
        error.statusCode = 400;
        throw error;
    }

    if (Name !== undefined) {
        data.Name = String(Name).trim();
    }

    if (Description !== undefined) {
        data.Description = Description || null;
    }

    for (const [field, value] of [
        ["OrganizationID", OrganizationID],
        ["OwnerID", OwnerID],
    ]) {
        if (value !== undefined) {
            const id = Number(value);

            if (!Number.isInteger(id) || id < 1) {
                const error = new Error(
                    `${field} must be a positive integer`
                );
                error.statusCode = 400;
                throw error;
            }

            data[field] = id;
        }
    }

    if (required && (!data.OrganizationID || !data.OwnerID)) {
        const error = new Error(
            "OrganizationID and OwnerID are required"
        );
        error.statusCode = 400;
        throw error;
    }

    return data;
};

// Create Project
const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(
            getProjectData(req.body, { required: true })
        );

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create project",
        });
    }
};

// Get All Projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await projectService.getAllProjects();

        return res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch projects",
        });
    }
};

// Get Projects by Organization
const getProjectsByOrganizationId = async (req, res) => {
    try {
        const organizationId = getOrganizationId(
            req.params.organizationId
        );

        const projects =
            await projectService.getProjectsByOrganizationId(
                organizationId
            );

        return res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch organization projects",
        });
    }
};

// Get Project by ID
const getProjectById = async (req, res) => {
    try {
        const projectId = getProjectId(req.params.id);

        const project = await projectService.getProjectById(projectId);

        return res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch project",
        });
    }
};

// Update Project
const updateProject = async (req, res) => {
    try {
        const projectId = getProjectId(req.params.id);

        const project = await projectService.updateProject(
            projectId,
            getProjectData(req.body)
        );

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: error.statusCode || 500,
            message: error.message || "Failed to update project",
        });
    }
};

// Link Existing Project to Organization
const linkProjectToOrganization = async (req, res) => {
    try {
        const projectId = getProjectId(req.params.id);
        const organizationId = getOrganizationId(
            req.body.OrganizationID
        );

        const project =
            await projectService.linkProjectToOrganization(
                projectId,
                organizationId
            );

        return res.status(200).json({
            success: true,
            message: "Project linked to organization successfully",
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to link project to organization",
        });
    }
};

// Unlink Project from Organization
const unlinkProjectFromOrganization = async (req, res) => {
    try {
        const projectId = getProjectId(req.params.id);

        const project =
            await projectService.unlinkProjectFromOrganization(
                projectId
            );

        return res.status(200).json({
            success: true,
            message: "Project unlinked from organization successfully",
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to unlink project from organization",
        });
    }
};

// Delete Project
const deleteProject = async (req, res) => {
    try {
        const projectId = getProjectId(req.params.id);

        const project = await projectService.deleteProject(projectId);

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete project",
        });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectsByOrganizationId,
    getProjectById,
    updateProject,
    linkProjectToOrganization,
    unlinkProjectFromOrganization,
    deleteProject,
};