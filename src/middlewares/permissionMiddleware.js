const prisma = require("../config/prisma");

// ==============================
// Authorize User
// ==============================
const authorize = (...permissions) => {

    return async (req, res, next) => {

        try {

            const userId = req.user.UserID;

            // Get all roles assigned to the user
            const userRoles = await prisma.userrole.findMany({
                where: {
                    UserID: userId
                }
            });

            // User has no roles
            if (userRoles.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. No role assigned."
                });
            }

            // Extract Role IDs
            const roleIds = userRoles.map(
                role => role.RoleID
            );

            // Get permissions assigned to all user roles
            const rolePermissions = await prisma.rolepermission.findMany({
                where: {
                    RoleID: {
                        in: roleIds
                    }
                }
            });

            // Extract Permission IDs
            const permissionIds = rolePermissions.map(
                rp => rp.PermissionID
            );

            // Get actual permissions
            const userPermissionRecords = await prisma.permission.findMany({
                where: {
                    PermissionID: {
                        in: permissionIds
                    }
                }
            });

            // Permission names
            const userPermissions = userPermissionRecords.map(
                permission => permission.Name
            );

            // Check required permission
            const hasPermission = permissions.some(
                permission => userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action."
                });
            }

            next();

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Authorization failed."
            });

        }

    };

};

module.exports = authorize;