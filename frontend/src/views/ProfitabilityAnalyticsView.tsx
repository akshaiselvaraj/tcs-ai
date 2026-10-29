import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, RefreshCw, BarChart3 } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const ProfitabilityAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfitabilityData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<APIResponse<any>>("/analytics/profitability");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitabilityData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Canteen Profitability & Financial Contribution Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time financial performance: Revenue, preparation costs, and contribution margin per dish
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProfitabilityData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Financials</span>
        </button>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Revenue</span>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {data ? `₹${data.total_gross_revenue?.toLocaleString()}` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Total dish sales volume</p>
        </div>

        {/* Preparation Cost */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preparation Cost</span>
            <BarChart3 className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {data ? `₹${data.total_preparation_cost?.toLocaleString()}` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Ingredients and culinary overhead</p>
        </div>

        {/* Contribution Margin % */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Contribution Margin</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {data ? `${data.overall_profit_margin_pct}%` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Average profitability ratio</p>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Net Profit</span>
            <DollarSign className="h-5 w-5 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-teal-700 mt-2">
            {data ? `₹${data.net_profit?.toLocaleString()}` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Sales revenue minus dish prep cost</p>
        </div>
      </div>

      {/* Top High-Margin Dishes Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Most Profitable Menu Offerings</h3>
            <p className="text-xs text-slate-500">Dishes generating the highest gross contribution margins</p>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Live Supabase Analytics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Dish Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Selling Price</th>
                <th className="px-6 py-3">Prep Cost</th>
                <th className="px-6 py-3">Unit Margin %</th>
                <th className="px-6 py-3">Portions Sold</th>
                <th className="px-6 py-3">Total Profit Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!data?.top_profitable_dishes ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Loading profitability data...
                  </td>
                </tr>
              ) : (
                data.top_profitable_dishes.map((dish: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{dish.item_name}</td>
                    <td className="px-6 py-3.5">{dish.category}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">₹{dish.price}</td>
                    <td className="px-6 py-3.5 text-slate-500">₹{dish.cost}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">{dish.margin_pct}%</td>
                    <td className="px-6 py-3.5 font-mono">{dish.portions_sold?.toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900 font-mono">
                      ₹{dish.total_profit_rs?.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
