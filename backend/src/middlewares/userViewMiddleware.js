const prisma = require("../config/prisma");

const userViewMiddleware = async (req, res, next) => {
    try {
        const loggedInUserId = Number(req.user.UserID);
        const requestedUserId = Number(req.params.id);

        if (!Number.isInteger(requestedUserId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        // Always allow a user to view or edit their own profile, regardless of roles.
        if (loggedInUserId === requestedUserId) {
            return next();
        }

        const userRoles = await prisma.userrole.findMany({
            where: {
                UserID: loggedInUserId,
            },
        });

        if (userRoles.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access denied. No role assigned.",
            });
        }

        const roleIds = userRoles.map(
            (userRole) => userRole.RoleID
        );

        const roles = await prisma.role.findMany({
            where: {
                RoleID: {
                    in: roleIds,
                },
            },
        });

        const isAdmin = roles.some(
            (role) => ["Admin", "Administrator", "Owner"].includes(role.Name)
        );

        if (isAdmin) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "You can only view your own profile.",
        });
    } catch (error) {
        console.error("User view authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Authorization failed.",
        });
    }
};

module.exports = userViewMiddleware;