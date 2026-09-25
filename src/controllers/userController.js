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

const updateUserController = async (req, res) => {
    try {
        const user = await userService.updateUser(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: user,
        });
    } catch (error) {
        console.error("Update User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update user",
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.removeUser(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User deactivated successfully",
        });
    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete user",
        });
    }
};

const activateUserController = async (req, res, next) => {
    try {
        const user = await userService.activateUser(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User activated successfully.",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserController,
    deleteUser,
    activateUserController,
};