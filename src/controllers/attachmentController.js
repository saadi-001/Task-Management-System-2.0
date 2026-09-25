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
            message:
                error.message ||
                "Failed to upload attachment",
        });
    }
};


// ==============================
// Get Ticket Attachments
// ==============================
const getTicketAttachments = async (req, res) => {
    try {
        const ticketId = Number(req.params.ticketId);

        console.log(
            "========== GET ATTACHMENTS =========="
        );
        console.log("Ticket ID:", ticketId);

        const attachments =
            await attachmentService.getAttachmentsByTicketId(
                ticketId
            );

        console.log(
            "Attachments found:",
            attachments.length
        );

        console.log(
            "Attachments data:",
            attachments
        );

        return res.status(200).json({
            success: true,
            data: attachments,
        });
    } catch (error) {
        console.error(
            "Get attachments error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch attachments",
        });
    }
};


// ==============================
// Get Content Type
// ==============================
const getContentType = (fileName) => {
    const extension =
        fileName
            .toLowerCase()
            .split(".")
            .pop();

    const contentTypes = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
        pdf: "application/pdf",
        txt: "text/plain",
        csv: "text/csv",
        json: "application/json",
        mp4: "video/mp4",
        webm: "video/webm",
        mp3: "audio/mpeg",
        wav: "audio/wav",
    };

    return (
        contentTypes[extension] ||
        "application/octet-stream"
    );
};


// ==============================
// Open / Stream Attachment
// ==============================
const getAttachmentFile = async (req, res) => {
    try {
        console.log(
            "========== OPEN ATTACHMENT =========="
        );

        const ticketId = Number(req.params.ticketId);

        const fileName = decodeURIComponent(
            req.params.fileName
        );

        console.log("Ticket ID:", ticketId);
        console.log("File Name:", fileName);

        const fileStream =
            await attachmentService.getAttachmentFile(
                ticketId,
                fileName
            );

        console.log(
            "MinIO stream received successfully"
        );

        const contentType =
            getContentType(fileName);

        res.setHeader(
            "Content-Type",
            contentType
        );

        res.setHeader(
            "Content-Disposition",
            "inline"
        );

        fileStream.on("error", (error) => {
            console.error(
                "MinIO file stream error:",
                error
            );

            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to read attachment",
                });
            }

            res.destroy(error);
        });

        fileStream.pipe(res);

        console.log(
            "File stream sent to browser"
        );
    } catch (error) {
        console.error(
            "Open attachment error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to open attachment",
        });
    }
};


// ==============================
// Delete Attachment
// ==============================
const deleteAttachment = async (req, res) => {
    try {
        console.log(
            "========== DELETE ATTACHMENT =========="
        );

        const ticketId = Number(req.params.ticketId);
        const attachmentId = Number(
            req.params.attachmentId
        );

        console.log("Ticket ID:", ticketId);
        console.log(
            "Attachment ID:",
            attachmentId
        );

        const attachment =
            await attachmentService.deleteAttachment(
                attachmentId,
                ticketId
            );

        console.log(
            "Attachment deleted successfully:",
            attachment
        );

        return res.status(200).json({
            success: true,
            message:
                "Attachment deleted successfully",
            data: attachment,
        });
    } catch (error) {
        console.error(
            "Delete attachment error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete attachment",
        });
    }
};


module.exports = {
    uploadAttachment,
    getTicketAttachments,
    getAttachmentFile,
    deleteAttachment,
};