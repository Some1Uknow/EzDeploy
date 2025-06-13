const { ECSClient } = require("@aws-sdk/client-ecs");

const ecsClient = new ECSClient({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

module.exports = ecsClient;
