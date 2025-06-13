const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { config, validateEnv } = require("./config");
const { initializeSocket, initRedisSubscribe } = require("./services/socket");
const routes = require("./routes");

// Validate environment variables
validateEnv();

const app = express();

app.use(express.json());
app.use(cors(config.CORS_OPTIONS));

// Routes
app.use(routes);

// Initialize Socket.IO and Redis subscription
initializeSocket();
initRedisSubscribe();

app.listen(config.PORT, () => {
  console.log(`App is live on http://localhost:${config.PORT}`);
});