const prisma = require("../config/prisma");

const findAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            UserID: true,
            Name: true,
            Email: true,
            DateOfBirth: true,
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

const deleteUser = async (id) => {
    const userId = Number(id);

    const organizationOwner = await prisma.organization.findFirst({
        where: {
            OwnerID: userId,
        },
    });

    if (organizationOwner) {
        const error = new Error(
            "Cannot delete user because this user is an organization owner."
        );
        error.statusCode = 409;
        throw error;
    }

    const projectOwner = await prisma.project.findFirst({
        where: {
            OwnerID: userId,
        },
    });

    if (projectOwner) {
        const error = new Error(
            "Cannot delete user because this user is a project owner."
        );
        error.statusCode = 409;
        throw error;
    }

    const organizationMember = await prisma.organizationmembers.findFirst({
        where: {
            UserID: userId,
        },
    });

    if (organizationMember) {
        const error = new Error(
            "Cannot delete user because this user is an organization member."
        );
        error.statusCode = 409;
        throw error;
    }

    const projectMember = await prisma.projectmembers.findFirst({
        where: {
            UserID: userId,
        },
    });

    if (projectMember) {
        const error = new Error(
            "Cannot delete user because this user is a project member."
        );
        error.statusCode = 409;
        throw error;
    }

    const assignedTask = await prisma.task.findFirst({
        where: {
            AssignedTo: userId,
        },
    });

    if (assignedTask) {
        const error = new Error(
            "Cannot delete user because this user is assigned to a task."
        );
        error.statusCode = 409;
        throw error;
    }

    const userComment = await prisma.comment.findFirst({
        where: {
            UserID: userId,
        },
    });

    if (userComment) {
        const error = new Error(
            "Cannot delete user because this user has comments in the system."
        );
        error.statusCode = 409;
        throw error;
    }

    const activity = await prisma.activityhistory.findFirst({
        where: {
            UserID: userId,
        },
    });

    if (activity) {
        const error = new Error(
            "Cannot delete user because this user has activity history."
        );
        error.statusCode = 409;
        throw error;
    }

    const userRole = await prisma.userrole.findFirst({
        where: {
            UserID: userId,
        },
    });

    if (userRole) {
        const error = new Error(
            "Cannot delete user because this user has a role assigned."
        );
        error.statusCode = 409;
        throw error;
    }

    return await prisma.user.delete({
        where: {
            UserID: userId,
        },
    });
};

const forceDeleteUser = async (id) => {
    const userId = Number(id);

    return await prisma.$transaction(async (tx) => {
        // Remove role assignments
        await tx.userrole.deleteMany({
            where: {
                UserID: userId,
            },
        });

        // Remove organization memberships
        await tx.organizationmembers.deleteMany({
            where: {
                UserID: userId,
            },
        });

        // Remove project memberships
        await tx.projectmembers.deleteMany({
            where: {
                UserID: userId,
            },
        });

        // Remove comments made by the user
        await tx.comment.deleteMany({
            where: {
                UserID: userId,
            },
        });

        // Remove activity history made by the user
        await tx.activityhistory.deleteMany({
            where: {
                UserID: userId,
            },
        });

        // Remove tasks assigned to the user
        await tx.task.deleteMany({
            where: {
                AssignedTo: userId,
            },
        });

        // Remove projects owned by the user
        const projects = await tx.project.findMany({
            where: {
                OwnerID: userId,
            },
            select: {
                ProjectID: true,
            },
        });

        for (const project of projects) {
            await tx.attachment.deleteMany({
                where: {
                    TaskID: {
                        in: await tx.task
                            .findMany({
                                where: {
                                    ProjectID: project.ProjectID,
                                },
                                select: {
                                    TaskID: true,
                                },
                            })
                            .then((tasks) => tasks.map((task) => task.TaskID)),
                    },
                },
            });

            await tx.comment.deleteMany({
                where: {
                    TaskID: {
                        in: await tx.task
                            .findMany({
                                where: {
                                    ProjectID: project.ProjectID,
                                },
                                select: {
                                    TaskID: true,
                                },
                            })
                            .then((tasks) => tasks.map((task) => task.TaskID)),
                    },
                },
            });

            await tx.activityhistory.deleteMany({
                where: {
                    TaskID: {
                        in: await tx.task
                            .findMany({
                                where: {
                                    ProjectID: project.ProjectID,
                                },
                                select: {
                                    TaskID: true,
                                },
                            })
                            .then((tasks) => tasks.map((task) => task.TaskID)),
                    },
                },
            });

            await tx.task.deleteMany({
                where: {
                    ProjectID: project.ProjectID,
                },
            });

            await tx.projectmembers.deleteMany({
                where: {
                    ProjectID: project.ProjectID,
                },
            });
        }

        await tx.project.deleteMany({
            where: {
                OwnerID: userId,
            },
        });

        // Remove organizations owned by the user
        const organizations = await tx.organization.findMany({
            where: {
                OwnerID: userId,
            },
            select: {
                OrganizationID: true,
            },
        });

        for (const organization of organizations) {
            await tx.project.deleteMany({
                where: {
                    OrganizationID: organization.OrganizationID,
                },
            });

            await tx.organizationmembers.deleteMany({
                where: {
                    OrganizationID: organization.OrganizationID,
                },
            });
        }

        await tx.organization.deleteMany({
            where: {
                OwnerID: userId,
            },
        });

        // Finally delete the user
        return await tx.user.delete({
            where: {
                UserID: userId,
            },
        });
    });
};

module.exports = {
    findAllUsers,
    findUserById,
    deleteUser,
    forceDeleteUser,
};