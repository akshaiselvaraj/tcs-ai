import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { apiClient, API_BASE_URL } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const WeeklyPlannerView: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [dailyBudget, setDailyBudget] = useState<number>(80000);
  const [cooldownDays, setCooldownDays] = useState<number>(2);

  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<APIResponse<any>>("/weekly-menu/latest");
      if (res.data.success && res.data.data) {
        setPlan(res.data.data);
      }
    } catch (err: any) {
      console.warn("No active plan:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPlan();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await apiClient.post<APIResponse<any>>("/weekly-menu/generate", {
        start_date: startDate,
        daily_budget_limit: dailyBudget,
        repetition_cooldown_days: cooldownDays,
      });
      if (res.data.success) {
        setPlan(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate weekly plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE_URL}/weekly-menu/export-csv`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">7-Day Weekly Menu Schedule</h2>
            {plan && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                {plan.status}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakfast, Lunch, and Dinner with MILP Portion Sizing & Repetition Cooldown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-500">Starts:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent font-medium focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50">
            <span className="text-slate-500">Budget:</span>
            <input
              type="number"
              step="5000"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(parseFloat(e.target.value) || 0)}
              className="w-20 bg-transparent font-medium focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50">
            <span className="text-slate-500">Cooldown:</span>
            <input
              type="number"
              min="0"
              max="5"
              value={cooldownDays}
              onChange={(e) => setCooldownDays(parseInt(e.target.value) || 0)}
              className="w-10 bg-transparent font-medium focus:outline-hidden"
            />
            <span className="text-slate-400">days</span>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!plan}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Generating Plan..." : "Generate Weekly Schedule"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Financial Summary Strip */}
      {plan && plan.financial_summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Prep Cost</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              ₹{plan.financial_summary.total_estimated_cost?.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500">All 21 meal batches</span>
          </div>

          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Expected Revenue</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              ₹{plan.financial_summary.total_estimated_revenue?.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500">Student portion consumption</span>
          </div>

          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Net Profit</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">
              ₹{plan.financial_summary.total_estimated_profit?.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">Margin after ingredients</span>
          </div>

          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Repetition Cooldown</span>
            <p className="text-lg font-bold text-teal-700 mt-0.5">
              {cooldownDays} Days Min
            </p>
            <span className="text-[10px] text-slate-400">Dietary variety guaranteed</span>
          </div>
        </div>
      )}

      {/* 7-Day Matrix Grid */}
      {loading && !plan ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm font-medium text-slate-600">Loading weekly menu schedule from Supabase...</p>
        </div>
      ) : !plan || !plan.schedule ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No Weekly Plan Generated Yet</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click <strong>"Generate 7-Day Plan (PuLP)"</strong> above to solve all 21 meal slots (Breakfast, Lunch, Dinner) with repetition cooldown rules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {plan.schedule.map((day: any) => (
            <div key={day.date} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">{day.day_name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{day.date}</span>
                </div>

                <div className="space-y-2.5 mt-2.5">
                  {/* Breakfast */}
                  <div className="rounded-lg bg-emerald-50/50 p-2 border border-emerald-100/70 space-y-1">
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">Breakfast</span>
                    {day.meals?.Breakfast?.length > 0 ? (
                      day.meals.Breakfast.map((dish: any) => (
                        <div key={dish.item_id} className="text-[11px] text-slate-800 flex justify-between items-center py-0.5 border-b border-emerald-100/30 last:border-0">
                          <span className="truncate pr-1 font-medium">{dish.item_name}</span>
                          <span className="text-[9px] font-mono text-emerald-700 flex-shrink-0">{dish.recommended_preparation}p</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No items</p>
                    )}
                  </div>

                  {/* Lunch */}
                  <div className="rounded-lg bg-teal-50/50 p-2 border border-teal-100/70 space-y-1">
                    <span className="text-[9px] font-bold text-teal-700 uppercase tracking-wider block">Lunch</span>
                    {day.meals?.Lunch?.length > 0 ? (
                      day.meals.Lunch.map((dish: any) => (
                        <div key={dish.item_id} className="text-[11px] text-slate-800 flex justify-between items-center py-0.5 border-b border-teal-100/30 last:border-0">
                          <span className="truncate pr-1 font-medium">{dish.item_name}</span>
                          <span className="text-[9px] font-mono text-teal-700 flex-shrink-0">{dish.recommended_preparation}p</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No items</p>
                    )}
                  </div>

                  {/* Dinner */}
                  <div className="rounded-lg bg-cyan-50/50 p-2 border border-cyan-100/70 space-y-1">
                    <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-wider block">Dinner</span>
                    {day.meals?.Dinner?.length > 0 ? (
                      day.meals.Dinner.map((dish: any) => (
                        <div key={dish.item_id} className="text-[11px] text-slate-800 flex justify-between items-center py-0.5 border-b border-cyan-100/30 last:border-0">
                          <span className="truncate pr-1 font-medium">{dish.item_name}</span>
                          <span className="text-[9px] font-mono text-cyan-700 flex-shrink-0">{dish.recommended_preparation}p</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No items</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
