const express = require("express");

const {
    getAllUsers,
    getUserById,
    deleteUser,
    forceDeleteUser,
} = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

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
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

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
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authMiddleware, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Force delete user by ID
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
 *         description: User force deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id/force", authMiddleware, adminMiddleware, forceDeleteUser);

module.exports = router;