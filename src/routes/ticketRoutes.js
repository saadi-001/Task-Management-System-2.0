const express = require("express");

const router = express.Router();

const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middlewares/authMiddleware");


// Create Ticket
router.post(
    "/",
    authMiddleware,
    ticketController.createTicket
);


// Get All Tickets
router.get(
    "/",
    authMiddleware,
    ticketController.getAllTickets
);


// Get Ticket By ID
router.get(
    "/:id",
    authMiddleware,
    ticketController.getTicketById
);


// Update Ticket
router.put(
    "/:id",
    authMiddleware,
    ticketController.updateTicket
);


// Delete Ticket
router.delete(
    "/:id",
    authMiddleware,
    ticketController.deleteTicket
);


module.exports = router;