const ticketRepository = require("../repositories/ticketRepository");
const authRepository = require("../repositories/authRepository");

// ==============================
// Allowed Ticket Status Workflow
// ==============================
const allowedStatusTransitions = {
    "Ready to Do": ["In Progress", "Blocked"],
    "In Progress": ["Ready to Do", "Blocked", "Testing"],
    "Blocked": ["In Progress"],
    "Testing": ["Done", "In Progress"],
    "Done": ["In Progress"],
};


// ==============================
// Create Ticket
// ==============================
async function createTicket(ticketData) {
    return await ticketRepository.createTicket(ticketData);
}


// ==============================
// Get Ticket by ID
// ==============================
const getTicketById = async (ticketId) => {

    const ticket = await ticketRepository.findTicketById(ticketId);

    if (!ticket) {
        const error = new Error("Ticket not found");
        error.statusCode = 404;
        throw error;
    }

    return ticket;
};


// ==============================
// Get All Tickets
// ==============================
const getAllTickets = async () => {
    return await ticketRepository.findAllTickets();
};


// ==============================
// Update Ticket
// ==============================
const updateTicket = async (ticketId, ticketData) => {

    // Get existing ticket
    const existingTicket = await getTicketById(ticketId);

    // Check status workflow only when Status is being changed
    if (ticketData.Status) {

        const currentStatus = existingTicket.Status;
        const newStatus = ticketData.Status;

        // Same status is allowed
        if (currentStatus !== newStatus) {

            const allowedStatuses =
                allowedStatusTransitions[currentStatus];

            // Check whether transition is allowed
            if (
                !allowedStatuses ||
                !allowedStatuses.includes(newStatus)
            ) {
                const error = new Error(
                    `Ticket cannot move from ${currentStatus} to ${newStatus}`
                );

                error.statusCode = 400;
                throw error;
            }
        }
    }

    return await ticketRepository.updateTicket(
        ticketId,
        ticketData
    );
};


// ==============================
// Delete Ticket
// ==============================
const deleteTicket = async (ticketId) => {

    await getTicketById(ticketId);

    return await ticketRepository.deleteTicket(ticketId);
};


// ==============================
// Assign Ticket To User
// ==============================
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