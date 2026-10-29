import React from "react";
import { Cpu } from "lucide-react";

export const ModelPerformanceView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Benchmark Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Primary Model</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">LightGBM Regressor</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">Categorical splits &bull; Lag features</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>MAE: --</span>
            <span>RMSE: --</span>
            <span>WAPE: --</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Comparison Model</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Random Forest</h3>
          <p className="text-xs text-teal-600 font-medium mt-1">Ensemble Trees &bull; Holdout split</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>MAE: --</span>
            <span>RMSE: --</span>
            <span>WAPE: --</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-500">Control Baseline</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">14-Day Rolling Avg</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Historical average benchmark</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>MAE: --</span>
            <span>RMSE: --</span>
            <span>WAPE: --</span>
          </div>
        </div>
      </div>

      {/* SHAP & Explainability placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <Cpu className="mx-auto h-8 w-8 text-slate-400" />
        <h4 className="mt-2 text-sm font-semibold text-slate-800">SHAP TreeExplainer Module Ready</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          Global feature importance summary and per-dish waterfall explanations will be generated once model training runs in Phase 4.
        </p>
      </div>
    </div>
  );
};
