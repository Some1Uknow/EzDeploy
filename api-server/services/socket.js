const { Server } = require("socket.io");
const { createServer } = require("http");
const Redis = require("ioredis");
const { config } = require("../config");

let io;
const subscriber = new Redis(process.env.REDIS_KEY);

// Add error handling
subscriber.on('error', (err) => {
  console.error('Redis connection error:', err);
});

subscriber.on('connect', () => {
  console.log('Connected to Redis successfully');
});

subscriber.on('ready', () => {
  console.log('Redis connection is ready');
});

const initializeSocket = () => {
  const httpServer = createServer();
  io = new Server(httpServer, {cors: {origin: "*"}});

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("subscribe", (channel) => {
      if (!channel) return;
      socket.join(channel);
      socket.emit("message", `Joined ${channel}`);
      console.log(`Client subscribed to ${channel}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  httpServer.listen(config.SOCKET_PORT, () =>
    console.log(`Socket Server running on port ${config.SOCKET_PORT}`)
  );

  return io;
};

const initRedisSubscribe = async () => {
  console.log("Subscribed to logs...");
  subscriber.psubscribe("logs:*");

  subscriber.on("pmessage", (pattern, channel, message) => {
    console.log(`Received log message on ${channel}:`, message);
    io.to(channel).emit("message", message);
  });
};

module.exports = {
  initializeSocket,
  initRedisSubscribe,
  subscriber
};
