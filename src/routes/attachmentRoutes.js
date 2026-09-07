const express = require("express");

const router = express.Router();

const attachmentController = require("../controllers/attachmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");


/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: Ticket Image Attachment APIs
 */


/**
 * @swagger
 * /api/tickets/{ticketId}/attachments:
 *   post:
 *     summary: Upload image to a ticket
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 */
router.post(
    "/:ticketId/attachments",
    authMiddleware,
    permissionMiddleware("UPLOAD_ATTACHMENT"),
    upload.single("image"),
    attachmentController.uploadAttachment
);


/**
 * @swagger
 * /api/tickets/{ticketId}/attachments:
 *   get:
 *     summary: Get ticket attachments
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Ticket attachments retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get(
    "/:ticketId/attachments",
    authMiddleware,
    permissionMiddleware("VIEW_ATTACHMENT"),
    attachmentController.getTicketAttachments
);


module.exports = router;