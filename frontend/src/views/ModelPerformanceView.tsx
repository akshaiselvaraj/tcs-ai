import { useState, useEffect } from "react";
import { Cpu, Award, BarChart3, ShieldCheck } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const ModelPerformanceView: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [training, setTraining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // SHAP Explainability State
  const [explainerTab, setExplainerTab] = useState<"shap" | "mdi">("shap");
  const [shapModel, setShapModel] = useState<string>("random_forest");
  const [shapData, setShapData] = useState<any[]>([]);
  const [loadingShap, setLoadingShap] = useState<boolean>(false);

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

  const fetchShap = async (model: string) => {
    try {
      setLoadingShap(true);
      const res = await apiClient.get<APIResponse<any[]>>(`/models/shap-importance?model_name=${model}`);
      if (res.data.success && res.data.data) {
        setShapData(res.data.data);
      }
    } catch {
      // Handled gracefully in UI
    } finally {
      setLoadingShap(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchShap(shapModel);
  }, []);

  useEffect(() => {
    fetchShap(shapModel);
  }, [shapModel]);

  const handleTrainModels = async () => {
    try {
      setTraining(true);
      setError(null);
      const res = await apiClient.post<APIResponse<any>>("/models/train");
      setMetrics(res.data.data);
      fetchShap(shapModel);
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

      {/* Explainability Engine: SHAP vs MDI */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <span>Model Explainability & Feature Drivers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Analyze model decisions using SHAP TreeExplainer values (game theory) or Gini impurity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() => setExplainerTab("shap")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  explainerTab === "shap" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                SHAP Values
              </button>
              <button
                type="button"
                onClick={() => setExplainerTab("mdi")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  explainerTab === "mdi" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Gini Impurity
              </button>
            </div>

            {explainerTab === "shap" && (
              <select
                value={shapModel}
                onChange={(e) => setShapModel(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="random_forest">Random Forest</option>
                <option value="lightgbm">LightGBM</option>
              </select>
            )}
          </div>
        </div>

        {explainerTab === "shap" ? (
          <div>
            {loadingShap ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Cpu className="mx-auto h-6 w-6 animate-spin text-slate-300 mb-2" />
                Computing TreeExplainer SHAP values...
              </div>
            ) : shapData.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                SHAP attributions not yet loaded. Please click "Train / Re-evaluate Models".
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-100">
                  <span>Feature Driver</span>
                  <span>Mean |SHAP| Impact (Portions) / Contribution %</span>
                </div>
                {shapData.slice(0, 10).map((f: any, idx: number) => {
                  const maxShap = shapData[0]?.mean_abs_shap || 1;
                  const pct = Math.min(100, Math.round((f.mean_abs_shap / maxShap) * 100));
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800">{f.feature}</span>
                        <span className="font-mono text-slate-600">
                          {f.mean_abs_shap} portions ({f.importance_pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
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
        )}
      </div>
    </div>
  );
};
