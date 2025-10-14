// Environment configuration
export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000",
  SOCKET_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

// API endpoints
export const endpoints = {
  health: "/health",
  debug: "/debug",
  projects: "/projects",
  project: "/project",
} as const;

// Default configuration values
export const config = {
  // API retry settings
  maxRetries: 3,
  retryDelay: 1000,
  
  // Socket settings
  reconnectAttempts: 5,
  reconnectDelay: 2000,
  
  // UI settings
  toastDuration: 4000,
  loadingDebounce: 300,
  
  // Deployment settings
  deploymentTimeout: 300000, // 5 minutes
  logUpdateInterval: 1000,
  statusCheckInterval: 5000,
} as const;

export default { env, endpoints, config };
