const roleService = require("../services/roleService");


// ==============================
// Create Role
// ==============================
const createRole = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Role name is required"
            });
        }

        const role = await roleService.createRole({
            name
        });

        res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: role
        });

    } catch (error) {
        console.error("Create Role Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create role"
        });
    }
};


// ==============================
// Get All Roles
// ==============================
const getRoles = async (req, res) => {
    try {
        const roles = await roleService.getRoles();

        res.status(200).json({
            success: true,
            data: roles
        });

    } catch (error) {
        console.error("Get Roles Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch roles"
        });
    }
};


// ==============================
// Get Role By ID
// ==============================
const getRoleById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const role = await roleService.getRoleById(id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });

    } catch (error) {
        console.error("Get Role Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch role"
        });
    }
};


// ==============================
// Update Role
// ==============================
const updateRole = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Role name is required"
            });
        }

        const role = await roleService.updateRole(
            id,
            { name }
        );

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: role
        });

    } catch (error) {
        console.error("Update Role Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update role"
        });
    }
};


// ==============================
// Delete Role
// ==============================
const deleteRole = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await roleService.deleteRole(id);

        res.status(200).json({
            success: true,
            message: "Role deleted successfully"
        });

    } catch (error) {
        console.error("Delete Role Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete role"
        });
    }
};


// ==============================
// Assign Permission To Role
// ==============================
const assignPermissionToRole = async (req, res) => {
    try {

        const {
            roleId,
            permissionName
        } = req.body;

        if (!roleId || !permissionName) {
            return res.status(400).json({
                success: false,
                message: "roleId and permissionName are required"
            });
        }

        const result = await roleService.assignPermissionToRole(
            roleId,
            permissionName
        );

        res.status(201).json({
            success: true,
            message: "Permission assigned to role successfully",
            data: result
        });

    } catch (error) {
        console.error("Assign Permission Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to assign permission to role"
        });
    }
};


// ==============================
// Remove Permission From Role
// ==============================
const removePermissionFromRole = async (req, res) => {
    try {

        const {
            roleId,
            permissionId
        } = req.body;

        const result =
            await roleService.removePermissionFromRole(
                roleId,
                permissionId
            );

        if (result.count === 0) {
            return res.status(404).json({
                success: false,
                message: "Permission is not assigned to this role"
            });
        }

        res.status(200).json({
            success: true,
            message: "Permission removed from role successfully"
        });

    } catch (error) {
        console.error("Remove Permission Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to remove permission from role"
        });
    }
};


// ==============================
// Get Role Permissions
// ==============================
const getRolePermissions = async (req, res) => {
    try {

        const roleId = Number(req.params.roleId);

        const permissions =
            await roleService.getRolePermissions(roleId);

        res.status(200).json({
            success: true,
            data: permissions
        });

    } catch (error) {
        console.error("Get Role Permissions Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch role permissions"
        });
    }
};


// ==============================
// Assign Role To User
// ==============================
const assignRoleToUser = async (req, res) => {
    try {

        const {
            userId,
            roleId
        } = req.body;

        const result =
            await roleService.assignRoleToUser(
                userId,
                roleId
            );

        res.status(201).json({
            success: true,
            message: "Role assigned to user successfully",
            data: result
        });

    } catch (error) {
        console.error("Assign Role Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to assign role to user"
        });
    }
};


// ==============================
// Remove Role From User
// ==============================
const removeRoleFromUser = async (req, res) => {
    try {

        const {
            userId,
            roleId
        } = req.body;

        const result =
            await roleService.removeRoleFromUser(
                userId,
                roleId
            );

        if (result.count === 0) {
            return res.status(404).json({
                success: false,
                message: "Role is not assigned to this user"
            });
        }

        res.status(200).json({
            success: true,
            message: "Role removed from user successfully"
        });

    } catch (error) {
        console.error("Remove Role Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to remove role from user"
        });
    }
};


// ==============================
// Get User Roles
// ==============================
const getUserRoles = async (req, res) => {
    try {

        const userId = Number(req.params.userId);

        const roles =
            await roleService.getUserRoles(userId);

        res.status(200).json({
            success: true,
            data: roles
        });

    } catch (error) {
        console.error("Get User Roles Error:", error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch user roles"
        });
    }
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
    getUserRoles
};