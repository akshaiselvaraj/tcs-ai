import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Plus, Search, Check, X, RefreshCw } from "lucide-react";
import { apiClient } from "../services/apiClient";
import type { MenuItem, MenuItemCreate } from "../models/menu.types";
import type { APIResponse } from "../models/api.types";

export const MenuItemsView: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<MenuItemCreate>({
    item_name: "",
    category: "Main Course",
    meal_type: "Lunch",
    veg_nonveg: "Veg",
    price: 60,
    cost: 35,
    calories: 450,
    protein_g: 12,
    portion_unit: "portion",
    is_active: true,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<APIResponse<MenuItem[]>>("/menu-items");
      setItems(res.data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/menu-items", formData);
      setShowAddModal(false);
      fetchItems();
    } catch (err: any) {
      alert("Error adding item: " + err.message);
    }
  };

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            type="button"
            onClick={fetchItems}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <strong>Database Notice:</strong> {error}
        </div>
      )}

      {/* Menu Items Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Dish Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Meal Type</th>
                <th className="px-6 py-3.5">Dietary</th>
                <th className="px-6 py-3.5">Selling Price</th>
                <th className="px-6 py-3.5">Prep Cost</th>
                <th className="px-6 py-3.5">Calories &bull; Protein</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-500 mb-2" />
                    <span>Loading dishes from PostgreSQL...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <UtensilsCrossed className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No dishes found in menu catalog.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload your <code className="bg-slate-100 px-1 py-0.5 rounded">datasets.csv</code> in Data Management or click "Add New Dish".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.item_name}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.meal_type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                          item.veg_nonveg === "Veg"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.veg_nonveg}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-500">₹{item.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {item.calories} kcal &bull; {item.protein_g}g
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          item.is_active ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {item.is_active ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Add New Dish to Catalog</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Butter Masala"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Snack">Snack</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Rice Dish">Rice Dish</option>
                    <option value="Breads">Breads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Meal Type</label>
                  <select
                    value={formData.meal_type}
                    onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="All">All Meals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Preparation Cost (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Dietary</label>
                  <select
                    value={formData.veg_nonveg}
                    onChange={(e) => setFormData({ ...formData, veg_nonveg: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Calories (kcal)</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Protein (g)</label>
                  <input
                    type="number"
                    value={formData.protein_g}
                    onChange={(e) => setFormData({ ...formData, protein_g: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
