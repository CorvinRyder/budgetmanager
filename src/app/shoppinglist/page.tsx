"use client";

import React, { FormEventHandler, useEffect, useState } from "react";

type ShoppingItem = {
  item_id?: number;
  item_name: string;
  brand?: string;
  store_name?: string;
  quantity?: number;
  quan_unit?: string;
  status: "U" | "C" | "D"; // U: Unchecked, C: Checked, D: Deleted
};

const ShoppingListPage = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'bought'

  const handleAddItem: FormEventHandler = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      item_id: Date.now(),
      item_name: newItemName,
      status: "C",
    };

    setItems([newItem, ...items]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const toggleBought = (item_id: number) => {
    setItems(
      items.map((item) =>
        item.item_id === item_id
          ? { ...item, status: item.status === "C" ? "U" : "C" }
          : item
      )
    );
  };

  const deleteItem = (item_id: number) => {
    setItems(items.filter((item) => item.item_id !== item_id));
  };

  const filteredItems = items.filter((item) => {
    if (filter === "pending") return item.status === "U";
    if (filter === "bought") return item.status === "C";
    return true;
  });

  const totalEst = 0;
  const totalSpent = 0;

  useEffect(() => {
    (async function () {
      const result = await fetch("/api/ShoppingList", {
        method: "GET",
      });
      setItems(await result.json());
    })();
  }, []);

  return (
    <div className="p-2 bg-[#EBF1F5] min-h-screen text-slate-800 space-y-2">
      {/* 1. Top KPI Overview Witem_idgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estimated Total Witem_idget */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-100/80 text-teal-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">
              shopping_bag
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-witem_ider">
              Est. Total Budget
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              ${totalEst.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Total Spent / Checked Off */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-100/80 text-sky-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">
              attach_money
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-witem_ider">
              Checked Items Total
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              ${totalSpent.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Items Count Summary */}
        <div className="p-4 bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100/80 text-amber-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">
              local_offer
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-witem_ider">
              Progress
            </p>
            <h3 className="text-2xl font-bold text-slate-800">
              {items.filter((i) => i.status === "C").length} / {items.length}{" "}
              <span className="text-sm font-normal text-slate-500">Items</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Quick-Add Item Bar */}
      <form
        onSubmit={handleAddItem}
        className="p-3 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3"
      >
        <input
          type="text"
          placeholder="Add new item (e.g., Soy Milk)..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-[#F0F4F8] border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Est. $ (optional)"
          value={newItemPrice}
          onChange={(e) => setNewItemPrice(e.target.value)}
          className="w-full md:w-36 px-3 py-2 text-sm bg-[#F0F4F8] border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="w-full md:w-auto px-4 py-2 bg-[#00A8B5] hover:bg-[#008c97] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span> Add
          Item
        </button>
      </form>

      {/* 3. Main Shopping Table Card */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hitem_idden">
        {/* Table Filter Controls Header */}
        <div className="p-4 bg-[#EFF4F8] border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00A8B5] text-lg">
              shopping_cart
            </span>{" "}
            Shopping Items
          </h2>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-base">
              filter_list
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Items</option>
              <option value="pending">To Buy</option>
              <option value="bought">Completed</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#EFF4F8]/60 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Store Name</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divitem_ide-y divitem_ide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No items in this list.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.item_id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.status === "U" ? "bg-slate-50/50" : ""
                    }`}
                  >
                    {/* Checkbox Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          item.item_id && toggleBought(item.item_id)
                        }
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          item.status === "U"
                            ? "bg-teal-500/10 border-teal-500 text-white"
                            : "border-slate-300 bg-white hover:border-teal-500"
                        }`}
                      >
                        {item.status === "C" && (
                          <span className="material-symbols-outlined text-sm font-bold">
                            check
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Item Name */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          item.status === "C"
                            ? "line-through text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {item.item_name}
                        {item.quantity &&
                          ` x ${item.quantity} ${item.quan_unit}`}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {item.brand}
                    </td>

                    {/* Est Price */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {item.store_name}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => item.item_id && deleteItem(item.item_id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Delete item"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </td>
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

export default ShoppingListPage;
