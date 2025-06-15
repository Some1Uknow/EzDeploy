const requiredEnvVars = [
  'REDIS_KEY',
  'S3_BUCKET',
  'S3_ACCESS_KEY',
  'S3_SECRET_ACCESS_KEY',
  'S3_REGION',
  'CORS_ORIGIN',
  'AWS_SUBNETS',
  'AWS_SECURITY_GROUPS'
];

const config = {
  PORT: process.env.PORT || 9000,
  SOCKET_PORT: process.env.SOCKET_PORT || 9999,
  CORS_OPTIONS: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
  },
  ECS: {
    CLUSTER: process.env.ECS_CLUSTER,
    TASK: process.env.ECS_TASK,
  },
  AWS: {
    SUBNETS: process.env.AWS_SUBNETS ? process.env.AWS_SUBNETS.split(',') : [],
    SECURITY_GROUPS: process.env.AWS_SECURITY_GROUPS ? process.env.AWS_SECURITY_GROUPS.split(',') : [],
  }
};

// Environment variable validation
const validateEnv = () => {
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
  }
  console.log('All required environment variables are present');
};

module.exports = {
  config,
  validateEnv
};
