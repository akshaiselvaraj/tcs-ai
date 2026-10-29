import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Sliders,
  CalendarDays,
  Trash2,
  DollarSign,
  UtensilsCrossed,
  Database,
  Cpu,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Demand Forecast", path: "/forecast", icon: TrendingUp, badge: "AI" },
  { name: "Menu Mix Optimizer", path: "/optimizer", icon: Sliders, badge: "PuLP" },
  { name: "Weekly Menu Planner", path: "/weekly-planner", icon: CalendarDays },
  { name: "Waste Analytics", path: "/analytics/waste", icon: Trash2 },
  { name: "Profitability Analytics", path: "/analytics/profitability", icon: DollarSign },
  { name: "Menu Items", path: "/menu-items", icon: UtensilsCrossed },
  { name: "Historical Data", path: "/data", icon: Database },
  { name: "Model Performance", path: "/model-performance", icon: Cpu },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 border-r border-navy-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-navy-800 bg-navy-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">Canteen</span>
                <span className="text-lg font-bold tracking-tight text-emerald-400">IQ</span>
              </div>
              <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">
                Menu Mix Optimization
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                      : "text-slate-400 hover:bg-navy-800 hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4.5 w-4.5 transition-colors ${
                          isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-navy-800 text-slate-400 border border-slate-700/50"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isActive ? "text-emerald-400 translate-x-0.5" : "text-slate-600 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Footer info */}
        <div className="border-t border-navy-800 p-4 bg-navy-950/40">
          <div className="rounded-lg bg-navy-850 p-3 border border-navy-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">TCS Hackathon 2026</span>
              <span className="text-emerald-400 font-semibold">v1.0.0</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              PostgreSQL &bull; LightGBM &bull; PuLP
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
