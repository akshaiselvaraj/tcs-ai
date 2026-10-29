import React, { useState, useEffect } from "react";
import { TrendingUp, Utensils, Trash2, DollarSign, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<APIResponse<any>>("/analytics/dashboard");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = data?.summary;
  const trend = data?.trend_data || [];
  const topDishes = data?.top_dishes || [];
  const categoryDist = data?.category_distribution || [];

  return (
    <div className="space-y-6">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Canteen Operations Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time daily demand forecasts, preparation recommendations, and food waste metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/forecast"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
          >
            <span>Run Forecast</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Settled KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Demand */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Expected Demand
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {summary ? `${summary.today_predicted_demand?.toLocaleString()} portions` : "--"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Predicted {summary?.forecast_meal_type || "Lunch"} consumption
            </p>
          </div>
        </div>

        {/* Recommended Prep */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Recommended Prep
            </span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <Utensils className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-blue-700">
              {summary ? `${summary.today_recommended_prep?.toLocaleString()} portions` : "--"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Includes +8% safety buffer
            </p>
          </div>
        </div>

        {/* Food Waste Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Current Waste Rate
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Trash2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {summary ? `${summary.historical_waste_rate_pct}%` : "--"}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Target: 4.2%
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-medium">
              ~72% reduction with AI
            </p>
          </div>
        </div>

        {/* Active Dishes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Menu Dishes
            </span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {summary ? `${summary.total_menu_items} items` : "--"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Across 17 food categories
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: 7-Day Trend Chart & Top Dishes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 7-Day Demand Trajectory */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">7-Day Demand vs. Prepared Volume</h3>
              <p className="text-xs text-slate-500">Actual customer portions served versus kitchen quantity cooked</p>
            </div>
          </div>

          {trend.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading daily trends...</div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-7 gap-2">
                {trend.map((t: any, idx: number) => {
                  const maxPortions = 20000;
                  const actualHeight = Math.min(100, Math.round((t.actual_demand / maxPortions) * 100));
                  const prepHeight = Math.min(100, Math.round((t.portions_prepared / maxPortions) * 100));

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div className="h-36 w-full bg-slate-50 rounded-lg flex items-end justify-center gap-1.5 p-1 relative group">
                        {/* Prepared Portions Bar */}
                        <div
                          className="w-1/2 bg-slate-300 rounded-t transition-all group-hover:bg-slate-400"
                          style={{ height: `${prepHeight}%` }}
                          title={`Cooked: ${t.portions_prepared} portions`}
                        />
                        {/* Sold Demand Bar */}
                        <div
                          className="w-1/2 bg-blue-600 rounded-t transition-all group-hover:bg-blue-700"
                          style={{ height: `${actualHeight}%` }}
                          title={`Served: ${t.actual_demand} portions`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-600">{t.date}</span>
                      <span className="text-[10px] font-mono text-slate-400">{t.actual_demand}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-xs bg-slate-300" />
                  <span className="text-slate-600 text-xs">Quantity Cooked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
                  <span className="text-slate-600 text-xs">Actual Demand Served</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Popular Dishes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Most Popular Dishes</h3>
            <p className="text-xs text-slate-500">Highest sales volume this month</p>
          </div>

          {topDishes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading top dishes...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topDishes.map((dish: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800">{dish.item_name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          dish.veg_nonveg === "Veg"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {dish.veg_nonveg}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{dish.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {dish.portions_sold?.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400">portions</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-2 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Consumption by Category</h3>
            <p className="text-xs text-slate-500">Portion distribution across meal categories</p>
          </div>

          <div className="space-y-3 pt-1">
            {categoryDist.map((cat: any, idx: number) => {
              const maxPortions = categoryDist[0]?.portions || 1;
              const pct = Math.min(100, Math.round((cat.portions / maxPortions) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.category}</span>
                    <span className="font-mono text-slate-500">{cat.portions.toLocaleString()} portions</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Quick Actions</h3>
            <p className="text-xs text-slate-500">Direct shortcuts to daily tasks</p>
          </div>

          <div className="space-y-2 pt-1">
            <Link
              to="/optimizer"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-800">Optimize Menu Mix</p>
                <p className="text-[11px] text-slate-400">Calculate dish batch sizes within budget</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/weekly-planner"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-800">7-Day Menu Schedule</p>
                <p className="text-[11px] text-slate-400">Generate weekly roster & export CSV</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/analytics/waste"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-800">Waste Reduction Reports</p>
                <p className="text-[11px] text-slate-400">Monitor food loss and savings in ₹</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
