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

EzDeploy consists of four main components:

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

### 3. Web Client (`client/`)
A modern Next.js frontend application that provides a user interface for managing deployments.

**Technology Stack:**
- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS v4 with responsive design
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth for secure user management
- **Real-time**: Socket.IO client for live build monitoring
- **Icons**: Lucide React for consistent iconography

**Key Features:**
- Modern, responsive user interface
- Real-time deployment monitoring with WebSocket integration
- Secure user authentication and session management
- Database-driven deployment tracking and analytics
- Interactive deployment form with validation
- Live build logs and status updates

**Pages & Components:**
- **Landing Page**: Modern hero section with features showcase and call-to-action
- **Deploy Page**: Interactive deployment form with real-time build monitoring
- **Authentication**: Secure sign-in/sign-up with Better Auth integration
- **Documentation**: Comprehensive API and usage documentation
- **Dashboard**: Analytics and deployment management interface
- **Architecture View**: Interactive system architecture visualization

### 4. S3 Reverse Proxy (`s3-reverse-proxy/`)
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
- **PostgreSQL Database** (for user management and deployment tracking)
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

#### S3 Reverse Proxy Environment
```env
# Add any specific configuration for the proxy
PORT=8000
```

#### Web Client Environment (`.env.local`)
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ezdeploy

# Authentication
AUTH_SECRET=your-auth-secret-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_SOCKET_URL=http://localhost:9999
```

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

#### Web Client
```bash
cd client
npm install
# Set up environment variables
copy .env.example .env.local
# (Edit .env.local with your configuration)

# Set up database
npx drizzle-kit generate
npx drizzle-kit push
# Start development server
npm run dev
```

The web client will be available at http://localhost:3000

## 🚀 Usage

### Accessing the Application

1. **Web Interface**: Open http://localhost:3000 to access the EzDeploy dashboard
2. **API Server**: Available at http://localhost:9000 for direct API calls
3. **Deployed Projects**: Access via subdomain routing through the reverse proxy at http://project-name.localhost:8000

### Deploying a Project

Send a POST request to the API server, or use the web interface:

**Option 1: Web Interface**
1. Navigate to http://localhost:3000
2. Sign in or create an account
3. Use the deployment form to enter your Git repository URL
4. Monitor the build progress in real-time

**Option 2: Direct API Call**

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

**Option 1: Web Interface**
The web client provides a real-time dashboard for monitoring deployments:
- Navigate to the Deploy page after starting a deployment
- View live build logs with automatic scrolling
- See deployment status updates (queued, building, success, failed)
- Access deployment URLs directly from the interface

**Option 2: WebSocket Connection**
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

Use the provided test script or the web interface:

**Option 1: Web Interface**
1. Open http://localhost:3000
2. Navigate to the Deploy page
3. Enter a Git repository URL
4. Monitor the real-time build progress

**Option 2: Command Line Testing**

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
├── client/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   │   ├── components/   # React components
│   │   │   ├── deploy/       # Deployment page
│   │   │   ├── documentation/# Documentation page
│   │   │   └── signin/       # Authentication page
│   │   └── db/               # Database schema and migrations
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── next.config.ts        # Next.js configuration
│   ├── drizzle.config.ts     # Database configuration
│   └── README.md             # Frontend documentation
├── s3-reverse-proxy/
│   ├── index.js              # Proxy server
│   └── package.json          # Dependencies
└── README.md                 # This documentation
```

## 🔧 Configuration

### Database Setup

The web client requires a PostgreSQL database. Set up the database:

1. **Create PostgreSQL Database**:
```sql
CREATE DATABASE ezdeploy;
CREATE USER ezdeploy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ezdeploy TO ezdeploy_user;
```

2. **Configure Database URL**:
Update your `.env.local` file in the client directory:
```env
DATABASE_URL="postgresql://ezdeploy_user:your_password@localhost:5432/ezdeploy"
```

3. **Run Database Migrations**:
```bash
cd client
npx drizzle-kit generate
npx drizzle-kit push
```

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

#### Required for Web Client
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ezdeploy` |
| `AUTH_SECRET` | Authentication secret key | `your-32-character-secret-key` |
| `NEXT_PUBLIC_API_URL` | API server URL | `http://localhost:9000` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | `http://localhost:9999` |

#### Optional for API Server
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `9000` |
| `SOCKET_PORT` | WebSocket server port | `9999` |

#### Optional for Web Client
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Next.js development server port | `3000` |

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

#### 5. Database Connection Issues
- **Symptom**: Authentication or database errors in web client
- **Solution**: Verify PostgreSQL is running and DATABASE_URL is correct

#### 6. Frontend Build Issues
- **Symptom**: Next.js application fails to start or build
- **Solution**: Check Node.js version (18+) and run `npm install` in client directory

### Debugging Commands

```bash
# Check API server logs
node api-server/index.js

# Test deployment API
node api-server/test-deployment.js

# Check web client locally
cd client && npm run dev

# Check build status in ECS
aws ecs list-tasks --cluster your-cluster-name

# View build server logs
aws logs get-log-events --log-group /ecs/builder-task

# Check database connection
cd client && npx drizzle-kit studio
```

# View build server logs
aws logs get-log-events --log-group /ecs/builder-task

# Check database connection
cd client && npx drizzle-kit studio
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