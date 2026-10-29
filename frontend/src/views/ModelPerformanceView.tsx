import { useState, useEffect } from "react";
import { Cpu, Award, BarChart3, ShieldCheck } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const ModelPerformanceView: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [training, setTraining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const res = await apiClient.get<APIResponse<any>>("/models/metrics");
      if (res.data.success && res.data.data?.random_forest) {
        setMetrics(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load model metrics");
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleTrainModels = async () => {
    try {
      setTraining(true);
      setError(null);
      const res = await apiClient.post<APIResponse<any>>("/models/train");
      setMetrics(res.data.data);
    } catch (err: any) {
      setError(err.message || "Model training failed");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card with action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Demand Forecasting Model Evaluation</h2>
          <p className="text-xs text-slate-500">
            Chronological holdout test benchmarks: Random Forest vs. LightGBM vs. Historical Baseline
          </p>
        </div>

        <button
          type="button"
          onClick={handleTrainModels}
          disabled={training}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <Cpu className={`h-4 w-4 ${training ? "animate-spin" : ""}`} />
          <span>{training ? "Training Ensemble Models..." : "Train / Re-evaluate Models"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Benchmark Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Random Forest Card */}
        <div className="rounded-xl border-2 border-emerald-500/30 bg-white p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Primary ML Model</span>
            <Award className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Random Forest</h3>
          <p className="text-xs text-slate-500">100 Estimators &bull; Depth 12</p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">WAPE (Error %):</span>
              <span className="font-bold text-emerald-600">
                {metrics?.random_forest ? `${metrics.random_forest.wape}%` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">MAE (Portions):</span>
              <span className="font-semibold text-slate-800">
                {metrics?.random_forest ? `${metrics.random_forest.mae} portions` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">RMSE:</span>
              <span className="font-semibold text-slate-800">
                {metrics?.random_forest ? `${metrics.random_forest.rmse}` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">R² Score:</span>
              <span className="font-semibold text-slate-800">
                {metrics?.random_forest ? `${metrics.random_forest.r2_score}` : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* LightGBM Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Gradient Boosting</span>
            <BarChart3 className="h-5 w-5 text-teal-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">LightGBM</h3>
          <p className="text-xs text-slate-500">Early Stopping &bull; Fast Gradient Boosting</p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">WAPE (Error %):</span>
              <span className="font-bold text-teal-600">
                {metrics?.lightgbm ? `${metrics.lightgbm.wape}%` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">MAE (Portions):</span>
              <span className="font-semibold text-slate-800">
                {metrics?.lightgbm ? `${metrics.lightgbm.mae} portions` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">RMSE:</span>
              <span className="font-semibold text-slate-800">
                {metrics?.lightgbm ? `${metrics.lightgbm.rmse}` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">R² Score:</span>
              <span className="font-semibold text-slate-800">
                {metrics?.lightgbm ? `${metrics.lightgbm.r2_score}` : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Control Baseline */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Control Baseline</span>
            <ShieldCheck className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Historical Mean</h3>
          <p className="text-xs text-slate-500">Item historical average benchmark</p>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">WAPE (Error %):</span>
              <span className="font-bold text-slate-700">
                {metrics?.baseline ? `${metrics.baseline.wape}%` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">MAE (Portions):</span>
              <span className="font-semibold text-slate-800">
                {metrics?.baseline ? `${metrics.baseline.mae} portions` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">RMSE:</span>
              <span className="font-semibold text-slate-800">
                {metrics?.baseline ? `${metrics.baseline.rmse}` : "--"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">R² Score:</span>
              <span className="font-semibold text-slate-800">
                {metrics?.baseline ? `${metrics.baseline.r2_score}` : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm">Random Forest Feature Importance Weights</h3>
          <p className="text-xs text-slate-500">Top operational and contextual drivers influencing food demand</p>
        </div>

        {!metrics?.feature_importance ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            Feature importances will appear here once models are trained.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {metrics.feature_importance.map((f: any, idx: number) => {
              const maxImp = metrics.feature_importance[0]?.importance || 1;
              const pct = Math.min(100, Math.round((f.importance / maxImp) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{f.feature}</span>
                    <span className="font-mono text-slate-500">{f.importance}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
