const projectRepository = require("../repositories/projectRepository");

// Create Project
const createProject = async (projectData) => {
    return await projectRepository.createProject(projectData);
};

// Get Project by ID
const getProjectById = async (projectId) => {
    const project = await projectRepository.findProjectById(projectId);

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        throw error;
    }

    return project;
};

// Get All Projects
const getAllProjects = async () => {
    return await projectRepository.findAllProjects();
};

// Update Project
const updateProject = async (projectId, projectData) => {
    await getProjectById(projectId);

    return await projectRepository.updateProject(
        projectId,
        projectData
    );
};

// Delete Project
const deleteProject = async (projectId) => {
    await getProjectById(projectId);

    return await projectRepository.deleteProject(projectId);
};

module.exports = {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject,
};