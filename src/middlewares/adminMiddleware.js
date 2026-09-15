const prisma = require("../config/prisma");

const requireAdmin = async (req, res, next) => {
    try {
        const userRoles = await prisma.userrole.findMany({
            where: { UserID: req.user.UserID },
        });

        const roles = await prisma.role.findMany({
            where: {
                RoleID: { in: userRoles.map((userRole) => userRole.RoleID) },
            },
        });

        if (!roles.some((role) => role.Name === "Admin")) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Administrator permission is required.",
            });
        }

        return next();
    } catch (error) {
        console.error("Admin authorization error:", error);
        return res.status(500).json({
            success: false,
            message: "Authorization failed.",
        });
    }
};

module.exports = requireAdmin;
