import React, { useState, useEffect } from "react";
import { Trash2, TrendingDown, DollarSign, PieChart, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const WasteAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWasteData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<APIResponse<any>>("/analytics/waste");
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
    fetchWasteData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-rose-500" />
            <span>Canteen Food Waste & Environmental Impact Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Evaluating historical overproduction waste versus AI mathematical optimization savings
          </p>
        </div>

        <button
          type="button"
          onClick={fetchWasteData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 4 Waste KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Baseline Waste % */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Historical Waste Rate</span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {data ? `${data.baseline_waste_rate_pct}%` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Average mess overproduction surplus</p>
        </div>

        {/* AI Target Waste % */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">AI Target Waste Rate</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {data ? `${data.ai_waste_rate_pct}%` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Under PuLP optimized portion caps</p>
        </div>

        {/* Waste Reduction Achieved */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Simulated Reduction</span>
            <TrendingDown className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">
            {data ? `-${data.waste_reduction_pct}%` : "--"}
          </h3>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Algorithmic waste decrease</p>
        </div>

        {/* Financial Loss Prevented */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Loss Prevented</span>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {data ? `₹${data.financial_loss_prevented_rs?.toLocaleString()}` : "--"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Ingredients saved from disposal</p>
        </div>
      </div>

      {/* Main Grid: Category Waste & Top Wasted Dishes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Waste by Food Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-600" />
                <span>Food Waste Cost by Category</span>
              </h3>
              <p className="text-xs text-slate-500">Financial loss distribution across mess categories</p>
            </div>
          </div>

          {!data?.waste_by_category ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading category waste data...</div>
          ) : (
            <div className="space-y-3 pt-2">
              {data.waste_by_category.map((cat: any, idx: number) => {
                const maxCost = data.waste_by_category[0]?.waste_cost_rs || 1;
                const pct = Math.min(100, Math.round((cat.waste_cost_rs / maxCost) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.category}</span>
                      <span className="font-mono text-slate-600">
                        ₹{cat.waste_cost_rs?.toLocaleString()} ({cat.wasted_portions?.toLocaleString()} portions)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 Most Wasted Dishes */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm">Dishes with Highest Preparation Waste</h3>
            <p className="text-xs text-slate-500">Candidate items for portion reduction in PuLP optimizer</p>
          </div>

          {!data?.top_wasted_dishes ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading top wasted items...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.top_wasted_dishes.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.item_name}</h4>
                    <p className="text-[11px] text-slate-400">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 font-mono">
                      ₹{item.financial_loss_rs?.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.portions_wasted?.toLocaleString()} portions unserved
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
