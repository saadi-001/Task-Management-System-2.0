const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


// ==========================
// Create User
// ==========================
const createUser = async (userData) => {

    return await prisma.user.create({
        data: userData,
    });

};


// ==========================
// Find User By Email
// ==========================
const findUserByEmail = async (email) => {

    return await prisma.user.findUnique({
        where: {
            Email: email,
        },
    });

};


// ==========================
// Find User By ID
// ==========================
const findUserById = async (userId) => {

    return await prisma.user.findUnique({
        where: {
            UserID: userId,
        },
    });

};


// ==========================
// Save Password Reset Token
// ==========================
const saveResetToken = async (
    userId,
    resetToken,
    resetTokenExpiry
) => {

    return await prisma.user.update({

        where: {
            UserID: userId,
        },

        data: {
            ResetToken: resetToken,
            ResetTokenExpiry: resetTokenExpiry,
        },

    });

};


// ==========================
// Find User By Reset Token
// ==========================
const findUserByResetToken = async (resetToken) => {

    return await prisma.user.findFirst({

        where: {
            ResetToken: resetToken,
        },

    });

};


// ==========================
// Update Password & Clear Token
// ==========================
const updatePassword = async (
    userId,
    hashedPassword
) => {

    return await prisma.user.update({

        where: {
            UserID: userId,
        },

        data: {
            Password: hashedPassword,
            ResetToken: null,
            ResetTokenExpiry: null,
        },

    });

};


module.exports = {

    createUser,
    findUserByEmail,
    findUserById,
    saveResetToken,
    findUserByResetToken,
    updatePassword,

};