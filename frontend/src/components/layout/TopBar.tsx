import React from "react";
import { Menu, RefreshCw, Database, Server, Clock } from "lucide-react";
import { useHealthController } from "../../controllers/useHealthController";

interface TopBarProps {
  onToggleMobile: () => void;
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobile, pageTitle }) => {
  const { health, loading, error, refreshHealth, isConnected, isDegraded } = useHealthController(30000);

  // Determine current meal period based on local hour
  const currentHour = new Date().getHours();
  const mealPeriod =
    currentHour >= 6 && currentHour < 11
      ? "Breakfast Window"
      : currentHour >= 11 && currentHour < 16
      ? "Lunch Window"
      : "Dinner Window";

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-xs">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span>&bull;</span>
            <span className="font-medium text-emerald-600">{mealPeriod}</span>
          </div>
        </div>
      </div>

      {/* Right: Live Health Badges & Actions */}
      <div className="flex items-center gap-3">
        {/* Backend / PostgreSQL Status Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-xs transition-colors bg-slate-50">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
              <span>Verifying Services...</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>PostgreSQL Connected</span>
            </div>
          ) : isDegraded ? (
            <div
              className="flex items-center gap-2 text-amber-700"
              title={health?.database?.error || "PostgreSQL server not detected on configured port"}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <Server className="h-3.5 w-3.5 text-amber-600" />
              <span>API Up &bull; Waiting for DB</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-700" title={error || "Cannot reach backend"}>
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Backend Disconnected</span>
            </div>
          )}
        </div>

        {/* Refresh health check button */}
        <button
          type="button"
          onClick={() => refreshHealth()}
          title="Refresh system status"
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </div>
    </header>
  );
};
