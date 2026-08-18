const prisma = require("../config/prisma");

// Create Attachment
const createAttachment = async (attachmentData) => {
    return await prisma.attachment.create({
        data: attachmentData,
    });
};

// Get Attachments by Ticket
const findAttachmentsByTicketId = async (ticketId) => {
    return await prisma.attachment.findMany({
        where: {
            TaskID: ticketId,
        },
    });
};

module.exports = {
    createAttachment,
    findAttachmentsByTicketId,
};