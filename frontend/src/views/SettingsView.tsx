import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const SettingsView: React.FC = () => {
  const [safetyBuffer, setSafetyBuffer] = useState<number>(8);
  const [kitchenCapacity, setKitchenCapacity] = useState<number>(15000);
  const [repetitionCooldown, setRepetitionCooldown] = useState<number>(2);
  const [budgetLimit, setBudgetLimit] = useState<number>(80000);
  const [maxItems, setMaxItems] = useState<number>(8);
  const [minItems, setMinItems] = useState<number>(4);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<APIResponse<any>>("/settings");
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        if (d.safety_buffer_pct) setSafetyBuffer(d.safety_buffer_pct);
        if (d.kitchen_capacity) setKitchenCapacity(d.kitchen_capacity);
        if (d.repetition_cooldown_days) setRepetitionCooldown(d.repetition_cooldown_days);
        if (d.budget_limit) setBudgetLimit(d.budget_limit);
        if (d.max_items_per_meal) setMaxItems(d.max_items_per_meal);
        if (d.min_items_per_meal) setMinItems(d.min_items_per_meal);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSavedSuccess(false);
      const res = await apiClient.post<APIResponse<any>>("/settings", {
        safety_buffer_pct: safetyBuffer,
        kitchen_capacity: kitchenCapacity,
        repetition_cooldown_days: repetitionCooldown,
        budget_limit: budgetLimit,
        max_items_per_meal: maxItems,
        min_items_per_meal: minItems,
        min_veg_items: 3,
      });
      if (res.data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 max-w-3xl">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-emerald-600" />
              <span>Operational & Optimization Parameters</span>
            </h3>
            <p className="text-xs text-slate-500">Global defaults for the CanteenIQ recommendation engine</p>
          </div>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Operational configuration successfully saved to PostgreSQL database.</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Daily Meal Budget Limit (₹)</label>
              <p className="text-[11px] text-slate-400">Total cost ceiling for preparation</p>
              <input
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Forecast Safety Buffer (%)</label>
              <p className="text-[11px] text-slate-400">Portion headroom above median prediction</p>
              <input
                type="number"
                value={safetyBuffer}
                onChange={(e) => setSafetyBuffer(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Kitchen Preparation Capacity</label>
              <p className="text-[11px] text-slate-400">Total portions mess can cook per meal</p>
              <input
                type="number"
                value={kitchenCapacity}
                onChange={(e) => setKitchenCapacity(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Dish Repetition Constraint (Days)</label>
              <p className="text-[11px] text-slate-400">Cooldown window between identical dish offerings</p>
              <input
                type="number"
                value={repetitionCooldown}
                onChange={(e) => setRepetitionCooldown(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Max Dishes Offered Per Meal</label>
              <input
                type="number"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Min Dishes Offered Per Meal</label>
              <input
                type="number"
                value={minItems}
                onChange={(e) => setMinItems(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 focus:outline-hidden font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
              <span>{saving ? "Saving Configuration..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
