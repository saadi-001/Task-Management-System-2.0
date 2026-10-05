const activityService = require("../services/activityService");

// Get Ticket Activity History
const getTicketActivityHistory = async (req, res) => {
    try {
        const ticketId = Number(req.params.ticketId);

        const activities =
            await activityService.getActivitiesByTicketId(ticketId);

        return res.status(200).json({
            success: true,
            data: activities,
        });

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to fetch activity history",
        });
    }
};

module.exports = {
    getTicketActivityHistory,
};