const organizationRepository = require("../repositories/organizationRepository");


// ==============================
// Create Organization
// ==============================
const createOrganization = async (organizationData) => {
    return await organizationRepository.createOrganization(
        organizationData
    );
};


// ==============================
// Get All Organizations
// ==============================
const getOrganizations = async () => {
    return await organizationRepository.getOrganizations();
};


// ==============================
// Get Organization By ID
// ==============================
const getOrganizationById = async (id) => {
    return await organizationRepository.getOrganizationById(id);
};


// ==============================
// Update Organization
// ==============================
const updateOrganization = async (id, organizationData) => {
    return await organizationRepository.updateOrganization(
        id,
        organizationData
    );
};


// ==============================
// Delete Organization
// ==============================
const deleteOrganization = async (id) => {
    return await organizationRepository.deleteOrganization(id);
};


// ==============================
// Assign User To Organization
// ==============================
const assignUserToOrganization = async (
    organizationId,
    userId,
    role
) => {
    return await organizationRepository.assignUserToOrganization(
        organizationId,
        userId,
        role
    );
};


// ==============================
// Remove User From Organization
// ==============================
const removeUserFromOrganization = async (
    organizationId,
    userId
) => {
    return await organizationRepository.removeUserFromOrganization(
        organizationId,
        userId
    );
};


// ==============================
// Transfer Organization Owner
// ==============================
const transferOrganizationOwner = async (
    organizationId,
    newOwnerId
) => {
    return await organizationRepository.transferOrganizationOwner(
        organizationId,
        newOwnerId
    );
};


// ==============================
// Export
// ==============================
module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    assignUserToOrganization,
    removeUserFromOrganization,
    transferOrganizationOwner
};