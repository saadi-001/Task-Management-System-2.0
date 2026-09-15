require("dotenv").config();

// The compose hostname is valid inside Docker, while local Node runs use the published MySQL port.
if (
    process.env.DATABASE_URL?.includes("@task-management-mysql:") &&
    !require("fs").existsSync("/.dockerenv")
) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
        "@task-management-mysql:",
        "@localhost:"
    );
}

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});