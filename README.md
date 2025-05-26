# EzDeploy

**EzDeploy** is a modern, cloud-native deployment platform that enables seamless deployment of web applications directly from Git repositories. Built with a microservices architecture, EzDeploy automatically builds and deploys your projects to a scalable infrastructure.

## 🚀 Features

- **One-Click Deployment**: Deploy any web application from a Git repository with a single API call
- **Real-time Build Logs**: Monitor your deployment progress with live WebSocket connections
- **Auto-Detection**: Automatically detects build outputs (dist, build, out, public directories)
- **Subdomain Routing**: Each deployment gets its own subdomain for easy access
- **Scalable Architecture**: Built on AWS ECS Fargate for automatic scaling
- **S3 Static Hosting**: Deployed applications are served from AWS S3 with CloudFront-like proxy
- **Redis Integration**: Real-time communication and logging via Redis pub/sub

## 🏗️ Architecture

EzDeploy consists of three main microservices:

### 1. API Server (`api-server/`)
The main API gateway that handles deployment requests and manages the build pipeline.

**Key Features:**
- Express.js REST API for deployment requests
- WebSocket server for real-time build logs
- AWS ECS task orchestration
- Redis pub/sub for log streaming
- Environment validation and error handling

**Endpoints:**
- `POST /project` - Deploy a new project
- `GET /health` - Health check endpoint
- `GET /debug` - Debug and configuration info

### 2. Build Server (`build-server/`)
A containerized build environment that clones, builds, and uploads projects.

**Key Features:**
- Docker-based build environment with Node.js 20
- Git repository cloning
- Automatic build detection (`npm install && npm run build`)
- S3 upload with proper MIME types
- Real-time log publishing to Redis

### 3. S3 Reverse Proxy (`s3-reverse-proxy/`)
A lightweight proxy server that routes subdomain requests to the appropriate S3 objects.

**Key Features:**
- Subdomain-based routing
- S3 static file serving
- Automatic `index.html` resolution
- Express.js with http-proxy middleware

## 📋 Prerequisites

Before setting up EzDeploy, ensure you have:

- **AWS Account** with the following services configured:
  - ECS Cluster with Fargate tasks
  - S3 bucket for static file hosting
  - VPC with subnets and security groups
- **Redis Instance** (AWS ElastiCache or external)
- **Docker** (for building the build-server image)
- **Node.js 18+** for running the services

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd EzDeploy
```

### 2. Environment Configuration

Create `.env` files for each service:

#### API Server Environment (`.env`)
```env
# Redis Configuration
REDIS_KEY=redis://your-redis-connection-string

# AWS ECS Configuration
REGION=ap-southeast-2
ACCESS_KEY=your-aws-access-key
SECRET_ACCESS=your-aws-secret-key

# S3 Configuration
S3_BUCKET=your-s3-bucket-name
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_ACCESS_KEY=your-s3-secret-key
S3_REGION=ap-southeast-2

# Server Configuration
PORT=9000
SOCKET_PORT=9999
```

#### Build Server Environment
The build server receives environment variables through ECS task overrides:
- `GIT_REPOSITORY__URL` - Git repository URL to clone
- `PROJECT_ID` - Unique project identifier
- `REDIS_KEY` - Redis connection string
- `S3_BUCKET` - S3 bucket name
- `S3_ACCESS_KEY` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_REGION` - S3 region

### 3. AWS Infrastructure Setup

#### ECS Cluster Configuration
Update the ECS configuration in `api-server/index.js`:

```javascript
const config = {
  CLUSTER: "arn:aws:ecs:your-region:your-account:cluster/your-cluster",
  TASK: "arn:aws:ecs:your-region:your-account:task-definition/your-task",
};
```

#### Network Configuration
Update the network configuration with your VPC subnets and security groups:

```javascript
networkConfiguration: {
  awsvpcConfiguration: {
    assignPublicIp: "ENABLED",
    subnets: [
      "subnet-xxxxxxx",
      "subnet-yyyyyyy",
      "subnet-zzzzzzz",
    ],
    securityGroups: ["sg-xxxxxxx"],
  },
}
```

### 4. Build and Deploy Build Server

```bash
cd build-server
docker build -t your-registry/ezdeploy-builder .
docker push your-registry/ezdeploy-builder
```

Update your ECS task definition to use this image.

### 5. Install Dependencies and Start Services

#### API Server
```bash
cd api-server
npm install
node index.js
```

#### S3 Reverse Proxy
```bash
cd s3-reverse-proxy
npm install
node index.js
```

## 🚀 Usage

### Deploying a Project

Send a POST request to the API server:

```bash
curl -X POST http://localhost:9000/project \
  -H "Content-Type: application/json" \
  -d '{
    "gitURL": "https://github.com/username/repository.git",
    "slug": "my-project"
  }'
```

