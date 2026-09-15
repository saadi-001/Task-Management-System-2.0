const authService = require("../services/authService");

const getSession = async (req, res) => {
    try {
        const session = await authService.getSession(req.user.UserID);

        return res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to load session",
        });
    }
};

// ==========================
// Signup
// ==========================
const signup = async (req, res) => {

    try {

        const { name, email, password, dateOfBirth, acceptedTerms } = req.body;

        const user = await authService.signup({
            name,
            email,
            password,
            dateOfBirth,
            acceptedTerms,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });

    } catch (error) {

    console.error(error);

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
    });

}

};

// ==========================
// Login
// ==========================
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await authService.login(
            email,
            password
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user,
            roles: result.roles,
            permissions: result.permissions,
        });

    } catch (error) {

        console.error(error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });

    }

};

// ==========================
// Forgot Password
// ==========================
const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const result = await authService.forgotPassword(email);

        res.status(200).json({
            success: true,
            message: "Password reset token generated",
            data: result,
        });

    } catch (error) {

        console.error(error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });

    }

};


// ==========================
// Reset Password
// ==========================
const resetPassword = async (req, res) => {

    try {

        const { resetToken, newPassword } = req.body;

        const result = await authService.resetPassword(
            resetToken,
            newPassword
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        console.error(error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });

    }

};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    getSession,
};