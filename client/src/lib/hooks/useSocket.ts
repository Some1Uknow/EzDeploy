// hooks/useSocket.ts
import { useEffect, useRef, useCallback } from "react";
import { io as createIo, type Socket } from "socket.io-client";

let socket: Socket | null = null;

interface UseSocketProps {
  url: string;
  onLog?: (buildId: string, text: string) => void;
  onStatusChange?: (buildId: string, status: 'success' | 'error' | 'pending') => void;
}

export default function useSocket({ url, onLog, onStatusChange }: UseSocketProps) {
  // Stable refs to prevent unnecessary re-bindings
  const onLogRef = useRef(onLog);
  const onStatusChangeRef = useRef(onStatusChange);
  
  // Update refs without causing re-renders
  onLogRef.current = onLog;
  onStatusChangeRef.current = onStatusChange;
  // Memoized log handler to prevent recreation
  const handleLog = useCallback((buildId: string, text: string) => {
    // Validate buildId to prevent cross-contamination
    if (!buildId || typeof buildId !== 'string') {
      console.warn('Invalid buildId received:', buildId);
      return;
    }

    console.log(`[Socket] Log received for buildId: ${buildId}`, text);

    // Always call onLog if provided (for logging purposes)
    if (onLogRef.current) {
      onLogRef.current(buildId, text);
    }

    // Only trigger status change for important messages
    if (onStatusChangeRef.current) {
      let newStatus: 'success' | 'error' | 'pending' | null = null;
      
      if (text.includes("Done") || text.includes("deployed") || text.includes("Build completed")) {
        newStatus = "success";
      } else if (text.includes("failed") || text.includes("error") || text.includes("Error")) {
        newStatus = "error";
      } else if (text.includes("Building") || text.includes("Starting")) {
        newStatus = "pending";
      }

      if (newStatus) {
        console.log(`[Socket] Status change for buildId: ${buildId} -> ${newStatus}`);
        onStatusChangeRef.current(buildId, newStatus);
      }
    }
  }, []);
  useEffect(() => {
    // (Re)create socket if URL changes
    if (!socket || socket.io.opts.hostname !== new URL(url).hostname || socket.io.opts.port !== new URL(url).port) {
      socket?.disconnect();
      socket = createIo(url, { 
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const handleConnect = () => {
      console.log("Socket connected");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const handleError = (error: any) => {
      console.error("Socket error:", error);
    };

    // Attach event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("log", handleLog);
    socket.on("error", handleError);

    return () => {
      // Clean up event listeners
      socket?.off("connect", handleConnect);
      socket?.off("disconnect", handleDisconnect);
      socket?.off("log", handleLog);
      socket?.off("error", handleError);
    };
  }, [url, handleLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return socket;
}
