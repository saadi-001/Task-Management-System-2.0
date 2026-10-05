const prisma = require("../config/prisma");

// Create Activity
const createActivity = async (activityData) => {
    return await prisma.activityhistory.create({
        data: activityData,
    });
};

// Get Activities by Ticket
const findActivitiesByTicketId = async (ticketId) => {
    return await prisma.activityhistory.findMany({
        where: {
            TaskID: ticketId,
        },
        orderBy: {
            ActivityID: "asc",
        },
    });
};

module.exports = {
    createActivity,
    findActivitiesByTicketId,
};