const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const permissions = [
    "CREATE_ORGANIZATION",
    "UPDATE_ORGANIZATION",
    "DELETE_ORGANIZATION",
    "ASSIGN_USER",
    "REMOVE_USER",
    "TRANSFER_OWNER",

    "CREATE_PROJECT",
    "VIEW_PROJECT",
    "UPDATE_PROJECT",
    "DELETE_PROJECT",

    "CREATE_TICKET",
    "VIEW_TICKET",
    "UPDATE_TICKET",
    "DELETE_TICKET",
    "ASSIGN_TICKET",

    "UPLOAD_ATTACHMENT",
    "VIEW_ATTACHMENT"
];

async function main() {

    for (const name of permissions) {

        await prisma.permission.upsert({
            where: {
                Name: name
            },
            update: {},
            create: {
                Name: name
            }
        });

    }

    console.log("Permissions seeded successfully.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });