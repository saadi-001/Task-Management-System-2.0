const express = require("express");

const router = express.Router();

const attachmentController = require("../controllers/attachmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const permissionMiddleware = require("../middlewares/permissionMiddleware");


// ==============================
// Swagger Tag
// ==============================

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: Ticket Image Attachment APIs
 */


// ==============================
// Upload Attachment
// ==============================

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


// ==============================
// Get Ticket Attachments
// ==============================

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


// ==============================
// Open Attachment
// ==============================

/**
 * @swagger
 * /api/tickets/{ticketId}/attachments/file/{fileName}:
 *   get:
 *     summary: Open ticket attachment
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
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         example: 1789634175877-456197873.jpeg
 *     responses:
 *       200:
 *         description: Attachment file
 *       404:
 *         description: Attachment not found
 */
router.get(
    "/:ticketId/attachments/file/:fileName",
    authMiddleware,
    permissionMiddleware("VIEW_ATTACHMENT"),
    attachmentController.getAttachmentFile
);


// ==============================
// Delete Attachment
// ==============================

/**
 * @swagger
 * /api/tickets/{ticketId}/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete ticket attachment
 *     tags: [Attachments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 8
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       400:
 *         description: Invalid attachment or ticket ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Attachment not found
 */
router.delete(
    "/:ticketId/attachments/:attachmentId",
    authMiddleware,
    permissionMiddleware("DELETE_ATTACHMENT"),
    attachmentController.deleteAttachment
);


module.exports = router;