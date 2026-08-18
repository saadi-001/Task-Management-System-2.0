const permissionRepository = require("../repositories/permissionRepository");


// ==============================
// Create Permission
// ==============================
const createPermission = async (permissionData) => {
    return await permissionRepository.createPermission(
        permissionData
    );
};


// ==============================
// Get All Permissions
// ==============================
const getPermissions = async () => {
    return await permissionRepository.getPermissions();
};


// ==============================
// Get Permission By ID
// ==============================
const getPermissionById = async (id) => {
    return await permissionRepository.getPermissionById(id);
};


// ==============================
// Update Permission
// ==============================
const updatePermission = async (
    id,
    permissionData
) => {
    return await permissionRepository.updatePermission(
        id,
        permissionData
    );
};


// ==============================
// Delete Permission
// ==============================
const deletePermission = async (id) => {
    return await permissionRepository.deletePermission(id);
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