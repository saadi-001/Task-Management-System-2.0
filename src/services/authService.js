const bcrypt = require("bcrypt");
const crypto = require("crypto");

const authRepository = require("../repositories/authRepository");
const roleRepository = require("../repositories/roleRepository");
const { generateToken } = require("../utils/jwt");

const buildSession = async (user) => {
    const [userRoles, userPermissions] = await Promise.all([
        roleRepository.getUserRoles(user.UserID),
        roleRepository.getUserPermissions(user.UserID),
    ]);

    const roles = await Promise.all(
        userRoles.map((userRole) => roleRepository.getRoleById(userRole.RoleID))
    );

    return {
        user: {
            UserID: user.UserID,
            Name: user.Name,
            Email: user.Email,
            DateOfBirth: user.DateOfBirth,
        },
        roles: roles.filter(Boolean).map((role) => role.Name),
        permissions: userPermissions.map((permission) => permission.Name),
    };
};

const validateSignupData = ({ name, email, password, dateOfBirth, acceptedTerms }) => {
    if (!name || name.trim().length < 2) {
        const error = new Error("Name must contain at least 2 characters");
        error.statusCode = 400;
        throw error;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
        const error = new Error("Enter a valid email address");
        error.statusCode = 400;
        throw error;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password || "")) {
        const error = new Error("Password must be 8+ characters with uppercase, lowercase, and a number");
        error.statusCode = 400;
        throw error;
    }

    const birthDate = new Date(dateOfBirth);
    const minimumAgeDate = new Date();
    minimumAgeDate.setFullYear(minimumAgeDate.getFullYear() - 13);

    if (!dateOfBirth || Number.isNaN(birthDate.getTime()) || birthDate > minimumAgeDate) {
        const error = new Error("You must provide a valid date of birth and be at least 13 years old");
        error.statusCode = 400;
        throw error;
    }

    if (!acceptedTerms) {
        const error = new Error("You must accept the platform rules before creating an account");
        error.statusCode = 400;
        throw error;
    }
};


// ==========================
// Signup
// ==========================
const signup = async (userData) => {
    validateSignupData(userData);

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
    const createdUser = await authRepository.createUser({
        Name: userData.name,
        Email: userData.email,
        Password: hashedPassword,
        DateOfBirth: new Date(`${userData.dateOfBirth}T00:00:00.000Z`),
    });

    return {
        UserID: createdUser.UserID,
        Name: createdUser.Name,
        Email: createdUser.Email,
        DateOfBirth: createdUser.DateOfBirth,
    };
};


// ==========================
// Login
// ==========================
const login = async (email, password) => {

    // Find user by email
    const user = await authRepository.findUserByEmail(
        String(email || "").trim()
    );

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
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

    return { token, ...(await buildSession(user)) };

};

const getSession = async (userId) => {
    const user = await authRepository.findUserById(Number(userId));

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return buildSession(user);
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
    getSession,
    forgotPassword,
    resetPassword,
};