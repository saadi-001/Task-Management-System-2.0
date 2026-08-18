const express = require("express");

const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middlewares/authMiddleware");


// Create Project
router.post(
    "/",
    authMiddleware,
    projectController.createProject
);


// Get All Projects
router.get(
    "/",
    authMiddleware,
    projectController.getAllProjects
);


// Get Project By ID
router.get(
    "/:id",
    authMiddleware,
    projectController.getProjectById
);


// Update Project
router.put(
    "/:id",
    authMiddleware,
    projectController.updateProject
);


// Delete Project
router.delete(
    "/:id",
    authMiddleware,
    projectController.deleteProject
);


module.exports = router;