const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const routes = require("./routes");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://commodity-crust-womanly.ngrok-free.dev",
    "https://task-management-system-2-0.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow mobile apps, curl, Postman or server-to-server with no origin
            if (!origin) return callback(null, true);

            if (
                allowedOrigins.includes(origin) ||
                origin.endsWith(".vercel.app") ||
                origin.startsWith("http://localhost:") ||
                origin.startsWith("http://127.0.0.1:")
            ) {
                return callback(null, true);
            }

            return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "ngrok-skip-browser-warning",
            "Accept",
            "X-Requested-With",
        ],
    }),
);

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