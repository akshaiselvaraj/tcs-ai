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
  ChefHat,
} from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Demand Forecast", path: "/forecast", icon: TrendingUp },
  { name: "Menu Optimizer", path: "/optimizer", icon: Sliders },
  { name: "Weekly Planner", path: "/weekly-planner", icon: CalendarDays },
  { name: "Food Waste", path: "/analytics/waste", icon: Trash2 },
  { name: "Profit & Revenue", path: "/analytics/profitability", icon: DollarSign },
  { name: "Menu Catalog", path: "/menu-items", icon: UtensilsCrossed },
  { name: "Historical Data", path: "/data", icon: Database },
  { name: "AI Models", path: "/model-performance", icon: Cpu },
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Canteen</span>
              <span className="text-base font-bold text-blue-600 tracking-tight">IQ</span>
              <p className="text-[10px] text-slate-400 font-medium">Kitchen Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            Menu
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
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User / Workspace Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              M
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">Mess Manager</p>
              <p className="text-[10px] text-slate-400 truncate">Campus Canteen</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
