const express = require("express");

const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUserController,
    deleteUser,
    activateUserController,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const userViewMiddleware = require("../middlewares/userViewMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management APIs
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User view permission required
 */
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("VIEW_USER"),
    getAllUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User can only view their own profile unless they are an Admin
 *       404:
 *         description: User not found
 */
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("VIEW_USER"),
    userViewMiddleware,
    getUserById
);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user name or email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 example: Muhammad Saad
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: saad@gmail.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid user data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User can only update their own profile unless they are an Admin
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 */
router.patch(
    "/:id",
    authMiddleware,
    userViewMiddleware,
    updateUserController
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Administrator permission required
 *       404:
 *         description: User not found
 */
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activate user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User activated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Administrator permission required
 *       404:
 *         description: User not found
 */
router.patch(
    "/:id/activate",
    authMiddleware,
    adminMiddleware,
    activateUserController
);

module.exports = router;