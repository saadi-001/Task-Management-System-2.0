const ticketRepository = require("../repositories/ticketRepository");
const authRepository = require("../repositories/authRepository");
const activityService = require("./activityService");


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
const createTicket = async (ticketData, userId) => {

    const ticket = await ticketRepository.createTicket(ticketData);

    await activityService.createActivity(
        "Ticket created",
        ticket.TaskID,
        userId
    );

    return ticket;
};


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
const updateTicket = async (ticketId, ticketData, userId) => {

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

    // Update ticket
    const updatedTicket = await ticketRepository.updateTicket(
        ticketId,
        ticketData
    );

    // Create activity history
    await activityService.createActivity(
        "Ticket updated",
        ticketId,
        userId
    );

    return updatedTicket;
};


// ==============================
// Delete Ticket
// ==============================
const deleteTicket = async (ticketId, userId) => {

    // Check if ticket exists
    await getTicketById(ticketId);

    // Save activity BEFORE deleting ticket
    await activityService.createActivity(
        "Ticket deleted",
        ticketId,
        userId
    );

    // Delete ticket
    return await ticketRepository.deleteTicket(ticketId);
};


// ==============================
// Assign Ticket To User
// ==============================
const assignTicket = async (
    ticketId,
    assignedUserId,
    currentUserId
) => {

    // Check if ticket exists
    await getTicketById(ticketId);

    // Check if assigned user exists
    const user = await authRepository.findUserById(
        assignedUserId
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Assign ticket
    const ticket = await ticketRepository.assignTicket(
        ticketId,
        assignedUserId
    );

    // Create activity history
    await activityService.createActivity(
        `Ticket assigned to user ${assignedUserId}`,
        ticketId,
        currentUserId
    );

    return ticket;
};


module.exports = {
    createTicket,
    getTicketById,
    getAllTickets,
    updateTicket,
    deleteTicket,
    assignTicket,
};