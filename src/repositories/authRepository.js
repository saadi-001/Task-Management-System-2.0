const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createUser = async (userData) => {
    return await prisma.user.create({
        data: userData,
    });
};

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            Email: email,
        },
    });
};

const findUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: {
            UserID: userId,
        },
    });
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
};