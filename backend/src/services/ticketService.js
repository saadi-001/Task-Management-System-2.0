const ticketRepository = require("../repositories/ticketRepository");
const authRepository = require("../repositories/authRepository");
const activityService = require("./activityService");
const notificationService = require("./notificationService");

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

    if (ticket.AssignedTo && ticket.AssignedTo !== userId) {
        await notificationService.ticketAssigned(ticket, ticket.AssignedTo, userId);
    }

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
// Get Tickets by Project ID
// ==============================
const getTicketsByProjectId = async (projectId) => {
    return await ticketRepository.findTicketsByProjectId(projectId);
};

// ==============================
// Get Tickets Assigned To User
// ==============================
const getTicketsByAssignedUser = async (userId) => {
    return await ticketRepository.findTicketsByAssignedUser(userId);
};

// ==============================
// Update Ticket
// ==============================
const updateTicket = async (ticketId, ticketData, userId) => {
    const existingTicket = await getTicketById(ticketId);

    // Check status workflow only when Status is being changed
    let statusChanged = false;
    const priorityChanged =
        ticketData.Priority !== undefined &&
        ticketData.Priority !== existingTicket.Priority;
    const assigneeChanged =
        ticketData.AssignedTo !== undefined &&
        Number(ticketData.AssignedTo) !== Number(existingTicket.AssignedTo);
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
            statusChanged = true;
        }
    }

    const updatedTicket = await ticketRepository.updateTicket(
        ticketId,
        ticketData
    );

    await activityService.createActivity(
        "Ticket updated",
        ticketId,
        userId
    );

    if (assigneeChanged) {
        await notificationService.ticketReassigned(
            updatedTicket,
            existingTicket.AssignedTo,
            userId
        );
    }

    if (statusChanged) {
        if (updatedTicket.Status === "Done") {
            await notificationService.ticketCompleted(updatedTicket, userId);
        } else if (existingTicket.Status === "Done") {
            await notificationService.ticketReopened(updatedTicket, userId);
        } else {
            await notificationService.ticketStatusChanged(updatedTicket, userId, "User");
        }
    }

    if (priorityChanged) {
        await notificationService.ticketPriorityChanged(updatedTicket, userId);
    }

    if (!statusChanged && !priorityChanged && !assigneeChanged) {
        await notificationService.ticketUpdated(updatedTicket, userId);
    }

    return updatedTicket;
};

// ==============================
// Delete Ticket
// ==============================
const deleteTicket = async (ticketId, userId) => {
    await getTicketById(ticketId);

    // Save activity BEFORE deleting ticket
    await activityService.createActivity(
        "Ticket deleted",
        ticketId,
        userId
    );

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
    const existingTicket = await getTicketById(ticketId);

    // Handle unassign
    if (!assignedUserId || Number(assignedUserId) === 0) {
        const ticket = await ticketRepository.assignTicket(ticketId, 0);
        await activityService.createActivity("Ticket unassigned", ticketId, currentUserId);
        return ticket;
    }

    // Check if assigned user exists
    const user = await authRepository.findUserById(
        assignedUserId
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Check if assigned user is active
    if (user.IsActive === false) {
        const error = new Error(
            "Cannot assign ticket to an inactive user."
        );
        error.statusCode = 400;
        throw error;
    }

    const ticket = await ticketRepository.assignTicket(
        ticketId,
        assignedUserId
    );

    await activityService.createActivity(
        `Ticket assigned to user ${assignedUserId}`,
        ticketId,
        currentUserId
    );

    await notificationService.ticketReassigned(
        ticket,
        existingTicket.AssignedTo,
        currentUserId
    );

    return ticket;
};

module.exports = {
    createTicket,
    getTicketById,
    getAllTickets,
    getTicketsByProjectId,
    getTicketsByAssignedUser,
    updateTicket,
    deleteTicket,
    assignTicket,
};
