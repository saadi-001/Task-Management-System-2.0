const prisma = require("../config/prisma");

// Create Ticket
const createTicket = async (ticketData) => {
    return await prisma.task.create({
        data: ticketData,
    });
};

// Get Ticket by ID
const findTicketById = async (ticketId) => {
    return await prisma.task.findUnique({
        where: {
            TaskID: ticketId,
        },
    });
};

// Get All Tickets
const findAllTickets = async () => {
    return await prisma.task.findMany();
};

// Update Ticket
const updateTicket = async (ticketId, ticketData) => {
    return await prisma.task.update({
        where: {
            TaskID: ticketId,
        },
        data: ticketData,
    });
};

// Delete Ticket
const deleteTicket = async (ticketId) => {
    return await prisma.task.delete({
        where: {
            TaskID: ticketId,
        },
    });
};

module.exports = {
    createTicket,
    findTicketById,
    findAllTickets,
    updateTicket,
    deleteTicket,
};