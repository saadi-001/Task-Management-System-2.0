const prisma = require("../config/prisma");

// Create Project
const createProject = async (projectData) => {
    return await prisma.project.create({
        data: projectData,
    });
};

// Get Project by ID
const findProjectById = async (projectId) => {
    return await prisma.project.findUnique({
        where: {
            ProjectID: projectId,
        },
    });
};

// Get all Projects
const findAllProjects = async () => {
    return await prisma.project.findMany();
};

// Update Project
const updateProject = async (projectId, projectData) => {
    return await prisma.project.update({
        where: {
            ProjectID: projectId,
        },
        data: projectData,
    });
};

// Delete Project
const deleteProject = async (projectId) => {
    return await prisma.project.delete({
        where: {
            ProjectID: projectId,
        },
    });
};

module.exports = {
    createProject,
    findProjectById,
    findAllProjects,
    updateProject,
    deleteProject,
};