import React from "react";
import { TrendingUp, Utensils, Trash2, DollarSign, Database, Sparkles, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 p-6 text-white shadow-md border border-navy-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Decision Support Active
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI-Powered Canteen Menu Mix Optimization</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              CanteenIQ analyzes historical sales, attendance patterns, and item popularity to forecast meal demand and optimize preparation portions.
            </p>
          </div>
          <Link
            to="/data"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
          >
            <Database className="h-4 w-4" />
            <span>Import Dataset</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Predicted Demand</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">-- portions</h3>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span>Ready for forecast inference</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Prepared Volume</span>
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <Utensils className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">-- items</h3>
            <p className="mt-1 text-xs text-slate-500">Optimized batch quantities</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Target Waste %</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">&lt; 5.0%</h3>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Algorithmic waste reduction goal</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Gross Margin</span>
            <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">--</h3>
            <p className="mt-1 text-xs text-slate-500">Revenue minus preparation cost</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Data Status & Action Center */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Readiness Checklist */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900">End-to-End Decision Pipeline</h3>
              <p className="text-xs text-slate-500">Current system initialization and module readiness</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              Phase 1 Live
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3.5">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Phase 1: Architecture & MVC Foundations</h4>
                  <span className="text-xs font-medium text-emerald-600">Completed & Verified</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  FastAPI backend, PostgreSQL connection layer, ORM models, React TypeScript Vite frontend, and Tailwind design system active.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3.5">
              <div className="mt-0.5 rounded-full bg-slate-100 p-1 text-slate-500">
                <Database className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">Phase 2: Ingestion of datasets.csv</h4>
                  <span className="text-xs font-medium text-slate-400">Awaiting Upload</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  35 synthetic canteen feature dimensions, attendance reconciliation, and database table population.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3.5">
              <div className="mt-0.5 rounded-full bg-slate-100 p-1 text-slate-500">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">Phase 3-4: Demand ML (LightGBM & Random Forest)</h4>
                  <span className="text-xs font-medium text-slate-400">Next Step</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chronological holdout split, MAE/RMSE/WAPE benchmarks vs 14-day rolling baseline, and SHAP explainability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Shortcut panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-semibold text-slate-900">Core Decision Tools</h3>
          <p className="text-xs text-slate-500">Jump directly to specialized modules</p>

          <div className="space-y-2 pt-2">
            <Link
              to="/forecast"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Demand Forecasting</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/optimizer"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Utensils className="h-4 w-4 text-teal-600" />
                <span>Menu Mix Optimizer</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/weekly-planner"
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-cyan-600" />
                <span>7-Day Weekly Planner</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
