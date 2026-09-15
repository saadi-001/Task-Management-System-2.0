const express = require("express");

const router = express.Router();

const permissionController = require("../controllers/permissionController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.use(authMiddleware, adminMiddleware);


/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission Management APIs
 */


/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a permission
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: CREATE_ORGANIZATION
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
router.post(
    "/",
    permissionController.createPermission
);


/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 */
router.get(
    "/",
    permissionController.getPermissions
);


/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission found
 *       404:
 *         description: Permission not found
 */
router.get(
    "/:id",
    permissionController.getPermissionById
);


/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: UPDATE_ORGANIZATION
 *     responses:
 *       200:
 *         description: Permission updated successfully
 */
router.put(
    "/:id",
    permissionController.updatePermission
);


/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 */
router.delete(
    "/:id",
    permissionController.deletePermission
);


module.exports = router;