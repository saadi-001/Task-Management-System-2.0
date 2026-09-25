const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/permissionMiddleware");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project Management APIs
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *               - OrganizationID
 *               - OwnerID
 *             properties:
 *               Name:
 *                 type: string
 *                 example: Test Project
 *               Description:
 *                 type: string
 *                 example: Testing project
 *               OrganizationID:
 *                 type: integer
 *                 example: 5
 *               OwnerID:
 *                 type: integer
 *                 example: 1
 */
router.post(
    "/",
    authMiddleware,
    authorize("CREATE_PROJECT"),
    projectController.createProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/",
    authMiddleware,
    authorize("VIEW_PROJECT"),
    projectController.getAllProjects
);

/**
 * @swagger
 * /api/projects/organization/{organizationId}:
 *   get:
 *     summary: Get projects by organization ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Organization projects fetched successfully
 *       400:
 *         description: Invalid organization ID
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/organization/:organizationId",
    authMiddleware,
    authorize("VIEW_PROJECT"),
    projectController.getProjectsByOrganizationId
);

/**
 * @swagger
 * /api/projects/{id}/link:
 *   put:
 *     summary: Link an existing project to an organization
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *               - OrganizationID
 *             properties:
 *               OrganizationID:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Project linked to organization successfully
 *       400:
 *         description: Invalid project or organization ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.put(
    "/:id/link",
    authMiddleware,
    authorize("UPDATE_PROJECT"),
    projectController.linkProjectToOrganization
);

/**
 * @swagger
 * /api/projects/{id}/unlink:
 *   put:
 *     summary: Unlink project from organization
 *     tags: [Projects]
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
 *         description: Project unlinked from organization successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.put(
    "/:id/unlink",
    authMiddleware,
    authorize("UPDATE_PROJECT"),
    projectController.unlinkProjectFromOrganization
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               Name:
 *                 type: string
 *                 example: Updated Project
 *               Description:
 *                 type: string
 *                 example: Updated project description
 *               OrganizationID:
 *                 type: integer
 *                 example: 5
 *               OwnerID:
 *                 type: integer
 *                 example: 8
 *
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 */
router.get(
    "/:id",
    authMiddleware,
    authorize("VIEW_PROJECT"),
    projectController.getProjectById
);

router.put(
    "/:id",
    authMiddleware,
    authorize("UPDATE_PROJECT"),
    projectController.updateProject
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("DELETE_PROJECT"),
    projectController.deleteProject
);

module.exports = router;