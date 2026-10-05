const express = require("express");

const router = express.Router();

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket / Task Management APIs
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 example: Workflow Testing Ticket
 *               Description:
 *                 type: string
 *                 example: Testing ticket workflow
 *               Status:
 *                 type: string
 *                 example: Ready to Do
 *               Priority:
 *                 type: string
 *                 example: High
 *               ProjectID:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Bad request
 */
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("CREATE_TICKET"),
    ticketController.createTicket
);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 */
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("VIEW_TICKET"),
    ticketController.getAllTickets
);

/**
 * @swagger
 * /api/tickets/project/{projectId}:
 *   get:
 *     summary: Get tickets by project ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Project tickets retrieved successfully
 *       400:
 *         description: Invalid project ID
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/project/:projectId",
    authMiddleware,
    permissionMiddleware("VIEW_TICKET"),
    ticketController.getTicketsByProjectId
);

/**
 * @swagger
 * /api/tickets/user/{userId}:
 *   get:
 *     summary: Get tickets assigned to a specific user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Assigned tickets retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User view permission required
 *       404:
 *         description: User not found
 */
router.get(
    "/user/:userId",
    authMiddleware,
    permissionMiddleware("VIEW_USER"),
    ticketController.getTicketsByAssignedUser
);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("VIEW_TICKET"),
    ticketController.getTicketById
);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
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
 *               Title:
 *                 type: string
 *                 example: Updated Ticket
 *               Description:
 *                 type: string
 *                 example: Updated description
 *               Status:
 *                 type: string
 *                 enum:
 *                   - Ready to Do
 *                   - In Progress
 *                   - Blocked
 *                   - Testing
 *                   - Done
 *                 example: Testing
 *               Priority:
 *                 type: string
 *                 example: High
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Invalid status transition or bad request
 *       404:
 *         description: Ticket not found
 */
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("UPDATE_TICKET"),
    ticketController.updateTicket
);

/**
 * @swagger
 * /api/tickets/{id}/assign:
 *   patch:
 *     summary: Assign ticket to a user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       404:
 *         description: Ticket or user not found
 */
router.patch(
    "/:id/assign",
    authMiddleware,
    permissionMiddleware("ASSIGN_TICKET"),
    ticketController.assignTicket
);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       404:
 *         description: Ticket not found
 */
router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("DELETE_TICKET"),
    ticketController.deleteTicket
);

module.exports = router;