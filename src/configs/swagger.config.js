import swaggerJsDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Finance Data Processing API",
            version: "1.0.0",
            description: "Backend API for the Finance Data Processing and Access Control System. Authenticate by logging in first.After a successful login, the server sets an HTTP- only access token cookie, which will be used to authorize subsequent API requests."
        },
        servers: [
            {
                url: "http://localhost:8080/api",
                description: "Local server"
            }
        ]
    },
    components: {
        securitySchemes: {
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "accessToken"
            }
        }
    },

    apis: [
        "./src/modules/**/*.swagger.js",
        "./src/modules/**/*.routes.js"
    ]
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;