const bcrypt = require("bcrypt");
const crypto = require("crypto");

const authRepository = require("../repositories/authRepository");
const roleRepository = require("../repositories/roleRepository");
const { generateToken } = require("../utils/jwt");

// ==========================
// Build Session
// ==========================
const buildSession = async (user) => {
    const [userRoles, userPermissions] = await Promise.all([
        roleRepository.getUserRoles(user.UserID),
        roleRepository.getUserPermissions(user.UserID),
    ]);

    const roles = await Promise.all(
        userRoles.map((userRole) =>
            roleRepository.getRoleById(userRole.RoleID)
        )
    );

    return {
        user: {
            UserID: user.UserID,
            Name: user.Name,
            Email: user.Email,
            DateOfBirth: user.DateOfBirth,
        },

        roles: roles
            .filter(Boolean)
            .map((role) => role.Name),

        permissions: userPermissions.map(
            (permission) => permission.Name
        ),
    };
};

// ==========================
// Validate Signup Data
// ==========================
const validateSignupData = ({
    name,
    email,
    password,
    dateOfBirth,
    acceptedTerms,
}) => {
    console.log("========== SIGNUP VALIDATION ==========");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("DateOfBirth:", dateOfBirth);
    console.log("DateOfBirth type:", typeof dateOfBirth);
    console.log("AcceptedTerms:", acceptedTerms);

    // ==========================
    // Name Validation
    // ==========================
    if (!name || name.trim().length < 2) {
        const error = new Error(
            "Name must contain at least 2 characters"
        );

        error.statusCode = 400;
        throw error;
    }

    // ==========================
    // Email Validation
    // ==========================
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
        const error = new Error(
            "Enter a valid email address"
        );

        error.statusCode = 400;
        throw error;
    }

    // ==========================
    // Password Validation
    // ==========================
    if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(
            password || ""
        )
    ) {
        const error = new Error(
            "Password must be 8+ characters with uppercase, lowercase, and a number"
        );

        error.statusCode = 400;
        throw error;
    }

    // ==========================
    // Date of Birth - OPTIONAL
    // ==========================
    if (dateOfBirth) {
        console.log("DOB PROVIDED → validating DOB");

        const birthDate = new Date(dateOfBirth);

        console.log("Parsed birth date:", birthDate);

        // Invalid date
        if (Number.isNaN(birthDate.getTime())) {
            const error = new Error(
                "Please provide a valid date of birth"
            );

            error.statusCode = 400;
            throw error;
        }

        // Minimum age = 13
        const minimumAgeDate = new Date();

        minimumAgeDate.setFullYear(
            minimumAgeDate.getFullYear() - 13
        );

        console.log(
            "Minimum allowed birth date:",
            minimumAgeDate
        );

        // User is younger than 13
        if (birthDate > minimumAgeDate) {
            const error = new Error(
                "You must be at least 13 years old"
            );

            error.statusCode = 400;
            throw error;
        }

        console.log("DOB VALIDATION PASSED");
    } else {
        console.log(
            "DOB EMPTY → DOB validation skipped"
        );
    }

    // ==========================
    // Terms Validation
    // ==========================
    if (!acceptedTerms) {
        const error = new Error(
            "You must accept the platform rules before creating an account"
        );

        error.statusCode = 400;
        throw error;
    }

    console.log(
        "========== SIGNUP VALIDATION PASSED =========="
    );
};

// ==========================
// Signup
// ==========================
const signup = async (userData) => {
    console.log("========== SIGNUP START ==========");

    console.log("Signup data received:", {
        name: userData.name,
        email: userData.email,
        dateOfBirth: userData.dateOfBirth,
        acceptedTerms: userData.acceptedTerms,
    });

    // Validate data
    validateSignupData(userData);

    // ==========================
    // Check Existing User
    // ==========================
    const existingUser =
        await authRepository.findUserByEmail(
            String(userData.email || "").trim()
        );

    if (existingUser) {
        const error = new Error(
            "Email already exists"
        );

        error.statusCode = 409;
        throw error;
    }

    // ==========================
    // Hash Password
    // ==========================
    const hashedPassword = await bcrypt.hash(
        userData.password,
        10
    );

    // ==========================
    // Create User
    // ==========================
    const createdUser =
        await authRepository.createUser({
            Name: userData.name.trim(),

            Email: String(userData.email)
                .trim()
                .toLowerCase(),

            Password: hashedPassword,

            // DOB is optional
            DateOfBirth: userData.dateOfBirth
                ? new Date(
                      `${userData.dateOfBirth}T00:00:00.000Z`
                  )
                : null,
        });

    console.log(
        "USER CREATED SUCCESSFULLY:",
        createdUser.UserID
    );

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
    const user =
        await authRepository.findUserByEmail(
            String(email || "").trim()
        );

    if (!user) {
        const error = new Error(
            "Invalid email or password"
        );

        error.statusCode = 401;
        throw error;
    }

    // Compare password
    const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.Password
        );

    if (!isPasswordCorrect) {
        const error = new Error(
            "Invalid Password"
        );

        error.statusCode = 401;
        throw error;
    }

    // Generate JWT token
    const token = generateToken(user);

    return {
        token,
        ...(await buildSession(user)),
    };
};

// ==========================
// Get Session
// ==========================
const getSession = async (userId) => {
    const user =
        await authRepository.findUserById(
            Number(userId)
        );

    if (!user) {
        const error = new Error(
            "User not found"
        );

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
    const user =
        await authRepository.findUserByEmail(
            String(email || "").trim()
        );

    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;
        throw error;
    }

    // Generate random reset token
    const resetToken =
        crypto.randomBytes(32).toString("hex");

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
const resetPassword = async (
    resetToken,
    newPassword
) => {
    console.log(
        "RESET TOKEN RECEIVED:",
        resetToken
    );

    const user =
        await authRepository.findUserByResetToken(
            resetToken
        );

    console.log(
        "USER FOUND:",
        user
    );

    if (!user) {
        const error = new Error(
            "Invalid reset token"
        );

        error.statusCode = 400;
        throw error;
    }

    console.log(
        "TOKEN EXPIRY:",
        user.ResetTokenExpiry
    );

    console.log(
        "CURRENT TIME:",
        new Date()
    );

    if (
        !user.ResetTokenExpiry ||
        user.ResetTokenExpiry < new Date()
    ) {
        const error = new Error(
            "Reset token has expired"
        );

        error.statusCode = 400;
        throw error;
    }

    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );

    await authRepository.updatePassword(
        user.UserID,
        hashedPassword
    );

    return {
        message:
            "Password reset successfully",
    };
};

// ==========================
// Exports
// ==========================
module.exports = {
    signup,
    login,
    getSession,
    forgotPassword,
    resetPassword,
};