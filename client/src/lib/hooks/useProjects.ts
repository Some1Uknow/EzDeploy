import { useState, useEffect, useCallback } from "react";
import { api, Project, mapStatus, handleApiError } from "../api";

export interface UseProjectsOptions {
  userId?: string;
  autoFetch?: boolean;
}

export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (data: {
    gitURL: string;
    slug?: string;
    userId?: string;
    name?: string;
    description?: string;
  }) => Promise<{
    projectSlug: string;
    url: string;
    projectName: string;
  }>;
  updateProject: (
    id: string,
    data: {
      status?: string;
      deployUrl?: string;
      logMessage?: string;
    }
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjects = (
  options: UseProjectsOptions = {}
): UseProjectsReturn => {
  const { userId, autoFetch = true } = options;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAllProjects(userId);

      if (response.status === "success" && response.data) {
        setProjects(response.data);
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);
  const createProject = useCallback(
    async (data: {
      gitURL: string;
      slug?: string;
      userId?: string;
      name?: string;
      description?: string;
    }) => {
      const response = await api.createProject(data);
      if (response.status !== "queued" || !response.data) {
        throw new Error(
          response.message || response.error || "Failed to create project"
        );
      }

      // Refetch projects after creating
      await refetch();

      // Return the project data
      return {
        projectSlug: response.data.projectSlug,
        url: response.data.url,
        projectName: response.data.projectName,
      };
    },
    [refetch]
  );

  const updateProject = useCallback(
    async (
      id: string,
      data: {
        status?: string;
        deployUrl?: string;
        logMessage?: string;
      }
    ) => {
      const response = await api.updateProject(id, data);
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to update project");
      }
      // Update local state
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...response.data } : project
        )
      );
    },
    []
  );

  const deleteProject = useCallback(async (id: string) => {
    const response = await api.deleteProject(id);
    if (response.status !== "success") {
      throw new Error(response.message || "Failed to delete project");
    }
    // Remove from local state
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  return {
    projects,
    loading,
    error,
    refetch,
    createProject,
    updateProject,
    deleteProject,
  };
};

// Hook for a single project
export const useProject = (id: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.getProject(id);

      if (response.status === "success" && response.data) {
        setProject(response.data);
      } else {
        setError(response.message || "Failed to fetch project");
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    project,
    loading,
    error,
    refetch,
  };
};
