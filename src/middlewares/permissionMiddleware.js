const prisma = require("../config/prisma");

// ==============================
// Authorize User
// ==============================
const authorize = (...permissions) => {

    return async (req, res, next) => {

        try {

            console.log("A: authorize started");

            const userId = req.user.UserID;

            console.log("B: userId =", userId);

            // Get all roles assigned to the user
            const userRoles = await prisma.userrole.findMany({
                where: {
                    UserID: userId
                }
            });

            console.log("C: userRoles query completed", userRoles);

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

            console.log("D: roleIds =", roleIds);

            // Get permissions assigned to all user roles
            const rolePermissions = await prisma.rolepermission.findMany({
                where: {
                    RoleID: {
                        in: roleIds
                    }
                }
            });

            console.log("E: rolePermissions query completed", rolePermissions);

            // Extract Permission IDs
            const permissionIds = rolePermissions.map(
                rp => rp.PermissionID
            );

            console.log("F: permissionIds =", permissionIds);

            // Get actual permissions
            const userPermissionRecords = await prisma.permission.findMany({
                where: {
                    PermissionID: {
                        in: permissionIds
                    }
                }
            });

            console.log(
                "G: permission query completed",
                userPermissionRecords
            );

            // Permission names
            const userPermissions = userPermissionRecords.map(
                permission => permission.Name
            );

            console.log("H: userPermissions =", userPermissions);

            // Check required permission
            const hasPermission = permissions.some(
                permission => userPermissions.includes(permission)
            );

            console.log("I: hasPermission =", hasPermission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action."
                });
            }

            console.log("J: permission granted, calling next()");

            next();

        } catch (error) {

            console.error("AUTHORIZATION ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Authorization failed."
            });

        }

    };

};

module.exports = authorize;