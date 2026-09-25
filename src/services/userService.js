const userRepository = require("../repositories/userRepository");

const getAllUsers = async () => {
    return await userRepository.findAllUsers();
};

const getUserById = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

const updateUser = async (id, userData) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const { Name, Email } = userData;

    if (Name === undefined && Email === undefined) {
        const error = new Error("Name or Email is required");
        error.statusCode = 400;
        throw error;
    }

    const updateData = {};

    if (Name !== undefined) {
        if (typeof Name !== "string" || !Name.trim()) {
            const error = new Error("Name cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        updateData.Name = Name.trim();
    }

    if (Email !== undefined) {
        if (typeof Email !== "string" || !Email.trim()) {
            const error = new Error("Email cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        const normalizedEmail = Email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            const error = new Error("Invalid email format");
            error.statusCode = 400;
            throw error;
        }

        const existingUser =
            await userRepository.findUserByEmail(normalizedEmail);

        if (
            existingUser &&
            Number(existingUser.UserID) !== Number(id)
        ) {
            const error = new Error("Email already exists");
            error.statusCode = 409;
            throw error;
        }

        updateData.Email = normalizedEmail;
    }

    return await userRepository.updateUser(id, updateData);
};

const removeUser = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.deleteUser(id);
};

const activateUser = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.activateUser(id);
};

const forceRemoveUser = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.forceDeleteUser(id);
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    removeUser,
    activateUser,
    forceRemoveUser,
};