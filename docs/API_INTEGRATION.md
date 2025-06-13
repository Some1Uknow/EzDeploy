# API Integration Documentation

This document explains how the frontend connects to the backend API services.

## Architecture Overview

The frontend connects to two main backend services:

1. **API Server** (`http://localhost:9000`) - Handles HTTP requests for project management
2. **Socket Server** (`http://localhost:9999`) - Handles real-time log streaming via WebSocket

## API Endpoints

### Projects API

- `GET /health` - Health check endpoint
- `GET /projects` - Get all projects (optional `userId` query parameter)
- `POST /project` - Create a new project
- `GET /project/:id` - Get a specific project
- `PUT /project/:id` - Update project status/logs
- `DELETE /project/:id` - Delete a project

### Socket Events

- `subscribe` - Subscribe to logs for a specific project
- `logs:${projectId}` - Receive real-time log messages

## Frontend Structure

### API Layer (`/lib/api.ts`)
- Centralized API calls
- Type-safe interfaces
- Error handling utilities
- Status mapping functions

### Hooks (`/lib/hooks/`)
- `useProjects.ts` - Manages project state and API operations
- `useSocket.ts` - Handles WebSocket connections and real-time updates

### Configuration (`/lib/config.ts`)
- Environment variables
- API endpoints
- Default configuration values

## Components

### DeployForm
- Handles project creation
- Integrates with GitHub repositories
- Validates input and handles errors

### DeploymentsDashboard
- Displays all projects
- Real-time log updates via WebSocket
- Fetches data from API on load

### ConnectionStatus
- Shows API connection status
- Periodic health checks
- Visual feedback for connectivity

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_SOCKET_URL=http://localhost:9999
NODE_ENV=development
```

## Usage Examples

### Creating a Project
```typescript
import { api } from '@/lib/api';

const response = await api.createProject({
  gitURL: 'https://github.com/user/repo.git',
  slug: 'my-project',
  name: 'My Project'
});
```

### Using the Projects Hook
```typescript
import { useProjects } from '@/lib/hooks/useProjects';

function MyComponent() {
  const { projects, loading, error, refetch } = useProjects();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## Error Handling

All API calls include proper error handling:
- Network errors are caught and displayed
- HTTP errors are parsed and shown to users
- WebSocket connection issues trigger reconnection attempts

## Real-time Updates

The application uses WebSocket connections for real-time log streaming:
- Connects to the socket server on component mount
- Subscribes to project-specific log channels
- Updates UI immediately when logs are received
- Handles connection drops and reconnections

## Development

1. Start the API server: `cd api-server && npm start`
2. Start the Socket server: `cd socket-server && npm start` (if separate)
3. Start the frontend: `cd client && npm run dev`

The frontend will automatically connect to the backend services using the configured URLs.
