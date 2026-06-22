"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";

// Define the type for a single shopping list item
interface ShoppingItem {
  item_id: number;
  item_name: string;
  brand: string;
  store_name: string;
  quantity: number;
  status: "U" | "C" | "D"; // U: Unchecked, C: Checked, D: Deleted
}

// Define the type for the new item form data
interface NewItemForm {
  item_name: string;
  brand: string;
  store_name: string;
  quantity: number;
}

export default function ShoppingList() {
  // Mock data to simulate the MSSQL database table.
  const initialData: ShoppingItem[] = [
    {
      item_id: 1,
      item_name: "Milk",
      brand: "Lactaid",
      store_name: "Grocery Outlet",
      quantity: 1,
      status: "U",
    },
    {
      item_id: 2,
      item_name: "Bread",
      brand: "Wonder",
      store_name: "Safeway",
      quantity: 2,
      status: "C",
    },
    {
      item_id: 3,
      item_name: "Coffee Beans",
      brand: "Starbucks",
      store_name: "Costco",
      quantity: 1,
      status: "U",
    },
    {
      item_id: 4,
      item_name: "Chicken Breast",
      brand: "Foster Farms",
      store_name: "Target",
      quantity: 5,
      status: "U",
    },
    {
      item_id: 5,
      item_name: "Lettuce",
      brand: "Organic Valley",
      store_name: "Trader Joe's",
      quantity: 1,
      status: "C",
    },
  ];

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(
    initialData.filter((item) => item.status !== "D")
  );
  const [loading, setLoading] = useState<boolean>(true); // Set to false initially as we're using static data

  // State for the new item form
  const [newItem, setNewItem] = useState<NewItemForm>({
    item_name: "",
    brand: "",
    store_name: "",
    quantity: 1,
  });

  useEffect(() => {
    (async function () {
      const result = await fetch("/api/ShoppingList", {
        method: "GET",
      });
      setShoppingList(await result.json());
      setLoading(false);
    })();
  }, []);

  // Handles input changes for the form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));
  };

  // Handles form submission to add a new item
  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (newItem.item_name.trim() === "") return;

    // In a real app, this would be an API call (POST request)
    const newId = Math.max(...shoppingList.map((item) => item.item_id), 0) + 1;
    const itemToAdd: ShoppingItem = {
      ...newItem,
      item_id: newId,
      status: "U",
    };

    setShoppingList((prevList) => [...prevList, itemToAdd]);

    // Reset form after submission
    setNewItem({
      item_name: "",
      brand: "",
      store_name: "",
      quantity: 1,
    });
  };

  // Toggles the status of an item between 'U' (Unchecked) and 'C' (Checked)
  const toggleStatus = (id: number) => {
    setShoppingList((prevList) =>
      prevList.map((item) =>
        item.item_id === id
          ? { ...item, status: item.status === "U" ? "C" : "U" }
          : item
      )
    );
  };

  // Deletes an item from the list by filtering it out
  const deleteItem = (id: number) => {
    setShoppingList((prevList) =>
      prevList.filter((item) => item.item_id !== id)
    );
  };

  // Clears all items from the list
  const clearList = () => {
    setShoppingList([]);
  };

  // Helper function to render a status icon
  const getStatusIcon = (status: "U" | "C" | "D") => {
    switch (status) {
      case "C":
        return (
          <svg
            className="w-6 h-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "U":
      default:
        return (
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-xl font-medium">Loading shopping list...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
            Shopping List
          </h1>
          <button
            onClick={clearList}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            Clear All
          </button>
        </div>

        {/* Form to add a new shopping item */}
        <form
          onSubmit={handleAddItem}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row flex-wrap gap-4 items-end"
        >
          <div className="flex-1 w-full sm:w-auto">
            <label
              htmlFor="item_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Item Name
            </label>
            <input
              type="text"
              id="item_name"
              name="item_name"
              value={newItem.item_name}
              onChange={handleInputChange}
              placeholder="e.g., Apple"
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={newItem.brand}
              onChange={handleInputChange}
              placeholder="e.g., Gala"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label
              htmlFor="store_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Store
            </label>
            <input
              type="text"
              id="store_name"
              name="store_name"
              value={newItem.store_name}
              onChange={handleInputChange}
              placeholder="e.g., Supermarket"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="w-24">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={newItem.quantity}
              onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            Add Item
          </button>
        </form>

        {shoppingList.length === 0 ? (
          <div className="text-center text-xl text-gray-500 mt-10">
            Your shopping list is empty.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Item Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Brand
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Store
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {shoppingList.map((item) => (
                  <tr
                    key={item.item_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          item.status === "C"
                            ? "line-through text-gray-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {item.item_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {item.brand}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {item.store_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {item.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        onClick={() => toggleStatus(item.item_id)}
                        className="cursor-pointer inline-flex items-center justify-center p-1 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {getStatusIcon(item.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => deleteItem(item.item_id)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-full transition-all duration-200 transform hover:scale-110"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
