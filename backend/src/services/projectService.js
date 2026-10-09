const projectRepository = require("../repositories/projectRepository");
const notificationService = require("./notificationService");

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

// Get Projects by Organization
const getProjectsByOrganizationId = async (organizationId) => {
    return await projectRepository.findProjectsByOrganizationId(
        organizationId
    );
};

// Update Project
const updateProject = async (projectId, projectData, updaterId) => {
    await getProjectById(projectId);

    const project = await projectRepository.updateProject(
        projectId,
        projectData
    );
    await notificationService.projectUpdated(project, updaterId);
    return project;
};

// Link Existing Project to Organization
const linkProjectToOrganization = async (
    projectId,
    organizationId
) => {
    await getProjectById(projectId);

    return await projectRepository.updateProject(projectId, {
        OrganizationID: organizationId,
    });
};

// Unlink Project from Organization
const unlinkProjectFromOrganization = async (projectId) => {
    await getProjectById(projectId);

    return await projectRepository.updateProject(projectId, {
        OrganizationID: null,
    });
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
    getProjectsByOrganizationId,
    updateProject,
    linkProjectToOrganization,
    unlinkProjectFromOrganization,
    deleteProject,
};
