import React from "react";
import { BarChart3 } from "lucide-react";

export const ProfitabilityAnalyticsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Gross Revenue</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">₹ --</h3>
          <p className="text-xs text-slate-500 mt-1">Total dish sales volume</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Preparation Cost</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">₹ --</h3>
          <p className="text-xs text-slate-500 mt-1">Ingredients and portion overhead</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Contribution Margin</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-2">-- %</h3>
          <p className="text-xs text-slate-500 mt-1">Net profit after ingredient deduction</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <BarChart3 className="mx-auto h-8 w-8 text-slate-400" />
        <h4 className="mt-2 text-sm font-semibold text-slate-800">Profitability Dashboard Ready</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          Financial breakdowns by category, profit-per-dish rankings, and cost comparisons will activate in Phase 6.
        </p>
      </div>
    </div>
  );
};
