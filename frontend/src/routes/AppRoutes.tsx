import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardView } from "../views/DashboardView";
import { ForecastView } from "../views/ForecastView";
import { OptimizerView } from "../views/OptimizerView";
import { WeeklyPlannerView } from "../views/WeeklyPlannerView";
import { WasteAnalyticsView } from "../views/WasteAnalyticsView";
import { ProfitabilityAnalyticsView } from "../views/ProfitabilityAnalyticsView";
import { MenuItemsView } from "../views/MenuItemsView";
import { DataManagementView } from "../views/DataManagementView";
import { ModelPerformanceView } from "../views/ModelPerformanceView";
import { SettingsView } from "../views/SettingsView";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardView />} />
        <Route path="forecast" element={<ForecastView />} />
        <Route path="optimizer" element={<OptimizerView />} />
        <Route path="weekly-planner" element={<WeeklyPlannerView />} />
        <Route path="analytics/waste" element={<WasteAnalyticsView />} />
        <Route path="analytics/profitability" element={<ProfitabilityAnalyticsView />} />
        <Route path="menu-items" element={<MenuItemsView />} />
        <Route path="data" element={<DataManagementView />} />
        <Route path="model-performance" element={<ModelPerformanceView />} />
        <Route path="settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
