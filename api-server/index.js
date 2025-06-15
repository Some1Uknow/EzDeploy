const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
require("dotenv").config();

const { config, validateEnv } = require("./config");
const { initializeSocket } = require("./services/socket");
const routes = require("./routes");

// Validate environment variables
validateEnv();

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(cors(config.CORS_OPTIONS));

// Routes
app.use(routes);

// Initialize Socket.IO on the same server
initializeSocket(httpServer);

httpServer.listen(config.PORT, () => {
  console.log(`Server and Socket.IO running on http://localhost:${config.PORT}`);
});
