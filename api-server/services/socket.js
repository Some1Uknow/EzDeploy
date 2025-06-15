// server/socket.js
const { Server } = require("socket.io");
const { createServer } = require("http");
const Redis = require("ioredis");
const { config } = require("../config");
const { db } = require("../lib/db");
const { project } = require("../lib/schema");
const { eq } = require("drizzle-orm");

let io;
const subscriber = new Redis(process.env.REDIS_KEY);

// In‑memory buffers & flush state
const logBuffer = new Map();    // projectId → [ { timestamp, message } ]
const flushing = new Set();     // projectIds currently flushing

const BATCH_INTERVAL = 2000;
const MAX_BATCH_SIZE = 50;

// Redis connection logging
subscriber.on("error", err => console.error("Redis error:", err));
subscriber.on("connect", () => console.log("Redis connected"));
subscriber.on("ready", () => console.log("Redis ready"));

// Flush helper with per‑project guard
async function flushLogsToDatabase(projectId) {
  if (flushing.has(projectId)) return;
  const entries = logBuffer.get(projectId);
  if (!entries || entries.length === 0) return;

  flushing.add(projectId);
  try {
    const rows = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (rows.length) {
      const existing = JSON.parse(rows[0].logs || "[]");
      const allLogs = existing.concat(entries);

      const updateData = {
        logs: JSON.stringify(allLogs),
        updatedAt: new Date(),
      };

      if (
        entries.some(e => e.message === "Done") &&
        rows[0].status !== "deployed"
      ) {
        updateData.status = "deployed";
        updateData.deployedAt = new Date();
      }

      await db
        .update(project)
        .set(updateData)
        .where(eq(project.id, projectId));

      console.log(`Flushed ${entries.length} logs for project ${projectId}`);
    }

    logBuffer.delete(projectId);
  } catch (err) {
    console.error(`Flush error for ${projectId}:`, err);
    // keep buffer for retry
  } finally {
    flushing.delete(projectId);
  }
}

// Periodic flush
function startPeriodicFlush() {
  setInterval(() => {
    for (const projectId of logBuffer.keys()) {
      flushLogsToDatabase(projectId);
    }
  }, BATCH_INTERVAL);
}

// Initialize Socket.IO and only then Redis subscriptions
function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: config.CORS_OPTIONS.origin }, // Use same CORS as Express
  });

  io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.on("subscribe", channel => {
      if (typeof channel === "string") {
        socket.join(channel);
        socket.emit("log", channel.split(":")[1], `Joined ${channel}`);
        console.log(`Socket ${socket.id} joined ${channel}`);
      }
    });

    socket.on("unsubscribe", channel => {
      if (typeof channel === "string") {
        socket.leave(channel);
        console.log(`Socket ${socket.id} left ${channel}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Initialize Redis and periodic flush when Socket.IO is ready
  initRedisSubscribe();
  startPeriodicFlush();
  
  console.log(`Socket.IO initialized on same server as Express`);

  return io;
}

// Redis psubscribe
function initRedisSubscribe() {
  subscriber.psubscribe("logs:*", (err, count) => {
    if (err) console.error("psubscribe failed:", err);
    else console.log(`Subscribed to ${count} pattern(s)`);
  });

  subscriber.on("pmessage", async (_pattern, channel, raw) => {
    const projectId = channel.split(":")[1];
    let msg = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.log) msg = parsed.log;
    } catch {}

    // emit two‑arg event
    io.to(channel).emit("log", projectId, msg);

    // buffer
    const bucket = logBuffer.get(projectId) || [];
    bucket.push({ timestamp: new Date().toISOString(), message: msg });
    logBuffer.set(projectId, bucket);

    // Done or size → flush
    if (msg === "Done" || bucket.length >= MAX_BATCH_SIZE) {
      await flushLogsToDatabase(projectId);
    }
  });
}

module.exports = { initializeSocket };
