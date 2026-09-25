const ticketService = require("../services/ticketService");

// ==============================
// Create Ticket
// ==============================
const createTicket = async (req, res) => {
    try {
        const ticket = await ticketService.createTicket(
            req.body,
            req.user.UserID
        );

        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: ticket,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to create ticket",
        });
    }
};

// ==============================
// Get All Tickets
// ==============================
const getAllTickets = async (req, res) => {
    try {
        const tickets = await ticketService.getAllTickets();

        return res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch tickets",
        });
    }
};

// ==============================
// Get Tickets by Project ID
// ==============================
const getTicketsByProjectId = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);

        if (!Number.isInteger(projectId) || projectId < 1) {
            return res.status(400).json({
                success: false,
                message: "Project id must be a positive integer",
            });
        }

        const tickets =
            await ticketService.getTicketsByProjectId(projectId);

        return res.status(200).json({
            success: true,
            data: tickets,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch project tickets",
        });
    }
};

// ==============================
// Get Tickets Assigned To User
// ==============================
const getTicketsByAssignedUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId < 1) {
            return res.status(400).json({
                success: false,
                message: "User id must be a positive integer",
            });
        }

        const tickets =
            await ticketService.getTicketsByAssignedUser(userId);

        return res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch user's assigned tickets",
        });
    }
};

// ==============================
// Get Ticket by ID
// ==============================
const getTicketById = async (req, res) => {
    try {
        const ticketId = Number(req.params.id);

        const ticket = await ticketService.getTicketById(ticketId);

        return res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch ticket",
        });
    }
};

// ==============================
// Update Ticket
// ==============================
const updateTicket = async (req, res) => {
    try {
        const ticketId = Number(req.params.id);

        const ticket = await ticketService.updateTicket(
            ticketId,
            req.body,
            req.user.UserID
        );

        return res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            data: ticket,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update ticket",
        });
    }
};

// ==============================
// Delete Ticket
// ==============================
const deleteTicket = async (req, res) => {
    try {
        const ticketId = Number(req.params.id);

        const ticket = await ticketService.deleteTicket(
            ticketId,
            req.user.UserID
        );

        return res.status(200).json({
            success: true,
            message: "Ticket deleted successfully",
            data: ticket,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to delete ticket",
        });
    }
};

// ==============================
// Assign Ticket To User
// ==============================
const assignTicket = async (req, res) => {
    try {
        const ticketId = Number(req.params.id);
        const assignedUserId = Number(req.body.userId);

        const ticket = await ticketService.assignTicket(
            ticketId,
            assignedUserId,
            req.user.UserID
        );

        return res.status(200).json({
            success: true,
            message: "Ticket assigned successfully",
            data: ticket,
        });
    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to assign ticket",
        });
    }
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