const roleRepository = require("../repositories/roleRepository");
const notificationService = require("./notificationService");


// ==============================
// Create Role
// ==============================
const createRole = async (roleData) => {
    return await roleRepository.createRole(roleData);
};


// ==============================
// Get All Roles
// ==============================
const getRoles = async () => {
    return await roleRepository.getRoles();
};


// ==============================
// Get Role By ID
// ==============================
const getRoleById = async (id) => {
    return await roleRepository.getRoleById(id);
};


// ==============================
// Update Role
// ==============================
const updateRole = async (id, roleData) => {
    return await roleRepository.updateRole(
        id,
        roleData
    );
};


// ==============================
// Delete Role
// ==============================
const deleteRole = async (id) => {
    return await roleRepository.deleteRole(id);
};


// ==============================
// Assign Permission To Role
// ==============================
const assignPermissionToRole = async (
    roleId,
    permissionName
) => {

    const result = await roleRepository.assignPermissionToRole(
        roleId,
        permissionName
    );
    const role = await roleRepository.getRoleById(roleId);
    const userIds = await roleRepository.getUserIdsForRole(roleId);
    await Promise.all(userIds.map((userId) =>
        notificationService.permissionsChanged(userId, role?.Name || "assigned")
    ));
    return result;

};


// ==============================
// Remove Permission From Role
// ==============================
const removePermissionFromRole = async (
    roleId,
    permissionId
) => {

    const result = await roleRepository.removePermissionFromRole(
        roleId,
        permissionId
    );
    const role = await roleRepository.getRoleById(roleId);
    const userIds = await roleRepository.getUserIdsForRole(roleId);
    await Promise.all(userIds.map((userId) =>
        notificationService.permissionsChanged(userId, role?.Name || "assigned")
    ));
    return result;

};


// ==============================
// Get Role Permissions
// ==============================
const getRolePermissions = async (roleId) => {

    return await roleRepository.getRolePermissions(
        roleId
    );

};


// ==============================
// Assign Role To User
// ==============================
const assignRoleToUser = async (
    userId,
    roleId
) => {

    const result = await roleRepository.assignRoleToUser(
        userId,
        roleId
    );
    const role = await roleRepository.getRoleById(roleId);
    await notificationService.roleChanged(userId, role?.Name || "selected", true);
    return result;

};


// ==============================
// Remove Role From User
// ==============================
const removeRoleFromUser = async (
    userId,
    roleId
) => {

    const role = await roleRepository.getRoleById(roleId);
    const result = await roleRepository.removeRoleFromUser(
        userId,
        roleId
    );
    if (result.count > 0) {
        await notificationService.roleChanged(userId, role?.Name || "selected", false);
    }
    return result;

};


// ==============================
// Get User Roles
// ==============================
const getUserRoles = async (userId) => {

    return await roleRepository.getUserRoles(
        userId
    );

};

// ==============================
// Get User Permissions
// ==============================
const getUserPermissions = async (userId) => {

    return await roleRepository.getUserPermissions(
        userId
    );

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
