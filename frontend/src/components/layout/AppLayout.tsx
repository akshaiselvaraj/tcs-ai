import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const pageTitles: Record<string, string> = {
  "/": "Executive Overview & KPIs",
  "/forecast": "Item-Level Demand Forecasting",
  "/optimizer": "Intelligent Menu Mix Optimizer",
  "/weekly-planner": "7-Day Weekly Menu Planner",
  "/analytics/waste": "Food Waste Reduction Analytics",
  "/analytics/profitability": "Profitability & Margin Analytics",
  "/menu-items": "Menu Item Catalog & Nutrition",
  "/data": "Historical Data & Ingestion",
  "/model-performance": "Model Performance & SHAP Explainability",
  "/settings": "Optimization & System Settings",
};

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || "CanteenIQ Decision Support";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onToggleMobile={() => setMobileOpen(!mobileOpen)} pageTitle={title} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
