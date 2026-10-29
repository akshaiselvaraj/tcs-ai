import React, { useState } from "react";
import { Sliders, Cpu, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const OptimizerView: React.FC = () => {
  // Input form state
  const [forecastDate, setForecastDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [mealType, setMealType] = useState<string>("Lunch");
  const [budgetLimit, setBudgetLimit] = useState<number>(75000);
  const [minItems, setMinItems] = useState<number>(4);
  const [maxItems, setMaxItems] = useState<number>(6);
  const [minVeg, setMinVeg] = useState<number>(3);
  const [objective, setObjective] = useState<string>("balanced");
  const [kitchenCapacity, setKitchenCapacity] = useState<number>(15000);

  // Results state
  const [solving, setSolving] = useState<boolean>(false);
  const [optimizerResult, setOptimizerResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async () => {
    try {
      setSolving(true);
      setError(null);
      const res = await apiClient.post<APIResponse<any>>("/optimize/menu-mix", {
        forecast_date: forecastDate,
        meal_type: mealType,
        budget_limit: budgetLimit,
        min_items: minItems,
        max_items: maxItems,
        min_veg_items: minVeg,
        kitchen_capacity: kitchenCapacity,
        objective_priority: objective,
        safety_buffer_pct: 8.0,
      });

      if (res.data.success) {
        setOptimizerResult(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to solve menu mix");
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Interactive Constraints Form (PuLP MILP inputs) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600" />
              <span>Optimization Constraints</span>
            </h3>
            <p className="text-xs text-slate-500">PuLP CBC Mixed-Integer Linear Program</p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Service Date & Meal</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="date"
                  value={forecastDate}
                  onChange={(e) => setForecastDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-slate-50"
                />
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-slate-50"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Meal Budget Ceiling (₹)</label>
              <input
                type="number"
                step="1000"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Min Items</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={minItems}
                  onChange={(e) => setMinItems(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Max Items</label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={maxItems}
                  onChange={(e) => setMaxItems(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Min Veg Dishes</label>
                <input
                  type="number"
                  min="0"
                  value={minVeg}
                  onChange={(e) => setMinVeg(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Kitchen Capacity</label>
                <input
                  type="number"
                  step="500"
                  value={kitchenCapacity}
                  onChange={(e) => setKitchenCapacity(parseInt(e.target.value) || 1000)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Objective Priority</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50 font-medium"
              >
                <option value="balanced">Balanced: Profit Margin & Waste Minimization</option>
                <option value="profit">Aggressive Profit Maximization</option>
                <option value="waste">Zero-Waste Priority (Strict Loss Penalty)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSolve}
              disabled={solving}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {solving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Solving PuLP MILP...</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>Solve Menu Mix (PuLP CBC)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Solver Output Summary & Recommended Menu */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900">Recommended Optimal Menu Selection</h3>
              <p className="text-xs text-slate-500">
                Mixed-Integer Linear Programming Output ({mealType} &bull; {forecastDate})
              </p>
            </div>
            {optimizerResult ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  optimizerResult.solver_status === "Optimal"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                Solver: {optimizerResult.solver_status}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Awaiting Run
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!optimizerResult ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">PuLP MILP Solver Ready</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                Configure your budget and dietary constraints on the left, then click <strong>"Solve Menu Mix"</strong> to calculate portion quantities and binary dish choices.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Selected Dishes</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">
                    {optimizerResult.summary.selected_dishes_count} items
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">Optimal Mix</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Prep Portions</span>
                  <p className="text-xl font-bold text-teal-700 mt-0.5">
                    {optimizerResult.summary.total_recommended_preparation.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400">Within kitchen cap</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Prep Cost</span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">
                    ₹{optimizerResult.summary.total_prep_cost.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400">Budget: ₹{budgetLimit.toLocaleString()}</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Est. Net Profit</span>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">
                    ₹{optimizerResult.summary.estimated_net_profit.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    +{optimizerResult.summary.simulated_waste_reduction_pct}% waste cut
                  </span>
                </div>
              </div>

              {/* Selected Dishes Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] font-semibold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Dish Name</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Dietary</th>
                        <th className="px-4 py-2.5">Forecast Demand</th>
                        <th className="px-4 py-2.5 font-bold text-emerald-700">Solved Prep</th>
                        <th className="px-4 py-2.5">Price / Cost</th>
                        <th className="px-4 py-2.5">Prep Cost</th>
                        <th className="px-4 py-2.5 font-bold text-slate-900">Est. Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {optimizerResult.selected_dishes.map((d: any) => (
                        <tr key={d.item_id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">{d.item_name}</td>
                          <td className="px-4 py-3 text-slate-500">{d.category}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                d.veg_nonveg === "Veg"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {d.veg_nonveg}
                            </span>
                          </td>
                          <td className="px-4 py-3">{d.predicted_demand}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">
                            {d.recommended_preparation} portions
                          </td>
                          <td className="px-4 py-3 text-slate-500">₹{d.price} / ₹{d.cost}</td>
                          <td className="px-4 py-3 text-slate-800">₹{d.prep_cost}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">₹{d.estimated_profit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
