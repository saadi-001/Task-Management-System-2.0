const activityRepository = require("../repositories/activityRepository");

// Create Activity
const createActivity = async (action, ticketId, userId) => {
    return await activityRepository.createActivity({
        Action: action,
        TaskID: ticketId,
        UserID: userId,
    });
};

// Get Ticket Activity History
const getActivitiesByTicketId = async (ticketId) => {
    return await activityRepository.findActivitiesByTicketId(ticketId);
};

module.exports = {
    createActivity,
    getActivitiesByTicketId,
};