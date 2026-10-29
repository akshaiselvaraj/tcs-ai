import { useState, useEffect } from "react";
import {
  UploadCloud,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { APIResponse } from "../models/api.types";

export const DataManagementView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [training, setTraining] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [trainingResult, setTrainingResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sales records table
  const [salesData, setSalesData] = useState<any[]>([]);
  const [salesSummary, setSalesSummary] = useState<any | null>(null);
  const [loadingSales, setLoadingSales] = useState<boolean>(false);

  const fetchSummaryAndSales = async () => {
    try {
      setLoadingSales(true);
      const [summaryRes, salesRes] = await Promise.all([
        apiClient.get<APIResponse<any>>("/data/summary"),
        apiClient.get<APIResponse<any>>("/data/sales?page=1&page_size=20"),
      ]);
      setSalesSummary(summaryRes.data.data);
      setSalesData(salesRes.data.data?.items || []);
    } catch {
      // Ignored if DB is currently unpopulated
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchSummaryAndSales();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setValidationReport(null);
      setError(null);

      // Auto-run validation
      try {
        setValidating(true);
        const formData = new FormData();
        formData.append("file", file);
        const res = await apiClient.post<APIResponse<any>>("/data/validate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setValidationReport(res.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to validate CSV");
      } finally {
        setValidating(false);
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    try {
      setImporting(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", selectedFile);
      await apiClient.post<APIResponse<any>>("/data/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Auto-trigger model training with Random Forest
      setTraining(true);
      try {
        const trainRes = await apiClient.post<APIResponse<any>>("/models/train");
        setTrainingResult(trainRes.data.data);
      } catch (trainErr: any) {
        console.error("Training notice:", trainErr.message);
      } finally {
        setTraining(false);
      }

      fetchSummaryAndSales();
    } catch (err: any) {
      setError(err.message || "Failed to import dataset");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload & Ingestion Portal */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-semibold text-slate-900">Historical Canteen Ingestion Portal</h3>
            <p className="text-xs text-slate-500">
              Upload <code className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">database.csv</code> for schema validation, data cleaning, and database persistence.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Phase 2 Pipeline Active
          </span>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Drop Zone */}
        <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:bg-slate-50/80 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <UploadCloud className="h-7 w-7" />
          </div>
          <h4 className="mt-3 text-sm font-semibold text-slate-800">
            {selectedFile ? selectedFile.name : "Drag & drop database.csv here, or click to browse"}
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            {selectedFile
              ? `Selected file: ${(selectedFile.size / 1024).toFixed(1)} KB`
              : "Supports CSV files with 35 operational and contextual canteen features"}
          </p>
        </div>

        {/* Validation Progress */}
        {validating && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-slate-600">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
            <span>Validating 35 columns, checking quantities, and scanning for anomalies...</span>
          </div>
        )}

        {/* Pre-Import Validation Report */}
        {validationReport && validationReport.is_valid && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-sm text-emerald-950">
                  Validation Passed: {validationReport.total_rows.toLocaleString()} records detected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Quality Score:</span>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  {validationReport.quality_score} / 100
                </span>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase">Unique Dishes</span>
                <span className="font-bold text-slate-800 text-sm">{validationReport.unique_items}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase">Categories</span>
                <span className="font-bold text-slate-800 text-sm">{validationReport.categories?.length || 0}</span>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-emerald-100 shadow-2xs col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase">Date Range</span>
                <span className="font-bold text-slate-800 text-xs">
                  {validationReport.date_range?.start} &rarr; {validationReport.date_range?.end}
                </span>
              </div>
            </div>

            {/* Anomalies section */}
            {validationReport.anomalies?.length > 0 && (
              <div className="rounded-lg bg-white p-3 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <span className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Sanitization & Pre-processing Highlights:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                  {validationReport.anomalies.map((a: string, idx: number) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Ready to populate <code className="font-mono text-emerald-700">menu_items</code> & <code className="font-mono text-emerald-700">sales_history</code> and train models.
              </p>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing || training}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Ingesting to Database...</span>
                  </>
                ) : training ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" />
                    <span>Training Random Forest Model...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Confirm Ingestion & Train Models</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Training Result Notice */}
        {trainingResult && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Random Forest & LightGBM Models Trained Successfully!</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">Chronological Holdout</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="rounded bg-white p-2 border border-emerald-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Random Forest WAPE</span>
                <p className="text-base font-bold text-emerald-700">{trainingResult.random_forest?.wape}%</p>
                <span className="text-[10px] text-slate-400">MAE: {trainingResult.random_forest?.mae} portions</span>
              </div>
              <div className="rounded bg-white p-2 border border-emerald-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase">LightGBM WAPE</span>
                <p className="text-base font-bold text-teal-700">{trainingResult.lightgbm?.wape}%</p>
                <span className="text-[10px] text-slate-400">MAE: {trainingResult.lightgbm?.mae} portions</span>
              </div>
              <div className="rounded bg-white p-2 border border-emerald-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Control Baseline</span>
                <p className="text-base font-bold text-slate-700">{trainingResult.baseline?.wape}%</p>
                <span className="text-[10px] text-slate-400">Historical average</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Sales Records Explorer */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">Historical Sales Database Records</h4>
            <p className="text-xs text-slate-500">
              {salesSummary?.total_records
                ? `${salesSummary.total_records.toLocaleString()} records across ${salesSummary.active_dishes} unique dishes`
                : "No historical records ingested yet."}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSummaryAndSales}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingSales ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Meal</th>
                <th className="px-4 py-3">Dish Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Prepared</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3">Wasted</th>
                <th className="px-4 py-3">Revenue (₹)</th>
                <th className="px-4 py-3">Profit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 italic">
                    Historical records will display here once <code className="text-slate-600 font-mono">database.csv</code> is ingested.
                  </td>
                </tr>
              ) : (
                salesData.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.date}</td>
                    <td className="px-4 py-3">{s.meal_type}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{s.item_name}</td>
                    <td className="px-4 py-3">{s.category}</td>
                    <td className="px-4 py-3">{s.qty_prepared}</td>
                    <td className="px-4 py-3 font-medium text-emerald-600">{s.qty_sold}</td>
                    <td className="px-4 py-3 text-rose-500">{s.qty_wasted}</td>
                    <td className="px-4 py-3">₹{s.revenue?.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">₹{s.profit?.toFixed(2)}</td>
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
