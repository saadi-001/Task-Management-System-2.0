require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking how many tasks exist:", await prisma.task.count());

    console.log("Creating ticket 1...");
    const t1 = await prisma.task.create({ data: { Title: "Test 1", Status: "Open", Priority: "Low", ProjectID: 97, AssignedTo: 19 } });
    console.log("Created:", t1.TaskID);

    console.log("Creating ticket 2...");
    const t2 = await prisma.task.create({ data: { Title: "Test 2", Status: "Open", Priority: "Low", ProjectID: 97, AssignedTo: 19 } });
    console.log("Created:", t2.TaskID);

    console.log("Deleting ticket 2 (table not empty)...");
    const { deleteTicket } = require('./src/repositories/ticketRepository');
    await deleteTicket(t2.TaskID);
    
    console.log("Creating ticket 3...");
    const t3 = await prisma.task.create({ data: { Title: "Test 3", Status: "Open", Priority: "Low", ProjectID: 97, AssignedTo: 19 } });
    console.log("Created:", t3.TaskID);

    console.log("Deleting ALL remaining tickets...");
    await prisma.task.deleteMany(); // clean all just to be sure
    const { resetAutoIncrementIfEmpty } = require('./src/utils/resetAutoIncrement');
    await resetAutoIncrementIfEmpty('task', 'task');

    console.log("Creating ticket 4 (table should be empty)...");
    const t4 = await prisma.task.create({ data: { Title: "Test 4", Status: "Open", Priority: "Low", ProjectID: 97, AssignedTo: 19 } });
    console.log("Created (SHOULD BE 1):", t4.TaskID);

    console.log("Cleaning up Test 4...");
    await deleteTicket(t4.TaskID);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
