import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, Database } from "lucide-react";

export const DataManagementView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900">Historical Canteen Ingestion Portal</h3>
          <p className="text-xs text-slate-500">
            Upload your competition dataset (<code className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">datasets.csv</code>) for schema validation, data cleaning, and database persistence.
          </p>
        </div>

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
            {selectedFile ? selectedFile.name : "Drag & drop datasets.csv here, or click to browse"}
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            {selectedFile
              ? `Ready for validation (${(selectedFile.size / 1024).toFixed(1)} KB)`
              : "Supports CSV files with 35 operational & contextual features"}
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Selected: <strong>{selectedFile.name}</strong></span>
            </div>
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Start Phase 2 Validation & Import
            </button>
          </div>
        )}
      </div>

      {/* Target Schema Reference Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-600" />
            <span>Target Schema Specification (35 Features)</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">canteen_synthetic_data_5000</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
          {[
            "date", "day", "week_no", "meal_type", "item_id", "item_name", "category",
            "veg_nonveg", "price", "cost", "calories", "protein_g", "qty_prepared",
            "qty_sold", "qty_wasted", "unmet_demand", "rating", "attendance", "present",
            "absent", "climate", "temperature_c", "rainfall_mm", "humidity_pct",
            "day_marker", "is_weekend", "is_holiday", "is_exam", "is_festival",
            "promotion", "times_served_last_14d", "days_since_last_served",
            "sell_through_pct", "revenue", "profit"
          ].map((col) => (
            <div key={col} className="rounded-md bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 font-mono text-[11px] text-slate-600">
              {col}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
