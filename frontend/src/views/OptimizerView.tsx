import React from "react";
import { Sliders, CheckCircle2 } from "lucide-react";

export const OptimizerView: React.FC = () => {
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
            <p className="text-xs text-slate-500">Configure parameters for PuLP Mixed-Integer Linear Program</p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Meal Budget Limit (₹)</label>
              <input
                type="number"
                defaultValue={15000}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Min Items</label>
                <input
                  type="number"
                  defaultValue={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Max Items</label>
                <input
                  type="number"
                  defaultValue={8}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Min Vegetarian Options</label>
              <input
                type="number"
                defaultValue={3}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Objective Priority</label>
              <select className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50">
                <option value="balanced">Balanced: Max Profit & Min Waste</option>
                <option value="profit">Aggressive Profit Maximization</option>
                <option value="waste">Zero-Waste Priority</option>
              </select>
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
            >
              Solve Menu Mix (Phase 4)
            </button>
          </div>
        </div>

        {/* Right: Solver Output Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900">Recommended Menu Selection</h3>
              <p className="text-xs text-slate-500">Solver Output & Estimated Waste/Profit Performance</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Solver Ready
            </span>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-slate-400" />
            <h4 className="mt-2 text-sm font-semibold text-slate-800">PuLP MILP Optimizer Engine Formulated</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Once demand forecasts are produced in Phase 3, the solver will calculate portion quantities and binary dish choices that respect kitchen capacity and budget ceilings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
