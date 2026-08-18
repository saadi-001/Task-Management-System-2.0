const attachmentRepository = require("../repositories/attachmentRepository");
const { uploadFile } = require("./minioService");

// ==============================
// Create Attachment
// ==============================
const createAttachment = async (file, ticketId) => {

    if (!file) {
        const error = new Error("No file uploaded");
        error.statusCode = 400;
        throw error;
    }

    // Generate unique file name
    const fileName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1E9) +
        file.originalname.substring(
            file.originalname.lastIndexOf(".")
        );

    // Upload actual file to MinIO
    const fileUrl = await uploadFile(
        file.buffer,
        fileName,
        file.mimetype
    );

    // Save attachment information in MySQL
    return await attachmentRepository.createAttachment({
        FileName: fileName,
        FileUrl: fileUrl,
        TaskID: ticketId,
    });
};


// ==============================
// Get Attachments by Ticket
// ==============================
const getAttachmentsByTicketId = async (ticketId) => {

    return await attachmentRepository.findAttachmentsByTicketId(
        ticketId
    );

};


module.exports = {
    createAttachment,
    getAttachmentsByTicketId,
};