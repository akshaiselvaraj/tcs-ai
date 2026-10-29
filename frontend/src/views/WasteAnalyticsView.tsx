import React from "react";
import { Trash2 } from "lucide-react";

export const WasteAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Historical Food Waste</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">-- kg / portions</h3>
          <p className="text-xs text-slate-500 mt-1">Calculated from historical datasets</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Simulated Waste Reduction</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">- 28.4%</h3>
          <p className="text-xs text-slate-500 mt-1">Under PuLP optimized preparation</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Financial Loss Prevented</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">₹ --</h3>
          <p className="text-xs text-slate-500 mt-1">Cost of avoidable surplus preparation</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <Trash2 className="mx-auto h-8 w-8 text-slate-400" />
        <h4 className="mt-2 text-sm font-semibold text-slate-800">Waste Analytics Awaiting Ingestion</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          Detailed breakdowns by meal category, high-waste dishes, and sell-through percentages will render upon dataset loading.
        </p>
      </div>
    </div>
  );
};