**Response:**
```json
{
  "status": "queued",
  "data": {
    "projectSlug": "my-project",
    "url": "http://my-project.localhost:8000"
  }
}
```

### Monitoring Build Progress

Connect to the WebSocket server to receive real-time build logs:

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:9999');

socket.on('connect', () => {
  socket.emit('subscribe', 'logs:my-project');
});

socket.on('message', (data) => {
  console.log('Build log:', data);
});
```

### Testing the Deployment

Use the provided test script:

```bash
cd api-server
node test-deployment.js
```

## 📁 Project Structure

```
EzDeploy/
├── api-server/
│   ├── index.js              # Main API server
│   ├── package.json          # Dependencies and scripts
│   └── test-deployment.js    # Testing utility
├── build-server/
│   ├── script.js             # Build and upload logic
│   ├── main.sh               # Git clone script
│   ├── Dockerfile            # Container definition
│   └── package.json          # Dependencies
├── s3-reverse-proxy/
│   ├── index.js              # Proxy server
│   └── package.json          # Dependencies
└── README.md                 # This documentation
```

## 🔧 Configuration

### Supported Project Types

EzDeploy automatically detects and builds projects that:
- Have a `package.json` file
- Support `npm install && npm run build`
- Output built files to one of these directories:
  - `dist/`
  - `build/`
  - `out/`
  - `public/`

### Environment Variables

#### Required for API Server
| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_KEY` | Redis connection string | `redis://localhost:6379` |
| `REGION` | AWS region | `ap-southeast-2` |
| `ACCESS_KEY` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `SECRET_ACCESS` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_BUCKET` | S3 bucket name | `my-deployments-bucket` |
| `S3_ACCESS_KEY` | S3 access key | `AKIAIOSFODNN7EXAMPLE` |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `S3_REGION` | S3 region | `ap-southeast-2` |

#### Optional for API Server
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `9000` |
| `SOCKET_PORT` | WebSocket server port | `9999` |

## 🔍 API Reference

### POST /project

Deploy a new project from a Git repository.

**Request Body:**
```json
{
  "gitURL": "string (required) - Git repository URL",
  "slug": "string (optional) - Custom project slug"
}
```

**Response:**
```json
{
  "status": "queued",
  "data": {
    "projectSlug": "string - Generated or provided slug",
    "url": "string - Deployment URL"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "string - Error description",
  "error": "string - Technical error details"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-05-26T10:30:00.000Z"
}
```

### GET /debug

Debug and configuration information.

**Response:**
```json
{
  "status": "debug",
  "config": {
    "cluster": "arn:aws:ecs:...",
    "task": "arn:aws:ecs:...",
    "region": "ap-southeast-2",
    "hasCredentials": true
  }
}
```

## 🔄 Build Process Flow

1. **Request Received**: API server receives deployment request
2. **Task Creation**: ECS Fargate task is created with build environment
3. **Git Clone**: Build server clones the repository
4. **Build Execution**: Runs `npm install && npm run build`
5. **File Upload**: Built files are uploaded to S3 with proper structure
6. **Log Broadcasting**: Real-time logs are sent via Redis/WebSocket
7. **Deployment Ready**: Project is accessible via subdomain

## 🐳 Docker Configuration

The build server uses a custom Ubuntu-based image with:
- Ubuntu Focal (20.04)
- Node.js 20.x
- Git
- npm/npx

**Dockerfile highlights:**
```dockerfile
FROM ubuntu:focal
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs git
WORKDIR /home/app
COPY main.sh script.js package*.json ./
RUN npm install
ENTRYPOINT ["/home/app/main.sh"]
```

## 🔒 Security Considerations

- **Environment Variables**: Sensitive credentials are passed via ECS task overrides
- **Network Security**: ECS tasks run in private subnets with security groups
- **S3 Permissions**: Use IAM roles with minimal required permissions
- **Input Validation**: Git URLs and slugs are validated before processing
- **Error Handling**: Detailed errors are logged but sanitized in API responses

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
- **Symptom**: Build process exits with non-zero code
- **Solution**: Check that your project has valid `package.json` and build script

#### 2. ECS Task Failures
- **Symptom**: Tasks fail to start or exit immediately
- **Solution**: Verify ECS cluster configuration, subnet access, and security groups

#### 3. Redis Connection Issues
- **Symptom**: Logs not appearing in real-time
- **Solution**: Check Redis connection string and network access

#### 4. S3 Upload Failures
- **Symptom**: Files not appearing in deployed site
- **Solution**: Verify S3 permissions and bucket configuration

### Debugging Commands

```bash
# Check API server logs
node api-server/index.js

# Test deployment API
node api-server/test-deployment.js

# Check ECS task status
aws ecs list-tasks --cluster your-cluster-name

# View build server logs
aws logs get-log-events --log-group /ecs/builder-task
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review AWS ECS and S3 documentation for infrastructure issues

---

**EzDeploy** - Making web deployment as easy as a single API call! 🚀