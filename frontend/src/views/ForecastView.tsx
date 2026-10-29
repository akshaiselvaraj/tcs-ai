import React from "react";
import { TrendingUp, AlertCircle, Calendar, Filter } from "lucide-react";

export const ForecastView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-slate-50">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="bg-transparent focus:outline-hidden" />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-slate-50">
            <Filter className="h-4 w-4 text-slate-500" />
            <select className="bg-transparent focus:outline-hidden">
              <option value="All">All Meals (Breakfast, Lunch, Dinner)</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
        >
          Generate Predictions (Phase 3)
        </button>
      </div>

      {/* Empty State Banner */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <TrendingUp className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Demand Forecasting Engine Ready for Training Data</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
          In Phase 2, upload your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-xs">datasets.csv</code> to train the LightGBM Regressor and Random Forest models with chronological holdout validation.
        </p>
        <div className="mt-6 flex justify-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
            Zero future leakage constraint enforced
          </span>
        </div>
      </div>
    </div>
  );
};
