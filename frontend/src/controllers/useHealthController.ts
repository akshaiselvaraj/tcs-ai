import { useState, useEffect, useCallback } from "react";
import { healthService } from "../services/healthService";
import type { HealthResponse } from "../models/health.types";

export function useHealthController(pollIntervalMs: number = 30000) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthService.checkHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchHealth, pollIntervalMs]);

  return {
    health,
    loading,
    error,
    refreshHealth: fetchHealth,
    isConnected: health?.status === "healthy" && health?.database?.status === "connected",
    isDegraded: health?.status === "degraded" || health?.database?.status === "disconnected",
  };
}
