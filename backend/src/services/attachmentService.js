const attachmentRepository = require("../repositories/attachmentRepository");
const {
    uploadFile,
    getFile,
    deleteFile,
} = require("./minioService");

// ==============================
// Create Attachment
// ==============================
const createAttachment = async (file, ticketId) => {
    if (!file) {
        const error = new Error("No file uploaded");
        error.statusCode = 400;
        throw error;
    }

    const parsedTicketId = Number(ticketId);

    if (
        !Number.isInteger(parsedTicketId) ||
        parsedTicketId < 1
    ) {
        const error = new Error(
            "Ticket id must be a positive integer"
        );
        error.statusCode = 400;
        throw error;
    }

    const fileName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        file.originalname.substring(
            file.originalname.lastIndexOf(".")
        );

    // Upload actual file to MinIO
    await uploadFile(
        file.buffer,
        fileName,
        file.mimetype
    );

    // Save attachment information in MySQL
    return await attachmentRepository.createAttachment({
        FileName: fileName,
        FileUrl: fileName,
        TaskID: parsedTicketId,
    });
};


// ==============================
// Get Attachments by Ticket
// ==============================
const getAttachmentsByTicketId = async (ticketId) => {
    const parsedTicketId = Number(ticketId);

    if (
        !Number.isInteger(parsedTicketId) ||
        parsedTicketId < 1
    ) {
        const error = new Error(
            "Ticket id must be a positive integer"
        );
        error.statusCode = 400;
        throw error;
    }

    const attachments =
        await attachmentRepository.findAttachmentsByTicketId(
            parsedTicketId
        );

    // Return a backend URL instead of a MinIO URL.
    return attachments.map((attachment) => ({
        ...attachment,
        FileUrl:
            `/api/tickets/${parsedTicketId}/attachments/file/${encodeURIComponent(
                attachment.FileName
            )}`,
    }));
};


// ==============================
// Get Attachment File
// ==============================
const getAttachmentFile = async (ticketId, fileName) => {
    const parsedTicketId = Number(ticketId);

    if (
        !Number.isInteger(parsedTicketId) ||
        parsedTicketId < 1
    ) {
        const error = new Error(
            "Ticket id must be a positive integer"
        );
        error.statusCode = 400;
        throw error;
    }

    if (!fileName) {
        const error = new Error("File name is required");
        error.statusCode = 400;
        throw error;
    }

    // Find attachments belonging to this ticket.
    // This prevents accessing an attachment from another ticket.
    const attachments =
        await attachmentRepository.findAttachmentsByTicketId(
            parsedTicketId
        );

    const attachment = attachments.find(
        (item) => item.FileName === fileName
    );

    if (!attachment) {
        const error = new Error(
            "Attachment not found for this ticket"
        );
        error.statusCode = 404;
        throw error;
    }

    // Get actual file stream from private MinIO bucket.
    return await getFile(attachment.FileName);
};


// ==============================
// Delete Attachment
// ==============================
const deleteAttachment = async (
    attachmentId,
    ticketId
) => {
    const parsedAttachmentId = Number(attachmentId);
    const parsedTicketId = Number(ticketId);

    if (
        !Number.isInteger(parsedAttachmentId) ||
        parsedAttachmentId < 1
    ) {
        const error = new Error(
            "Attachment id must be a positive integer"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        !Number.isInteger(parsedTicketId) ||
        parsedTicketId < 1
    ) {
        const error = new Error(
            "Ticket id must be a positive integer"
        );
        error.statusCode = 400;
        throw error;
    }

    // Find attachment
    const attachment =
        await attachmentRepository.findAttachmentById(
            parsedAttachmentId
        );

    if (!attachment) {
        const error = new Error(
            "Attachment not found"
        );
        error.statusCode = 404;
        throw error;
    }

    // Make sure attachment belongs to this ticket.
    if (Number(attachment.TaskID) !== parsedTicketId) {
        const error = new Error(
            "Attachment does not belong to this ticket"
        );
        error.statusCode = 400;
        throw error;
    }

    // Delete actual file from MinIO first.
    await deleteFile(attachment.FileName);

    // Delete attachment record from MySQL.
    const deletedAttachment =
        await attachmentRepository.deleteAttachment(
            parsedAttachmentId
        );

    return deletedAttachment;
};


module.exports = {
    createAttachment,
    getAttachmentsByTicketId,
    getAttachmentFile,
    deleteAttachment,
};