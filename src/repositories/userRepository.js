const prisma = require("../config/prisma");

const findAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            UserID: true,
            Name: true,
            Email: true,
            DateOfBirth: true,
            IsActive: true,
        },
    });

    const userRoles = await prisma.userrole.findMany();

    const roles = await prisma.role.findMany();

    return users.map((user) => {
        const assignedRoleIds = userRoles
            .filter((userRole) => userRole.UserID === user.UserID)
            .map((userRole) => userRole.RoleID);

        const userAssignedRoles = roles.filter((role) =>
            assignedRoleIds.includes(role.RoleID)
        );

        return {
            ...user,
            Roles: userAssignedRoles,
        };
    });
};

const findUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: {
            UserID: Number(id),
        },
        select: {
            UserID: true,
            Name: true,
            Email: true,
            DateOfBirth: true,
            IsActive: true,
        },
    });

    if (!user) {
        return null;
    }

    const userRoles = await prisma.userrole.findMany({
        where: {
            UserID: Number(id),
        },
    });

    const roles = await prisma.role.findMany();

    const assignedRoleIds = userRoles.map(
        (userRole) => userRole.RoleID
    );

    const userAssignedRoles = roles.filter((role) =>
        assignedRoleIds.includes(role.RoleID)
    );

    return {
        ...user,
        Roles: userAssignedRoles,
    };
};

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            Email: email,
        },
        select: {
            UserID: true,
            Name: true,
            Email: true,
            IsActive: true,
        },
    });
};

const updateUser = async (id, data) => {
    const userId = Number(id);

    return await prisma.user.update({
        where: {
            UserID: userId,
        },
        data,
        select: {
            UserID: true,
            Name: true,
            Email: true,
            DateOfBirth: true,
            IsActive: true,
        },
    });
};

const deleteUser = async (id) => {
    const userId = Number(id);

    const user = await prisma.user.findUnique({
        where: {
            UserID: userId,
        },
    });

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    if (!user.IsActive) {
        const error = new Error("User is already inactive.");
        error.statusCode = 409;
        throw error;
    }

    // Check whether the user has the Admin role
    const adminRole = await prisma.role.findFirst({
        where: {
            Name: "Admin",
        },
    });

    if (adminRole) {
        const userAdminRole = await prisma.userrole.findFirst({
            where: {
                UserID: userId,
                RoleID: adminRole.RoleID,
            },
        });

        // If this user is an Admin, check how many active Admins exist
        if (userAdminRole) {
            const activeAdminUserRoles = await prisma.userrole.findMany({
                where: {
                    RoleID: adminRole.RoleID,
                },
            });

            const activeAdminUserIds = activeAdminUserRoles.map(
                (userRole) => userRole.UserID
            );

            const activeAdminCount = await prisma.user.count({
                where: {
                    UserID: {
                        in: activeAdminUserIds,
                    },
                    IsActive: true,
                },
            });

            // Do not allow the last active Admin to be deactivated
            if (activeAdminCount <= 1) {
                const error = new Error(
                    "Cannot deactivate the last active Admin."
                );
                error.statusCode = 409;
                throw error;
            }
        }
    }

    // Soft delete: keep user and all history
    return await prisma.user.update({
        where: {
            UserID: userId,
        },
        data: {
            IsActive: false,
        },
    });
};

const activateUser = async (id) => {
    const userId = Number(id);

    const user = await prisma.user.findUnique({
        where: {
            UserID: userId,
        },
    });

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    if (user.IsActive) {
        const error = new Error("User is already active.");
        error.statusCode = 409;
        throw error;
    }

    return await prisma.user.update({
        where: {
            UserID: userId,
        },
        data: {
            IsActive: true,
        },
    });
};

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    updateUser,
    deleteUser,
    activateUser,
};