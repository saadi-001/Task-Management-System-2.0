const prisma = require("../config/prisma");

// ==============================
// Create Ticket
// ==============================
const createTicket = async (ticketData) => {
    return await prisma.task.create({
        data: ticketData,
    });
};

// ==============================
// Get Ticket by ID
// ==============================
const findTicketById = async (ticketId) => {
    return await prisma.task.findUnique({
        where: {
            TaskID: ticketId,
        },
    });
};

// ==============================
// Get All Tickets
// ==============================
const findAllTickets = async () => {
    return await prisma.task.findMany();
};

// ==============================
// Get Tickets by Project ID
// ==============================
const findTicketsByProjectId = async (projectId) => {
    return await prisma.task.findMany({
        where: {
            ProjectID: Number(projectId),
        },
    });
};

// ==============================
// Get Tickets Assigned To User
// ==============================
const findTicketsByAssignedUser = async (userId) => {
    return await prisma.task.findMany({
        where: {
            AssignedTo: Number(userId),
        },
        orderBy: {
            TaskID: "asc",
        },
    });
};

// ==============================
// Update Ticket
// ==============================
const updateTicket = async (ticketId, ticketData) => {
    return await prisma.task.update({
        where: {
            TaskID: ticketId,
        },
        data: ticketData,
    });
};

// ==============================
// Delete Ticket
// ==============================
const deleteTicket = async (ticketId) => {
    return await prisma.task.delete({
        where: {
            TaskID: ticketId,
        },
    });
};

// ==============================
// Assign Ticket To User
// ==============================
const assignTicket = async (ticketId, userId) => {
    return await prisma.task.update({
        where: {
            TaskID: ticketId,
        },
        data: {
            AssignedTo: userId,
        },
    });
};

module.exports = {
    createTicket,
    findTicketById,
    findAllTickets,
    findTicketsByProjectId,
    findTicketsByAssignedUser,
    updateTicket,
    deleteTicket,
    assignTicket,
};