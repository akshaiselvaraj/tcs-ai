import React from "react";
import { Menu, RefreshCw, Clock } from "lucide-react";
import { useHealthController } from "../../controllers/useHealthController";

interface TopBarProps {
  onToggleMobile: () => void;
  pageTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobile, pageTitle }) => {
  const { loading, error, refreshHealth, isConnected } = useHealthController(30000);

  const currentHour = new Date().getHours();
  const mealPeriod =
    currentHour >= 6 && currentHour < 11
      ? "Breakfast Window"
      : currentHour >= 11 && currentHour < 16
      ? "Lunch Window"
      : "Dinner Window";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="h-3 w-3 text-slate-400" />
              {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span>&bull;</span>
            <span className="text-[11px] font-medium text-slate-600">{mealPeriod}</span>
          </div>
        </div>
      </div>

      {/* Right: Clean Live Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs bg-slate-50 text-slate-700">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-emerald-500" : error ? "bg-rose-500" : "bg-amber-500"
            }`}
          />
          <span className="text-[11px] font-medium">
            {isConnected ? "Cloud DB Online" : error ? "Offline" : "Connecting..."}
          </span>
        </div>

        <button
          type="button"
          onClick={() => refreshHealth()}
          title="Refresh connection"
          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>
    </header>
  );
};
