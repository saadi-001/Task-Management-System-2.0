const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Task Management System API is running successfully 🚀"
    });
});

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: (a, b) => {
                const order = [
                    "Authentication",
                    "Users",
                    "Roles",
                    "Permissions",
                    "Organization",
                    "Projects",
                    "Tickets",
                    "Attachments"
                ];

                return order.indexOf(a) - order.indexOf(b);
            }
        }
    })
);

app.use("/api", routes);

module.exports = app;