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
    updateTicket,
    deleteTicket,
    assignTicket,
};