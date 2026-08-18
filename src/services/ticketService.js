const ticketRepository = require("../repositories/ticketRepository");

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

module.exports = {
    createTicket,
    getTicketById,
    getAllTickets,
    updateTicket,
    deleteTicket,
};