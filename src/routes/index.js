const express = require("express");

const organizationRoutes = require("./organizationRoutes");
const authRoutes = require("./authRoutes");
const roleRoutes = require("./roleRoutes");
const permissionRoutes = require("./permissionRoutes");
const projectRoutes = require("./projectRoutes");
const ticketRoutes = require("./ticketRoutes");
const attachmentRoutes = require("./attachmentRoutes");


const router = express.Router();


// ==============================
// API Health Check
// ==============================
router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Task Management System v2 API is Running 🚀"
    });
});


// ==============================
// Organization Routes
// ==============================
router.use(
    "/organizations",
    organizationRoutes
);


// ==============================
// Authentication Routes
// ==============================
router.use(
    "/auth",
    authRoutes
);


// ==============================
// Role Routes
// ==============================
router.use(
    "/roles",
    roleRoutes
);


// ==============================
// Permission Routes
// ==============================
router.use(
    "/permissions",
    permissionRoutes
);

// ==============================
// Project Routes
// ==============================
router.use(
    "/projects",
    projectRoutes
);


// ==============================
// Ticket Routes
// ==============================
router.use(
    "/tickets",
    ticketRoutes
);


// ==============================
// Attachment Routes
// ==============================     
router.use(
    "/tickets",
    attachmentRoutes
);

module.exports = router;