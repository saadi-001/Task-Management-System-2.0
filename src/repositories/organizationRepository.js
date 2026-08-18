const prisma = require("../config/prisma");

// ==============================
// Create Organization
// ==============================
const createOrganization = async (organizationData) => {
    return await prisma.organization.create({
        data: {
            Name: organizationData.name,
            Email: organizationData.email,
            ContactNo: organizationData.contactNo,
            Logo: organizationData.logo,
            Theme: organizationData.theme,
            OwnerID: organizationData.ownerID
        }
    });
};


// ==============================
// Get All Organizations
// ==============================
const getOrganizations = async () => {
    return await prisma.organization.findMany();
};


// ==============================
// Get Organization By ID
// ==============================
const getOrganizationById = async (id) => {
    return await prisma.organization.findUnique({
        where: {
            OrganizationID: Number(id)
        }
    });
};


// ==============================
// Update Organization
// ==============================
const updateOrganization = async (id, organizationData) => {
    return await prisma.organization.update({
        where: {
            OrganizationID: Number(id)
        },
        data: {
            Name: organizationData.name,
            Email: organizationData.email,
            ContactNo: organizationData.contactNo,
            Logo: organizationData.logo,
            Theme: organizationData.theme
        }
    });
};


// ==============================
// Delete Organization
// ==============================
const deleteOrganization = async (id) => {
    return await prisma.organization.delete({
        where: {
            OrganizationID: Number(id)
        }
    });
};


// ==============================
// Assign User To Organization
// ==============================
const assignUserToOrganization = async (
    organizationId,
    userId,
    role
) => {
    return await prisma.organizationmembers.create({
        data: {
            OrganizationID: Number(organizationId),
            UserID: Number(userId),
            Role: role
        }
    });
};


// ==============================
// Remove User From Organization
// ==============================
const removeUserFromOrganization = async (
    organizationId,
    userId
) => {
    return await prisma.organizationmembers.deleteMany({
        where: {
            OrganizationID: Number(organizationId),
            UserID: Number(userId)
        }
    });
};


// ==============================
// Transfer Organization Owner
// ==============================
const transferOrganizationOwner = async (
    organizationId,
    newOwnerId
) => {
    return await prisma.organization.update({
        where: {
            OrganizationID: Number(organizationId)
        },
        data: {
            OwnerID: Number(newOwnerId)
        }
    });
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