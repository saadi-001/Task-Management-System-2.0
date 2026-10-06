const prisma = require("../config/prisma");
const { resetAutoIncrementIfEmpty } = require("../utils/resetAutoIncrement");

// ==============================
// Create Attachment
// ==============================
const createAttachment = async (attachmentData) => {
    return await prisma.attachment.create({
        data: attachmentData,
    });
};


// ==============================
// Get Attachments by Ticket
// ==============================
const findAttachmentsByTicketId = async (ticketId) => {
    return await prisma.attachment.findMany({
        where: {
            TaskID: ticketId,
        },
    });
};


// ==============================
// Get Attachment by ID
// ==============================
const findAttachmentById = async (attachmentId) => {
    return await prisma.attachment.findUnique({
        where: {
            AttachmentID: attachmentId,
        },
    });
};


// ==============================
// Delete Attachment
// ==============================
const deleteAttachment = async (attachmentId) => {
    return (async () => {
    const result = await prisma.attachment.delete({
        where: {
            AttachmentID: attachmentId,
        },
    });
    await resetAutoIncrementIfEmpty('attachment', 'attachment');
    return result;
  })()
};


module.exports = {
    createAttachment,
    findAttachmentsByTicketId,
    findAttachmentById,
    deleteAttachment,
};