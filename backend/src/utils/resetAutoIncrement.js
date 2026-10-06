const prisma = require("../config/prisma");

/**
 * Resets AUTO_INCREMENT only after a table's final row is physically deleted.
 * A primary key is never reused while rows remain, because that could make an
 * existing relationship point at the wrong record.
 *
 * The table name is resolved through INFORMATION_SCHEMA. This avoids the
 * Windows/Linux table-name casing mismatch that commonly breaks Azure MySQL
 * deployments. Errors intentionally propagate: the previous helper swallowed
 * them, so the delete looked successful while the sequence was never reset.
 *
 * @param {string} tableName Expected MySQL table name, supplied by a repository
 * @param {string} modelName Prisma model name
 * @returns {Promise<boolean>} Whether a reset was performed
 */
const resetAutoIncrementIfEmpty = async (tableName, modelName) => {
    if (!Object.prototype.hasOwnProperty.call(prisma, modelName)) {
        throw new Error(`Unknown Prisma model for AUTO_INCREMENT reset: ${modelName}`);
    }

    const count = await prisma[modelName].count();
    if (count !== 0) return false;

    const tables = await prisma.$queryRawUnsafe(
        `SELECT TABLE_NAME AS tableName
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND LOWER(TABLE_NAME) = LOWER(?)
         LIMIT 1`,
        tableName
    );

    const resolvedTableName = tables[0]?.tableName || tables[0]?.TABLE_NAME;
    if (!resolvedTableName || !/^[A-Za-z0-9_]+$/.test(resolvedTableName)) {
        throw new Error(`Could not resolve database table for AUTO_INCREMENT reset: ${tableName}`);
    }

    await prisma.$executeRawUnsafe(
        `ALTER TABLE \`${resolvedTableName}\` AUTO_INCREMENT = 1`
    );

    console.info(`Reset AUTO_INCREMENT for table ${resolvedTableName} to 1`);
    return true;
};

module.exports = { resetAutoIncrementIfEmpty };
