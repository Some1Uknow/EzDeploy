const { Server } = require("socket.io");
const { createServer } = require("http");
const Redis = require("ioredis");
const { config } = require("../config");
const { db } = require("../lib/db");
const { project } = require("../lib/schema");
const { eq } = require("drizzle-orm");

let io;
const subscriber = new Redis(process.env.REDIS_KEY);

// Log batching system
const logBuffer = new Map(); // projectId -> array of log entries
const BATCH_FLUSH_INTERVAL = 2000; // 2 seconds
const MAX_BATCH_SIZE = 50; // Maximum logs per batch

// Add error handling
subscriber.on('error', (err) => {
  console.error('Redis connection error:', err);
});

subscriber.on('connect', () => {
  console.log('Connected to Redis successfully');
});

subscriber.on('ready', () => {  console.log('Redis connection is ready');
});

// Function to flush logs to database
const flushLogsToDatabase = async (projectId) => {
  if (!logBuffer.has(projectId) || logBuffer.get(projectId).length === 0) {
    return;
  }

  try {
    const logs = logBuffer.get(projectId);
    const currentProject = await db.select().from(project).where(eq(project.id, projectId)).limit(1);
    
    if (currentProject.length > 0) {
      const existingLogs = JSON.parse(currentProject[0].logs || '[]');
      const allLogs = [...existingLogs, ...logs];
      
      let updateData = {
        logs: JSON.stringify(allLogs),
        updatedAt: new Date()
      };
      
      // Check if any of the batched logs indicates completion
      const hasCompletionMessage = logs.some(log => log.message === 'Done');
      if (hasCompletionMessage && currentProject[0].status !== 'deployed') {
        updateData.status = 'deployed';
        updateData.deployedAt = new Date();
        console.log(`Marking project ${projectId} as deployed (batched)`);
      }
      
      await db.update(project)
        .set(updateData)
        .where(eq(project.id, projectId));
        
      console.log(`Flushed ${logs.length} logs to database for project ${projectId}`);
    }
    
    // Clear the buffer for this project
    logBuffer.delete(projectId);
  } catch (error) {
    console.error(`Error flushing logs to database for project ${projectId}:`, error);
    // Don't clear buffer on error, let it retry
  }
};

// Periodic flush of all project logs
const startPeriodicFlush = () => {
  setInterval(async () => {
    const projectIds = Array.from(logBuffer.keys());
    for (const projectId of projectIds) {
      await flushLogsToDatabase(projectId);
    }
  }, BATCH_FLUSH_INTERVAL);
};

// Force flush logs for a specific project (called on completion)
const forceFlushProject = async (projectId) => {
  await flushLogsToDatabase(projectId);
};

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

  // Start the periodic flush
  startPeriodicFlush();

  return io;
};

const initRedisSubscribe = async () => {
  console.log("Subscribed to logs...");
  subscriber.psubscribe("logs:*");  subscriber.on("pmessage", async (pattern, channel, message) => {
    console.log(`Received log message on ${channel}:`, message);
    io.to(channel).emit("message", message);
    
    // Extract project ID from channel (format: logs:projectId)
    const projectId = channel.split(':')[1];
    if (projectId) {
      try {
        // Parse the message if it's a JSON string containing a log property
        let logMessage = message;
        try {
          const parsedMessage = JSON.parse(message);
          if (parsedMessage.log) {
            logMessage = parsedMessage.log;
          }
        } catch (e) {
          // If parsing fails, use the original message
          logMessage = message;
        }

        // Add log to buffer instead of immediately writing to database
        if (!logBuffer.has(projectId)) {
          logBuffer.set(projectId, []);
        }
        
        logBuffer.get(projectId).push({
          timestamp: new Date().toISOString(),
          message: logMessage
        });

        console.log(`Buffered log for project ${projectId}:`, logMessage);

        // Check if this is a completion message - if so, force flush immediately
        if (logMessage === 'Done') {
          console.log(`Completion detected for project ${projectId}, force flushing logs`);
          await forceFlushProject(projectId);
        }
        // If buffer gets too large, flush it
        else if (logBuffer.get(projectId).length >= MAX_BATCH_SIZE) {
          console.log(`Buffer full for project ${projectId}, flushing logs`);
          await flushLogsToDatabase(projectId);
        }
        
      } catch (error) {
        console.error('Error processing log message:', error);
      }
    }
  });
};

module.exports = {
  initializeSocket,
  initRedisSubscribe,
  subscriber,
  forceFlushProject, // Export for external use if needed
  flushLogsToDatabase // Export for external use if needed
};
