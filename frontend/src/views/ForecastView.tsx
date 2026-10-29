import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Filter, Sparkles, RefreshCw, Cpu, Users } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const ForecastView: React.FC = () => {
  const [forecastDate, setForecastDate] = useState<string>("2026-10-30");
  const [mealType, setMealType] = useState<string>("Lunch");
  const [modelName, setModelName] = useState<string>("random_forest");
  const [safetyBuffer, setSafetyBuffer] = useState<number>(8);
  const [attendance, setAttendance] = useState<number>(2750);
  const [isAttendanceAuto, setIsAttendanceAuto] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch campus attendance using LightGBM Attendance Forecaster
  const fetchAttendance = async (dateStr: string) => {
    try {
      setLoadingAttendance(true);
      const res = await apiClient.get<APIResponse<{ predicted_attendance: number; day_of_week: string }>>(
        `/forecasts/attendance?target_date=${dateStr}`
      );
      if (res.data?.data?.predicted_attendance) {
        setAttendance(res.data.data.predicted_attendance);
      }
    } catch {
      // Fallback silently if API not ready
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (isAttendanceAuto && forecastDate) {
      fetchAttendance(forecastDate);
    }
  }, [forecastDate, isAttendanceAuto]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post<APIResponse<any>>("/forecasts/generate", {
        forecast_date: forecastDate,
        meal_type: mealType,
        safety_buffer_pct: safetyBuffer,
        expected_attendance: attendance,
        model_name: modelName,
        persist: true,
      });
      setForecastResult(res.data.data);
    } catch (err: any) {
      setError(err.message || "Failed to generate forecasts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Model Selector */}
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-900 font-medium">
            <Cpu className="h-4 w-4 text-indigo-600" />
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="bg-transparent focus:outline-hidden font-semibold cursor-pointer"
            >
              <option value="random_forest">Random Forest (WAPE: 7.6%)</option>
              <option value="lightgbm">LightGBM (WAPE: 7.9%)</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={forecastDate}
              onChange={(e) => setForecastDate(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium cursor-pointer"
            />
          </div>

          {/* Meal Type */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="All">All Meals</option>
            </select>
          </div>

          {/* Safety Buffer Slider */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50">
            <span className="text-slate-500">Buffer:</span>
            <input
              type="range"
              min="0"
              max="25"
              value={safetyBuffer}
              onChange={(e) => setSafetyBuffer(parseInt(e.target.value))}
              className="w-20 accent-emerald-600 cursor-pointer"
            />
            <span className="font-bold text-emerald-700 font-mono">+{safetyBuffer}%</span>
          </div>

          {/* Campus Attendance with LightGBM Auto-fill */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-slate-500">Campus Attendance:</span>
            <input
              type="number"
              value={attendance}
              onChange={(e) => {
                setAttendance(parseInt(e.target.value) || 0);
                setIsAttendanceAuto(false);
              }}
              className="w-16 bg-transparent font-medium focus:outline-hidden text-slate-900"
            />
            {loadingAttendance && <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />}
            {!isAttendanceAuto && (
              <button
                type="button"
                onClick={() => {
                  setIsAttendanceAuto(true);
                  fetchAttendance(forecastDate);
                }}
                className="text-[10px] text-indigo-600 underline hover:text-indigo-800 ml-1"
                title="Reset to LightGBM prediction"
              >
                Auto
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>{loading ? `Forecasting with ${modelName === "lightgbm" ? "LightGBM" : "Random Forest"}...` : "Generate Meal Predictions"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Summary KPI Cards when results generated */}
      {forecastResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Predicted Demand</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {forecastResult.summary?.total_predicted_demand} portions
            </h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              {forecastResult.model_name === "lightgbm" ? "LightGBM Gradient Boosting Engine" : "Random Forest Ensemble Engine"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-500">Recommended Preparation</span>
            <h3 className="text-2xl font-bold text-teal-600 mt-1">
              {forecastResult.summary?.total_recommended_preparation} portions
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Includes +{safetyBuffer}% safety headroom</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-500">Expected Gross Revenue</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              ₹{forecastResult.summary?.expected_gross_revenue?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Predicted portion sales</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase text-slate-500">Estimated Net Profit</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{forecastResult.summary?.estimated_net_profit?.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">After portion prep cost deduction</p>
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Item-Level Demand Predictions</h3>
            <p className="text-xs text-slate-500">
              {forecastResult ? `Showing ${forecastResult.predictions?.length} predicted dishes` : "Awaiting forecast generation"}
            </p>
          </div>
          {forecastResult && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Model: {forecastResult.model_name || forecastResult.predictions[0]?.model_name}
              </span>
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                CI: 90% Empirical
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Dish Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Dietary</th>
                <th className="px-6 py-3">Predicted Demand</th>
                <th className="px-6 py-3">90% Conf. Bounds</th>
                <th className="px-6 py-3">Recommended Prep</th>
                <th className="px-6 py-3">Price / Cost</th>
                <th className="px-6 py-3">Expected Revenue</th>
                <th className="px-6 py-3">Estimated Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!forecastResult ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <TrendingUp className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No predictions generated yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Select model, date and meal window above and click "Generate Meal Predictions".
                    </p>
                  </td>
                </tr>
              ) : (
                forecastResult.predictions.map((p: any) => (
                  <tr key={p.item_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{p.item_name}</td>
                    <td className="px-6 py-3.5">{p.category}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                          p.veg_nonveg === "Veg"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {p.veg_nonveg}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{p.predicted_demand} portions</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                      [{p.lower_bound} – {p.upper_bound}]
                    </td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">
                      {p.recommended_preparation} portions
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      ₹{p.price} / ₹{p.cost}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">₹{p.expected_revenue}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">₹{p.estimated_profit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
