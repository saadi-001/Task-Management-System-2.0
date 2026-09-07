const prisma = require("../config/prisma");



// ==============================
// Create Role
// ==============================
const createRole = async (roleData) => {
    return await prisma.role.create({
        data: {
            Name: roleData.name
        }
    });
};



// ==============================
// Get All Roles
// ==============================
const getRoles = async () => {
    return await prisma.role.findMany({
        orderBy: {
            RoleID: "asc"
        }
    });
};



// ==============================
// Get Role By ID
// ==============================
const getRoleById = async (id) => {
    return await prisma.role.findUnique({
        where: {
            RoleID: Number(id)
        }
    });
};



// ==============================
// Update Role
// ==============================
const updateRole = async (id, roleData) => {
    return await prisma.role.update({
        where: {
            RoleID: Number(id)
        },
        data: {
            Name: roleData.name
        }
    });
};



// ==============================
// Delete Role
// ==============================
const deleteRole = async (id) => {
    return await prisma.role.delete({
        where: {
            RoleID: Number(id)
        }
    });
};



// ==============================
// Assign Permission To Role
// ==============================
const assignPermissionToRole = async (
    roleId,
    permissionName
) => {

    // Find permission by name
    const permission = await prisma.permission.findUnique({
        where: {
            Name: permissionName
        }
    });

    // Permission does not exist
    if (!permission) {
        throw new Error("Permission not found");
    }

    // Create role-permission relationship
    return await prisma.rolepermission.create({
        data: {
            RoleID: Number(roleId),
            PermissionID: permission.PermissionID
        }
    });
};



// ==============================
// Remove Permission From Role
// ==============================
const removePermissionFromRole = async (
    roleId,
    permissionId
) => {
    return await prisma.rolepermission.deleteMany({
        where: {
            RoleID: Number(roleId),
            PermissionID: Number(permissionId)
        }
    });
};



// ==============================
// Assign Role To User
// ==============================
const assignRoleToUser = async (
    userId,
    roleId
) => {
    return await prisma.userrole.create({
        data: {
            UserID: Number(userId),
            RoleID: Number(roleId)
        }
    });
};



// ==============================
// Remove Role From User
// ==============================
const removeRoleFromUser = async (
    userId,
    roleId
) => {
    return await prisma.userrole.deleteMany({
        where: {
            UserID: Number(userId),
            RoleID: Number(roleId)
        }
    });
};



// ==============================
// Get User Roles
// ==============================
const getUserRoles = async (userId) => {
    return await prisma.userrole.findMany({
        where: {
            UserID: Number(userId)
        }
    });
};


// ==============================
// Get Permissions Assigned To Role
// ==============================

const getRolePermissions = async (roleId) => {

    const rolePermissions = await prisma.rolepermission.findMany({

        where: {
            RoleID: Number(roleId)
        }

    });

    const permissionIds = rolePermissions.map(
        (item) => item.PermissionID
    );

    return await prisma.permission.findMany({

        where: {
            PermissionID: {
                in: permissionIds
            }
        },

        orderBy: {
            PermissionID: "asc"
        }

    });

};

// ==============================
// Get User Permissions
// ==============================
const getUserPermissions = async (userId) => {

    const userRoles = await prisma.userrole.findMany({
        where: {
            UserID: Number(userId)
        }
    });

    const roleIds = userRoles.map(
        (item) => item.RoleID
    );

    const rolePermissions = await prisma.rolepermission.findMany({
        where: {
            RoleID: {
                in: roleIds
            }
        }
    });

    const permissionIds = [
        ...new Set(
            rolePermissions.map(
                (item) => item.PermissionID
            )
        )
    ];

    return await prisma.permission.findMany({
        where: {
            PermissionID: {
                in: permissionIds
            }
        },
        orderBy: {
            PermissionID: "asc"
        }
    });
};


// ==============================
// Export
// ==============================

module.exports = {

    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    removePermissionFromRole,
    getRolePermissions,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    getUserPermissions


};