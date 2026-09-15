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
 */
router.get(
    "/:id",
    authMiddleware,
    authorize("VIEW_PROJECT"),
    projectController.getProjectById
);


/**
 * @swagger
 * /api/projects/{id}:
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
 */
router.put(
    "/:id",
    authMiddleware,
    authorize("UPDATE_PROJECT"),
    projectController.updateProject
);


/**
 * @swagger
 * /api/projects/{id}:
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
router.delete(
    "/:id",
    authMiddleware,
    authorize("DELETE_PROJECT"),
    projectController.deleteProject
);


module.exports = router;