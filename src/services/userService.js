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

const removeUser = async (id) => {
    const user = await userRepository.findUserById(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return await userRepository.deleteUser(id);
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
    removeUser,
    forceRemoveUser,
};