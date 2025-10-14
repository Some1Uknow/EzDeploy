import { env, endpoints } from './config';

const API_BASE_URL = env.API_BASE_URL;

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  repoUrl: string;
  status: "queued" | "building" | "deployed" | "failed";
  deploy_url?: string;
  createdAt: string;
  updatedAt?: string;
  deployedAt?: string;
  logs: Array<{
    timestamp: string;
    message: string;
  }>;
}

export interface CreateProjectRequest {
  gitURL: string;
  slug?: string;
  userId?: string;
  name?: string;
  description?: string;
}

export interface CreateProjectResponse {
  status: "queued" | "error";
  data?: {
    projectId: string;
    projectSlug: string;
    projectName: string;
    url: string;
    repoUrl: string;
    status: string;
    createdAt: string;
  };
  message?: string;
  error?: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  error?: string;
}

// API Functions
export const api = {  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}${endpoints.health}`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new project
  async createProject(data: CreateProjectRequest): Promise<CreateProjectResponse> {
    const response = await fetch(`${API_BASE_URL}${endpoints.project}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }

    return response.json();
  },

  // Get all projects
  async getAllProjects(userId?: string): Promise<ApiResponse<Project[]>> {
    const url = new URL(`${API_BASE_URL}${endpoints.projects}`);
    if (userId) {
      url.searchParams.append("userId", userId);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    return response.json();
  },

  // Get a specific project
  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}${endpoints.project}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return response.json();
  },

  // Update project status
  async updateProject(
    id: string,
    data: {
      status?: string;
      deployUrl?: string;
      logMessage?: string;
    }
  ): Promise<ApiResponse<Project>> {
    const response = await fetch(`${API_BASE_URL}${endpoints.project}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a project
  async deleteProject(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}${endpoints.project}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }

    return response.json();
  },
};

// Utility function to handle API errors
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Status mapping utility
export const mapStatus = (status: string): "success" | "error" | "pending" | "queued" => {
  switch (status) {
    case "deployed":
      return "success";
    case "failed":
      return "error";
    case "building":
      return "pending";
    case "queued":
      return "queued";
    default:
      return "pending";
  }
};
