const roleRepository = require("../repositories/roleRepository");


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

    return await roleRepository.assignPermissionToRole(
        roleId,
        permissionName
    );

};


// ==============================
// Remove Permission From Role
// ==============================
const removePermissionFromRole = async (
    roleId,
    permissionId
) => {

    return await roleRepository.removePermissionFromRole(
        roleId,
        permissionId
    );

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

    return await roleRepository.assignRoleToUser(
        userId,
        roleId
    );

};


// ==============================
// Remove Role From User
// ==============================
const removeRoleFromUser = async (
    userId,
    roleId
) => {

    return await roleRepository.removeRoleFromUser(
        userId,
        roleId
    );

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