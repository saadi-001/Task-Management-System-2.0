const express = require("express");

const router = express.Router();

const roleController = require("../controllers/roleController");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role Management APIs
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Roles]
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
 *                 example: Admin
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post("/", roleController.createRole);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 */
router.get("/", roleController.getRoles);

/**
 * @swagger
 * /api/roles/assign-permission:
 *   post:
 *     summary: Assign permission to role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionName
 *             properties:
 *               roleId:
 *                 type: integer
 *                 example: 1
 *               permissionName:
 *                 type: string
 *                 example: CREATE_USER
 *     responses:
 *       201:
 *         description: Permission assigned successfully
 */
router.post(
    "/assign-permission",
    roleController.assignPermissionToRole
);


/**
 * @swagger
 * /api/roles/remove-permission:
 *   delete:
 *     summary: Remove permission from role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionName
 *             properties:
 *               roleId:
 *                 type: integer
 *                 example: 1
 *               permissionName:
 *                 type: string
 *                 example: CREATE_USER
 *     responses:
 *       200:
 *         description: Permission removed successfully
 */
router.delete(
    "/remove-permission",
    roleController.removePermissionFromRole
);

/**
 * @swagger
 * /api/roles/assign-user:
 *   post:
 *     summary: Assign role to user
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Role assigned to user successfully
 */
router.post(
    "/assign-user",
    roleController.assignRoleToUser
);

/**
 * @swagger
 * /api/roles/remove-user:
 *   delete:
 *     summary: Remove role from user
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Role removed from user successfully
 */
router.delete(
    "/remove-user",
    roleController.removeRoleFromUser
);


/**
 * @swagger
 * /api/roles/{roleId}/permissions:
 *   get:
 *     summary: Get all permissions assigned to a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 */
router.get(
    "/:roleId/permissions",
    roleController.getRolePermissions
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Role fetched successfully
 *       404:
 *         description: Role not found
 */
router.get(
    "/:id",
    roleController.getRoleById
);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
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
 *                 example: Manager
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 */
router.put(
    "/:id",
    roleController.updateRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 */
router.delete(
    "/:id",
    roleController.deleteRole
);

module.exports = router;