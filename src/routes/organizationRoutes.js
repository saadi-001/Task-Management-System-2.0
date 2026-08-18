const express = require("express");

const router = express.Router();

const organizationController = require("../controllers/organizationController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: Organization Management APIs
 */


/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - contactNo
 *             properties:
 *               name:
 *                 type: string
 *                 example: Task Management
 *               email:
 *                 type: string
 *                 example: task@gmail.com
 *               contactNo:
 *                 type: string
 *                 example: "03001234567"
 *               logo:
 *                 type: string
 *                 example: logo.png
 *               theme:
 *                 type: string
 *                 example: dark
 *               ownerID:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Organization created successfully
 */
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("CREATE_ORGANIZATION"),
    organizationController.createOrganization
);


/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organization]
 *     responses:
 *       200:
 *         description: List of organizations
 */
router.get(
    "/",
    authMiddleware,
    organizationController.getOrganizations
);


/**
 * @swagger
 * /api/organizations/assign-user:
 *   post:
 *     summary: Assign a user to an organization
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - userId
 *               - role
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 example: 5
 *               userId:
 *                 type: integer
 *                 example: 1
 *               role:
 *                 type: string
 *                 example: Member
 *     responses:
 *       201:
 *         description: User assigned successfully
 */
router.post(
    "/assign-user",
    authMiddleware,
    permissionMiddleware("ASSIGN_USER"),
    organizationController.assignUserToOrganization
);


/**
 * @swagger
 * /api/organizations/remove-user:
 *   delete:
 *     summary: Remove a user from an organization
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - userId
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 example: 5
 *               userId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: User removed from organization successfully
 *       404:
 *         description: User is not a member of this organization
 */
router.delete(
    "/remove-user",
    authMiddleware,
    permissionMiddleware("REMOVE_USER"),
    organizationController.removeUserFromOrganization
);


/**
 * @swagger
 * /api/organizations/transfer-owner:
 *   put:
 *     summary: Transfer organization ownership to another user
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationId
 *               - newOwnerId
 *             properties:
 *               organizationId:
 *                 type: integer
 *                 example: 5
 *               newOwnerId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Organization owner transferred successfully
 *       404:
 *         description: Organization or user not found
 */
router.put(
    "/transfer-owner",
    authMiddleware,
    permissionMiddleware("TRANSFER_OWNER"),
    organizationController.transferOrganizationOwner
);


/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Organization found
 *       404:
 *         description: Organization not found
 */
router.get(
    "/:id",
    authMiddleware,
    organizationController.getOrganizationById
);


/**
 * @swagger
 * /api/organizations/{id}:
 *   put:
 *     summary: Update organization
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               contactNo:
 *                 type: string
 *               logo:
 *                 type: string
 *               theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated successfully
 */
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("UPDATE_ORGANIZATION"),
    organizationController.updateOrganization
);


/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     summary: Delete organization
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 */
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("DELETE_ORGANIZATION"),
    organizationController.deleteOrganization
);


module.exports = router;