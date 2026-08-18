const prisma = require("../config/prisma");


// ==============================
// Create Permission
// ==============================
const createPermission = async (permissionData) => {
    return await prisma.permission.create({
        data: {
            Name: permissionData.name
        }
    });
};


// ==============================
// Get All Permissions
// ==============================
const getPermissions = async () => {
    return await prisma.permission.findMany({
        orderBy: {
            PermissionID: "asc"
        }
    });
};


// ==============================
// Get Permission By ID
// ==============================
const getPermissionById = async (id) => {
    return await prisma.permission.findUnique({
        where: {
            PermissionID: Number(id)
        }
    });
};


// ==============================
// Update Permission
// ==============================
const updatePermission = async (
    id,
    permissionData
) => {
    return await prisma.permission.update({
        where: {
            PermissionID: Number(id)
        },
        data: {
            Name: permissionData.name
        }
    });
};


// ==============================
// Delete Permission
// ==============================
const deletePermission = async (id) => {
    return await prisma.permission.delete({
        where: {
            PermissionID: Number(id)
        }
    });
};


// ==============================
// Export
// ==============================
module.exports = {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission
};