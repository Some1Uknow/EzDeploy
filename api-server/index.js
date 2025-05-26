const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const { Server } = require("socket.io");
const Redis = require("ioredis");
require("dotenv").config();

// Environment variable validation
const requiredEnvVars = [
  'REDIS_KEY',
  'REGION',
  'ACCESS_KEY',
  'SECRET_ACCESS',
  'S3_BUCKET',
  'S3_ACCESS_KEY',
  'S3_SECRET_ACCESS_KEY',
  'S3_REGION'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

console.log('All required environment variables are present');

const app = express();
const PORT = process.env.PORT || 9000;
const SOCKET_PORT = process.env.SOCKET_PORT || 9999;

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

const io = new Server({cors: '*'});

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

io.listen(SOCKET_PORT, () =>
  console.log(`Socket Server running on port ${SOCKET_PORT}`)
);

const ecsClient = new ECSClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS,
  },
//  logger: console,
});

const config = {
  CLUSTER: "arn:aws:ecs:ap-southeast-2:010526241185:cluster/builder-cluster2",
  TASK: "arn:aws:ecs:ap-southeast-2:010526241185:task-definition/builder-task",
};

app.use(express.json());

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Add debugging endpoint to test ECS connection
app.get("/debug", async (req, res) => {
  try {
    const testCommand = {
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
    };
    
    res.json({
      status: "debug",
      config: {
        cluster: config.CLUSTER,
        task: config.TASK,
        region: process.env.REGION,
        hasCredentials: !!(process.env.ACCESS_KEY && process.env.SECRET_ACCESS),
      },
      testCommand
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

app.post("/project", async (req, res) => {
  const { gitURL, slug } = req.body;
  
  // Validate required fields
  if (!gitURL || typeof gitURL !== 'string' || gitURL.trim() === '') {
    return res.status(400).json({
      status: "error",
      message: "gitURL is required and must be a valid string"
    });
  }
  
  const projectSlug = slug ? slug : generateSlug();

  try {
    const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-0daf3080430458a59",
          "subnet-0e2425bbd184eb721",
          "subnet-0c8a0d5df3090c76b",
        ],
        securityGroups: ["sg-0c5cc941c6b334176"],
      },
    },    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            {
              name: "GIT_REPOSITORY__URL",
              value: gitURL.trim(),
            },
            {
              name: "PROJECT_ID",
              value: projectSlug,
            },
            {
              name: "REDIS_KEY",
              value: process.env.REDIS_KEY,
            },
            {
              name: "S3_BUCKET",
              value: process.env.S3_BUCKET,
            },
            {
              name: "S3_ACCESS_KEY",
              value: process.env.S3_ACCESS_KEY,
            },
            {
              name: "S3_SECRET_ACCESS_KEY",
              value: process.env.S3_SECRET_ACCESS_KEY,
            },
            {
              name: "S3_REGION",
              value: process.env.S3_REGION,
            },
          ],
        },
      ],
    },});

    await ecsClient.send(command);

    return res.json({
      status: "queued",
      data: {
        projectSlug,
        url: `http://${projectSlug}.localhost:8000`,
      },
    });
  } catch (error) {
    console.error('Error creating ECS task:', error);
    return res.status(500).json({
      status: "error",
      message: "Failed to queue build task",
      error: error.message
    });
  }
});

async function initRedisSubscribe() {
  console.log("Subscribed to logs...");
  subscriber.psubscribe("logs:*");

  subscriber.on("pmessage", (pattern, channel, message) => {
    console.log(`Received log message on ${channel}:`, message);
    io.to(channel).emit("message", message);
  });
}

initRedisSubscribe();

app.listen(PORT, () => {
  console.log(`App is live on http://localhost:${PORT}`);
});
