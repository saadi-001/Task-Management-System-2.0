const prisma = require("../config/prisma");

// ==============================
// Authorize User
// ==============================
const authorize = (...permissions) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.UserID;

            // ==============================
            // Get User Roles
            // ==============================
            const userRoles = await prisma.userrole.findMany({
                where: {
                    UserID: userId,
                },
            });

            // User has no roles
            if (userRoles.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. No role assigned.",
                });
            }

            const roleIds = userRoles.map(
                (userRole) => userRole.RoleID
            );

            // ==============================
            // Get Roles
            // ==============================
            const roles = await prisma.role.findMany({
                where: {
                    RoleID: {
                        in: roleIds,
                    },
                },
            });

            // ==============================
            // Admin Bypass
            // ==============================
            const isAdmin = roles.some(
                (role) => role.Name === "Admin"
            );

            if (isAdmin) {
                return next();
            }

            // ==============================
            // Get Role Permissions
            // ==============================
            const rolePermissions =
                await prisma.rolepermission.findMany({
                    where: {
                        RoleID: {
                            in: roleIds,
                        },
                    },
                });

            const permissionIds = rolePermissions.map(
                (rolePermission) =>
                    rolePermission.PermissionID
            );

            // ==============================
            // Get Permissions
            // ==============================
            const userPermissionRecords =
                await prisma.permission.findMany({
                    where: {
                        PermissionID: {
                            in: permissionIds,
                        },
                    },
                });

            const userPermissions =
                userPermissionRecords.map(
                    (permission) => permission.Name
                );

            // ==============================
            // Check Required Permission
            // ==============================
            const hasPermission = permissions.some(
                (permission) =>
                    userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have permission to perform this action.",
                });
            }

            return next();
        } catch (error) {
            console.error(
                "AUTHORIZATION ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Authorization failed.",
            });
        }
    };
};

module.exports = authorize;