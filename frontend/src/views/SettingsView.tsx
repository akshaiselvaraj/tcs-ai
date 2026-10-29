import React from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 max-w-3xl">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-emerald-600" />
            <span>Operational & Optimization Parameters</span>
          </h3>
          <p className="text-xs text-slate-500">Global defaults for the CanteenIQ recommendation engine</p>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Forecast Safety Buffer (%)</label>
            <p className="text-[11px] text-slate-400">Additional portion headroom above median predicted demand</p>
            <input
              type="number"
              defaultValue={8}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Kitchen Preparation Capacity (Portions/Meal)</label>
            <input
              type="number"
              defaultValue={1200}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Dish Repetition Constraint</label>
            <p className="text-[11px] text-slate-400">Days required before the identical dish can be repeated for the same meal</p>
            <input
              type="number"
              defaultValue={2}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm bg-slate-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
