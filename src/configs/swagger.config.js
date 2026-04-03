import swaggerJsDoc from "swagger-jsdoc";

const environment = process.env.ENVIRONMENT || "DEVELOPMENT";
const vpsIp = process.env.VPS_IP || "localhost";
const PORT = process.env.PORT || 9090;

const serverUrl =
    environment === "PRODUCTION"
        ? `http://${vpsIp}/api`
        : `http://localhost:${PORT}/api`;

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Finance Data Processing API",
            version: "1.0.0",
            description:
                "Backend API for the Finance Data Processing and Access Control System. Authenticate by logging in first. After a successful login, the server sets an HTTP-only access token cookie, which is used to authorize subsequent API requests."
        },

        servers: [
            {
                url: serverUrl,
                description:
                    environment === "PRODUCTION"
                        ? "Production Server"
                        : "Local Development Server"
            }
        ],

        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken"
                }
            }
        }
    },

    apis: [
        "./src/modules/**/*.swagger.js",
        "./src/modules/**/*.routes.js"
    ]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;