import { useState, useCallback, useRef, useEffect } from "react";

interface LogEntry {
  timestamp: string;
  message: string;
}

interface DeploymentLogs {
  [deploymentId: string]: LogEntry[];
}

export const useDeploymentLogs = () => {
  const [logs, setLogs] = useState<DeploymentLogs>({});
  const logsRef = useRef<DeploymentLogs>({});

  // Update ref when state changes
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);
  const addLog = useCallback((deploymentId: string, message: string) => {
    // Validate inputs to prevent cross-contamination
    if (!deploymentId || typeof deploymentId !== "string") {
      console.warn("Invalid deploymentId for addLog:", deploymentId);
      return;
    }

    if (!message || typeof message !== "string") {
      console.warn("Invalid message for addLog:", message);
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const newLog: LogEntry = { timestamp, message };

    console.log(`[DeploymentLogs] Adding log for deployment: ${deploymentId}`);

    setLogs((prevLogs) => {
      const currentLogs = prevLogs[deploymentId] || [];
      const updatedLogs = [...currentLogs, newLog];

      return {
        ...prevLogs,
        [deploymentId]: updatedLogs,
      };
    });
  }, []);

  const getLogsForDeployment = useCallback((deploymentId: string): string[] => {
    const deploymentLogs = logsRef.current[deploymentId] || [];
    return deploymentLogs.map((log) => `[${log.timestamp}] ${log.message}`);
  }, []);

  const clearLogs = useCallback((deploymentId: string) => {
    setLogs((prevLogs) => {
      const { [deploymentId]: removed, ...rest } = prevLogs;
      return rest;
    });
  }, []);

  const clearAllLogs = useCallback(() => {
    setLogs({});
  }, []);

  return {
    addLog,
    getLogsForDeployment,
    clearLogs,
    clearAllLogs,
    allLogs: logs,
  };
};
