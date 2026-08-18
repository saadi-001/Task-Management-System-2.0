const express = require("express");

const router = express.Router();

const attachmentController = require("../controllers/attachmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");


// Upload Image to Ticket
router.post(
    "/:ticketId/attachments",
    authMiddleware,
    upload.single("image"),
    attachmentController.uploadAttachment
);


// Get Ticket Attachments
router.get(
    "/:ticketId/attachments",
    authMiddleware,
    attachmentController.getTicketAttachments
);


module.exports = router;