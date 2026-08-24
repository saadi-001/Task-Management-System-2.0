const attachmentService = require("../services/attachmentService");

// Upload Attachment
const uploadAttachment = async (req, res) => {
    try {
        const { fileName, fileType, fileData } = req.body;

        if (!fileName || !fileType || !fileData) {
            return res.status(400).json({
                success: false,
                message: "fileName, fileType and fileData are required",
            });
        }

        const ticketId = Number(req.params.ticketId);

        // Convert Base64 string into Buffer
        const fileBuffer = Buffer.from(fileData, "base64");

        const file = {
            originalname: fileName,
            mimetype: fileType,
            buffer: fileBuffer,
        };

        const attachment = await attachmentService.createAttachment(
            file,
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


// Get Ticket Attachments
const getTicketAttachments = async (req, res) => {
    try {
        const ticketId = Number(req.params.ticketId);

        const attachments =
            await attachmentService.getAttachmentsByTicketId(ticketId);

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