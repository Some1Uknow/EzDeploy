"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Globe,
  GitBranch,
  MoreHorizontal,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import useSocket from "@/lib/hooks/useSocket";
import { api, Project, mapStatus, handleApiError } from "@/lib/api";
import { useProjects } from "@/lib/hooks/useProjects";
import { env } from "@/lib/config";

interface Deployment {
  id: string;
  projectName: string;
  gitUrl: string;
  status: "success" | "error" | "pending" | "queued";
  deploymentUrl: string;
  createdAt: string;
  duration: string;
  logs: string[];
}

interface DeploymentsDashboardProps {
  onNewDeployment: () => void;
  newDeployment?: {
    projectSlug: string;
    gitUrl: string;
    url: string;
  } | null;
}

export default function DeploymentsDashboard({
  onNewDeployment,
  newDeployment,
}: DeploymentsDashboardProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  
  // Use the projects hook for API management
  const { projects, loading, error, refetch } = useProjects();

  // Convert API projects to deployment format
  useEffect(() => {
    const formattedDeployments: Deployment[] = projects.map(
      (project: Project) => ({
        id: project.id,
        projectName: project.name,
        gitUrl: project.repoUrl,
        status: mapStatus(project.status),
        deploymentUrl: project.deployUrl || `http://${project.id}.localhost:8000`,
        createdAt: project.createdAt,
        duration: calculateDuration(project.createdAt, project.deployedAt || project.updatedAt),
        logs: project.logs.map((log, index) => 
          `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`
        ),
      })
    );
    setDeployments(formattedDeployments);
  }, [projects]);

  // Calculate duration between two dates
  const calculateDuration = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffInMs = end.getTime() - start.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ${diffInMinutes % 60}m`;
  };

  // Add new deployment when it's created
  useEffect(() => {
    if (newDeployment) {
      const deployment: Deployment = {
        id: newDeployment.projectSlug,
        projectName: newDeployment.projectSlug,
        gitUrl: newDeployment.gitUrl,
        status: "queued",
        deploymentUrl: newDeployment.url,
        createdAt: new Date().toISOString(),
        duration: "0s",
        logs: [
          `[${new Date().toLocaleTimeString()}] Deployment queued for ${
            newDeployment.projectSlug
          }`,
        ],
      };
      setDeployments((prev) => [deployment, ...prev]);
    }
  }, [newDeployment]);// Setup socket connection for real-time logs
  const socket = useSocket({
    url: env.SOCKET_URL,
    onLog: (message: string) => {
      console.log("Received log:", message);

      // Update logs for the most recent deployment (the one that's building)
      setDeployments((prev) =>
        prev.map((deployment) => {
          if (
            deployment.status === "queued" ||
            deployment.status === "pending"
          ) {
            return {
              ...deployment,
              status: "pending",
              logs: [
                ...deployment.logs,
                `[${new Date().toLocaleTimeString()}] ${message}`,
              ],
            };
          }
          return deployment;
        })
      );      // Also refetch projects to get updated status from backend
      if (message.includes("deployed") || message.includes("failed")) {
        setTimeout(() => refetch(), 2000);
      }
    },
  });

  // Subscribe to logs channel when there's an active deployment
  useEffect(() => {
    if (socket && newDeployment) {
      // This is the correct channel format to match what the server is emitting on
      const channel = `logs:${newDeployment.projectSlug}`;
      console.log(`Subscribing to channel: ${channel}`);
      socket.emit("subscribe", channel);
    }
  }, [socket, newDeployment]);

  const toggleLogs = (deploymentId: string) => {
    setExpandedLogs(expandedLogs === deploymentId ? null : deploymentId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const extractRepoName = (gitUrl: string) => {
    const match = gitUrl.match(/\/([^\/]+)(?:\.git)?$/);
    return match ? match[1] : gitUrl;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Loading deployments...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Error loading deployments
        </h3>
        <p className="text-red-600 mb-6 max-w-sm mx-auto">
          {error}
        </p>        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No deployments yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Get started by deploying your first project from a Git repository.
        </p>
        <button
          onClick={onNewDeployment}
          className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
        >
          Create First Deployment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deployments.map((deployment) => (
        <div
          key={deployment.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {" "}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {deployment.projectName}
                </h3>
                <StatusBadge
                  status={deployment.status}
                  text={
                    deployment.status === "success"
                      ? "Ready"
                      : deployment.status === "queued"
                      ? "Queued"
                      : deployment.status === "pending"
                      ? "Building"
                      : deployment.status.charAt(0).toUpperCase() +
                        deployment.status.slice(1)
                  }
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="truncate max-w-48">
                    {extractRepoName(deployment.gitUrl)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(deployment.createdAt)}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span>•</span>
                  <span>{deployment.duration}</span>
                </div>
              </div>
            </div>{" "}
            <div className="flex items-center gap-2 ml-4">
              {deployment.status === "success" && (
                <a
                  href={deployment.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </a>
              )}

              {/* Logs dropdown button */}
              {deployment.logs.length > 0 && (
                <button
                  onClick={() => toggleLogs(deployment.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  {expandedLogs === deployment.id ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  Logs
                </button>
              )}

              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs section */}
          {expandedLogs === deployment.id && deployment.logs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                {deployment.logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-green-400 font-mono text-xs mb-1"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
