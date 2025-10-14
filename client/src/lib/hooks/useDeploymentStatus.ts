import { useState, useCallback, useRef } from 'react';

interface DeploymentStatus {
  [deploymentId: string]: 'success' | 'error' | 'pending' | 'queued';
}

export const useDeploymentStatus = () => {
  const [statuses, setStatuses] = useState<DeploymentStatus>({});
  const statusesRef = useRef<DeploymentStatus>({});

  // Update ref when state changes
  statusesRef.current = statuses;

  const updateStatus = useCallback((deploymentId: string, status: 'success' | 'error' | 'pending' | 'queued') => {
    const currentStatus = statusesRef.current[deploymentId];
    
    // Only update if status actually changed
    if (currentStatus !== status) {
      setStatuses(prevStatuses => ({
        ...prevStatuses,
        [deploymentId]: status,
      }));
      
      return true; // Status changed
    }
    
    return false; // Status didn't change
  }, []);

  const getStatus = useCallback((deploymentId: string): 'success' | 'error' | 'pending' | 'queued' | undefined => {
    return statusesRef.current[deploymentId];
  }, []);

  const removeStatus = useCallback((deploymentId: string) => {
    setStatuses(prevStatuses => {
      const { [deploymentId]: removed, ...rest } = prevStatuses;
      return rest;
    });
  }, []);

  const clearAllStatuses = useCallback(() => {
    setStatuses({});
  }, []);

  return {
    updateStatus,
    getStatus,
    removeStatus,
    clearAllStatuses,
    allStatuses: statuses,
  };
};
