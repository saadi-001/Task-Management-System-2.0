const ticketRepository = require("../repositories/ticketRepository");
const authRepository = require("../repositories/authRepository");

// Create Ticket
const createTicket = async (ticketData) => {
    return await ticketRepository.createTicket(ticketData);
};

// Get Ticket by ID
const getTicketById = async (ticketId) => {
    const ticket = await ticketRepository.findTicketById(ticketId);

    if (!ticket) {
        const error = new Error("Ticket not found");
        error.statusCode = 404;
        throw error;
    }

    return ticket;
};

// Get All Tickets
const getAllTickets = async () => {
    return await ticketRepository.findAllTickets();
};

// Update Ticket
const updateTicket = async (ticketId, ticketData) => {
    await getTicketById(ticketId);

    return await ticketRepository.updateTicket(
        ticketId,
        ticketData
    );
};

// Delete Ticket
const deleteTicket = async (ticketId) => {
    await getTicketById(ticketId);

    return await ticketRepository.deleteTicket(ticketId);
};

// Assign Ticket To User
const assignTicket = async (ticketId, userId) => {

    // Check if ticket exists
    await getTicketById(ticketId);

    // Check if user exists
    const user = await authRepository.findUserById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Assign ticket to user
    return await ticketRepository.assignTicket(
        ticketId,
        userId
    );
};

module.exports = {
    createTicket,
    getTicketById,
    getAllTickets,
    updateTicket,
    deleteTicket,
    assignTicket,
};