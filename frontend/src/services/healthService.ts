import { apiClient } from "./apiClient";
import type { HealthResponse } from "../models/health.types";

export const healthService = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>("/health");
    return response.data;
  },
};
