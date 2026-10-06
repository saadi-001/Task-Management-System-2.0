const prisma = require('../config/prisma');

/**
 * After a delete operation, checks if the table is empty.
 * If empty, resets AUTO_INCREMENT to 1 so the next insert starts from 1.
 * 
 * @param {string} tableName - The exact MySQL table name
 * @param {string} modelName - The Prisma model name (lowercase)
 */
const resetAutoIncrementIfEmpty = async (tableName, modelName) => {
    try {
        const count = await prisma[modelName].count();
        if (count === 0) {
            // Unsafe is fine here because tableName is hardcoded in the codebase, never from user input.
            await prisma.$executeRawUnsafe(
                `ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1`
            );
            console.log(`Reset AUTO_INCREMENT for table ${tableName} to 1`);
        }
    } catch (error) {
        console.error(`Error resetting AUTO_INCREMENT for ${tableName}:`, error);
    }
};

module.exports = { resetAutoIncrementIfEmpty };
