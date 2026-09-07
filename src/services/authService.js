const bcrypt = require("bcrypt");
const crypto = require("crypto");

const authRepository = require("../repositories/authRepository");
const { generateToken } = require("../utils/jwt");


// ==========================
// Signup
// ==========================
const signup = async (userData) => {

    // Check if email already exists
    const existingUser = await authRepository.findUserByEmail(
        userData.email
    );

    if (existingUser) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(
        userData.password,
        10
    );

    // Save User
    return await authRepository.createUser({
        Name: userData.name,
        Email: userData.email,
        Password: hashedPassword,
    });
};


// ==========================
// Login
// ==========================
const login = async (email, password) => {

    // Find user by email
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Compare Password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.Password
    );

    if (!isPasswordCorrect) {
        const error = new Error("Invalid Password");
        error.statusCode = 401;
        throw error;
    }

    // Generate JWT Token
    const token = generateToken(user);

    return {
        token,
        user,
    };

};


// ==========================
// Forgot Password
// ==========================
const forgotPassword = async (email) => {

    // Find user by email
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires after 15 minutes
    const resetTokenExpiry = new Date(
        Date.now() + 15 * 60 * 1000
    );

    // Save token in database
    await authRepository.saveResetToken(
        user.UserID,
        resetToken,
        resetTokenExpiry
    );

    return {
        resetToken,
    };

};


// ==========================
// Reset Password
// ==========================
const resetPassword = async (resetToken, newPassword) => {

    console.log("RESET TOKEN RECEIVED:", resetToken);

    const user = await authRepository.findUserByResetToken(
        resetToken
    );

    console.log("USER FOUND:", user);

    if (!user) {
        const error = new Error("Invalid reset token");
        error.statusCode = 400;
        throw error;
    }

    console.log("TOKEN EXPIRY:", user.ResetTokenExpiry);
    console.log("CURRENT TIME:", new Date());

    if (
        !user.ResetTokenExpiry ||
        user.ResetTokenExpiry < new Date()
    ) {
        const error = new Error("Reset token has expired");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    await authRepository.updatePassword(
        user.UserID,
        hashedPassword
    );

    return {
        message: "Password reset successfully",
    };
};


module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
};