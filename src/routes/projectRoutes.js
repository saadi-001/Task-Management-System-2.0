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
 */
router.delete(
    "/:id",
    authMiddleware,
    authorize("DELETE_PROJECT"),
    projectController.deleteProject
);


module.exports = router;