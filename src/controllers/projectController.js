const projectService = require("../services/projectService");

// Create Project
const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(req.body);

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

// Get Project by ID
const getProjectById = async (req, res) => {
    try {
        const projectId = Number(req.params.id);

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
        const projectId = Number(req.params.id);

        const project = await projectService.updateProject(
            projectId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update project",
        });
    }
};

// Delete Project
const deleteProject = async (req, res) => {
    try {
        const projectId = Number(req.params.id);

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
    getProjectById,
    updateProject,
    deleteProject,
};