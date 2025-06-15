"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { useDeploymentLogs } from "@/lib/hooks/useDeploymentLogs";
import { api, Project, mapStatus, handleApiError } from "@/lib/api";
import { useProjects } from "@/lib/hooks/useProjects";
import { env } from "@/lib/config";

interface Deployment {
  id: string;
  projectName: string;
  gitUrl: string;
  status: "success" | "error" | "pending" | "queued";
  deploy_url: string;
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
  userId: string;
}

export default function DeploymentsDashboard({
  onNewDeployment,
  newDeployment,
  userId,
}: DeploymentsDashboardProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [lastRefetchTime, setLastRefetchTime] = useState<number>(0);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Separate logs management to prevent re-renders on log updates
  const { addLog, getLogsForDeployment, clearLogs } = useDeploymentLogs();

  // Track which deployments have real-time logs to prevent duplication
  const [deploymentsWithRealTimeLogs, setDeploymentsWithRealTimeLogs] = useState<Set<string>>(new Set());
  const deploymentsWithRealTimeLogsRef = useRef<Set<string>>(new Set());
  // Use the projects hook for API management
  const { projects, loading, error, refetch } = useProjects({ userId });

  // Smart merge function to maintain order and prevent duplication
  const mergeDeployments = useCallback((
    apiDeployments: Deployment[], 
    currentDeployments: Deployment[]
  ): Deployment[] => {
    // Create a map of current deployments for quick lookup
    const currentMap = new Map(currentDeployments.map(d => [d.id, d]));
    
    // Merge API data with current state, preserving real-time updates
    const merged = apiDeployments.map(apiDeployment => {
      const current = currentMap.get(apiDeployment.id);
      
      if (current) {
        // Keep current status if it's more recent or real-time
        const shouldKeepCurrentStatus = 
          (current.status === 'pending' && apiDeployment.status === 'queued') ||
          deploymentsWithRealTimeLogsRef.current.has(apiDeployment.id);
          
        return {
          ...apiDeployment,
          status: shouldKeepCurrentStatus ? current.status : apiDeployment.status,
          logs: deploymentsWithRealTimeLogsRef.current.has(apiDeployment.id) 
            ? [] // Clear API logs if we have real-time logs
            : apiDeployment.logs,
        };
      }
      
      return apiDeployment;
    });
    
    // Sort by creation date to maintain consistent order
    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);// Convert API projects to deployment format

  useEffect(() => {
    const formattedDeployments: Deployment[] = projects.map(
      (project: Project) => ({
        id: project.id,
        projectName: project.name,
        gitUrl: project.repoUrl,
        status: mapStatus(project.status),
        deploy_url: project.deploy_url || `http://${project.id}.localhost:8000`,
        createdAt: project.createdAt,
        duration: calculateDuration(
          project.createdAt,
          project.deployedAt || project.updatedAt
        ),
        logs: project.logs.map(
          (log, index) =>
            `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`
        ),
      })
    );
    
    // Use smart merge to maintain order and prevent issues
    const mergedDeployments = mergeDeployments(formattedDeployments, deployments);
    setDeployments(mergedDeployments);
    
    // Clean up logs for deployments that are completed
    const completedIds = Array.from(deploymentsWithRealTimeLogsRef.current).filter(id => {
      const deployment = formattedDeployments.find(d => d.id === id);
      return deployment && (deployment.status === 'success' || deployment.status === 'error');
    });
    
    // Clear logs for completed deployments after a delay
    completedIds.forEach(id => {
      setTimeout(() => {
        clearLogs(id);
        setDeploymentsWithRealTimeLogs(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          deploymentsWithRealTimeLogsRef.current = newSet;
          return newSet;
        });
      }, 30000);
    });
  }, [projects, clearLogs, mergeDeployments]);

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
        deploy_url: newDeployment.url,
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
  }, [newDeployment]);  // Setup socket connection for real-time logs
  const socket = useSocket({
    url: env.SOCKET_URL,
    onLog: (buildId, text) => {
      console.log(`[Dashboard] Received log for buildId: ${buildId}`, text);
      
      // Mark this deployment as having real-time logs
      setDeploymentsWithRealTimeLogs(prev => {
        const newSet = new Set(prev);
        newSet.add(buildId);
        deploymentsWithRealTimeLogsRef.current = newSet;
        return newSet;
      });
      
      // Add log to separate logs state (doesn't trigger deployment re-render)
      addLog(buildId, text);
    },
    onStatusChange: (buildId, status) => {
      console.log(`[Dashboard] Status change for buildId: ${buildId} -> ${status}`);
      
      // Update deployment status without changing order or logs
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== buildId) return d;
          console.log(`[Dashboard] Updating status for deployment ${d.id}: ${d.status} -> ${status}`);
          return {
            ...d,
            status: status,
          };
        })
      );
      
      // Only trigger refetch for final states, but with debouncing to prevent rapid refetches
      if (status === "success" || status === "error") {
        console.log(`[Dashboard] Final status reached for ${buildId}, triggering refetch:`, status);
        debouncedRefetch();
      }
    },
  });  // Subscribe to logs channel when there's an active deployment
  useEffect(() => {
    if (!socket) return;

    const activeDeployments = deployments.filter(
      (d) => d.status === "queued" || d.status === "pending"
    );

    // Keep track of currently subscribed channels
    const currentChannels = activeDeployments.map(d => `logs:${d.id}`);
    
    console.log(`[Dashboard] Managing subscriptions for channels:`, currentChannels);

    // Subscribe to channels for active deployments
    activeDeployments.forEach((d) => {
      const channel = `logs:${d.id}`;
      console.log("Subscribing to channel:", channel);
      socket.emit("subscribe", channel);
    });

    // Cleanup function to unsubscribe when deployments change
    return () => {
      activeDeployments.forEach((d) => {
        const channel = `logs:${d.id}`;
        console.log("Unsubscribing from channel:", channel);
        socket.emit("unsubscribe", channel);
      });
    };
  }, [socket, deployments.filter(d => d.status === "queued" || d.status === "pending").map(d => d.id).sort().join(',')]);
  // ^ Use sorted IDs string to prevent unnecessary re-subscriptions due to order changes
  // Periodically refetch if there are pending deployments
  useEffect(() => {
    const pendingDeployments = deployments.filter(
      (d) => d.status === "queued" || d.status === "pending"
    );
    
    let intervalId: NodeJS.Timeout | null = null;
    
    if (pendingDeployments.length > 0) {
      // Refetch every 30 seconds if there are pending deployments (reduced frequency)
      intervalId = setInterval(() => {
        console.log("Auto-refetching due to pending deployments:", pendingDeployments.length);
        refetch();
      }, 30000); // Increased interval to reduce server load
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [deployments.filter(d => d.status === "queued" || d.status === "pending").length, refetch]);

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
  // Debounced refetch function to prevent excessive API calls
  const debouncedRefetch = useCallback(() => {
    // Clear any existing timeout
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }

    // Only refetch if at least 5 seconds have passed since the last refetch (increased delay)
    const now = Date.now();
    if (now - lastRefetchTime > 5000) {
      console.log('[Dashboard] Executing immediate refetch');
      refetch();
      setLastRefetchTime(now);
    } else {
      // Schedule a refetch after the debounce period
      const delay = 5000 - (now - lastRefetchTime);
      console.log(`[Dashboard] Scheduling refetch in ${delay}ms`);
      refetchTimeoutRef.current = setTimeout(() => {
        console.log('[Dashboard] Executing scheduled refetch');
        refetch();
        setLastRefetchTime(Date.now());
      }, delay);
    }
  }, [lastRefetchTime, refetch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, [refetchTimeoutRef]);
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
        <p className="text-red-600 mb-6 max-w-sm mx-auto">{error}</p>{" "}
        <button
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
                  {deployment.id}
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
                  href={deployment.deploy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </a>
              )}              {/* Logs dropdown button */}
              {(deployment.logs.length > 0 || getLogsForDeployment(deployment.id).length > 0) && (
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
          </div>          {/* Logs section */}
          {expandedLogs === deployment.id && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                {/* Render original logs first */}
                {deployment.logs.map((log, index) => (
                  <div
                    key={`original-${index}`}
                    className="text-green-400 font-mono text-xs mb-1"
                  >
                    {log}
                  </div>
                ))}
                {/* Render real-time logs */}
                {getLogsForDeployment(deployment.id).map((log, index) => (
                  <div
                    key={`realtime-${index}`}
                    className="text-green-400 font-mono text-xs mb-1"
                  >
                    {log}
                  </div>
                ))}
                {/* Show message if no logs */}
                {deployment.logs.length === 0 && getLogsForDeployment(deployment.id).length === 0 && (
                  <div className="text-gray-400 font-mono text-xs">
                    No logs available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
