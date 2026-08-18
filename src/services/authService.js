const bcrypt = require("bcrypt");

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

    // Replace plain password
    userData.password = hashedPassword;

    // Save User
    return await authRepository.createUser({
        Name: userData.name,
        Email: userData.email,
        Password: userData.password,
        DateOfBirth: new Date(userData.dateOfBirth)
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

    // Return User + Token
    return {
        token,
        user,
    };

};

module.exports = {
    signup,
    login,
};