import React from "react";
import { Download, RefreshCw } from "lucide-react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const WeeklyPlannerView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900">7-Day Menu Schedule</h2>
          <p className="text-xs text-slate-500">Breakfast, Lunch, and Dinner with Dish Repetition Penalties</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Generate Plan (Phase 5)</span>
          </button>
        </div>
      </div>

      {/* 7-Day Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map((day) => (
          <div key={day} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{day}</span>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="text-[10px] font-semibold text-emerald-600 uppercase">Breakfast</span>
                <p className="text-xs text-slate-400 mt-0.5 italic">Awaiting schedule</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="text-[10px] font-semibold text-teal-600 uppercase">Lunch</span>
                <p className="text-xs text-slate-400 mt-0.5 italic">Awaiting schedule</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                <span className="text-[10px] font-semibold text-cyan-600 uppercase">Dinner</span>
                <p className="text-xs text-slate-400 mt-0.5 italic">Awaiting schedule</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
