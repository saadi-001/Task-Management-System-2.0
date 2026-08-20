const express = require("express");

const router = express.Router();

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middlewares/authMiddleware");


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
    ticketController.getAllTickets
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
    ticketController.deleteTicket
);


module.exports = router;