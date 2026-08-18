const permissionService = require("../services/permissionService");


// ==============================
// Create Permission
// ==============================
const createPermission = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Permission name is required"
            });
        }

        const permission =
            await permissionService.createPermission({
                name
            });

        res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create permission"
        });
    }
};


// ==============================
// Get All Permissions
// ==============================
const getPermissions = async (req, res) => {
    try {
        const permissions =
            await permissionService.getPermissions();

        res.status(200).json({
            success: true,
            data: permissions
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch permissions"
        });
    }
};


// ==============================
// Get Permission By ID
// ==============================
const getPermissionById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const permission =
            await permissionService.getPermissionById(id);

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found"
            });
        }

        res.status(200).json({
            success: true,
            data: permission
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch permission"
        });
    }
};


// ==============================
// Update Permission
// ==============================
const updatePermission = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Permission name is required"
            });
        }

        const permission =
            await permissionService.updatePermission(
                id,
                { name }
            );

        res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            data: permission
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update permission"
        });
    }
};


// ==============================
// Delete Permission
// ==============================
const deletePermission = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await permissionService.deletePermission(id);

        res.status(200).json({
            success: true,
            message: "Permission deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete permission"
        });
    }
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