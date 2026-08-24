const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error("Get Users Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch users",
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch user",
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.removeUser(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete user",
        });
    }
};

const forceDeleteUser = async (req, res) => {
    try {
        await userService.forceRemoveUser(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Test user and related test data deleted successfully",
        });
    } catch (error) {
        console.error("Force Delete User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to force delete user",
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    forceDeleteUser,
};