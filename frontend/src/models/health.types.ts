export interface DatabaseHealth {
  status: "connected" | "disconnected" | "unexpected_result";
  engine: string;
  database_url_host: string;
  error?: string | null;
}

export interface HealthResponse {
  status: "healthy" | "degraded";
  project_name: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseHealth;
}
