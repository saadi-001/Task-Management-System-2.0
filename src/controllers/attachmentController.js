const attachmentService = require("../services/attachmentService");

// ==============================
// Upload Attachment
// ==============================
const uploadAttachment = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file uploaded",
            });
        }

        const ticketId = Number(req.params.ticketId);

        const attachment =
            await attachmentService.createAttachment(
                req.file,
                ticketId
            );

        return res.status(201).json({
            success: true,
            message: "Attachment uploaded successfully",
            data: attachment,
        });

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to upload attachment",
        });
    }
};


// ==============================
// Get Ticket Attachments
// ==============================
const getTicketAttachments = async (req, res) => {
    try {

        const ticketId = Number(req.params.ticketId);

        const attachments =
            await attachmentService.getAttachmentsByTicketId(
                ticketId
            );

        return res.status(200).json({
            success: true,
            data: attachments,
        });

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch attachments",
        });
    }
};


module.exports = {
    uploadAttachment,
    getTicketAttachments,
};