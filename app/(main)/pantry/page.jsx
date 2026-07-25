/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChefHat,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/use-fetch";
import {
  getPantryItems,
  deletePantryItem,
  updatePantryItem,
} from "@/actions/pantry.actions";
import { toast } from "sonner";
import AddToPantryModal from "@/components/AddToPantryModal";
import PricingModal from "@/components/PricingModal";

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", quantity: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch pantry items
  const {
    loading: loadingItems,
    data: itemsData,
    fn: fetchItems,
  } = useFetch(getPantryItems);

  // Delete item
  const {
    loading: deleting,
    data: deleteData,
    fn: deleteItem,
  } = useFetch(deletePantryItem);

  // Update item
  const {
    loading: updating,
    data: updateData,
    fn: updateItem,
  } = useFetch(updatePantryItem);

  const loadAllItems = () => {
    fetchItems();
  };

  // Load items on mount & listen for local updates
  useEffect(() => {
    loadAllItems();
    const handleLocalUpdate = () => loadAllItems();
    window.addEventListener("smartplate_pantry_updated", handleLocalUpdate);
    return () => window.removeEventListener("smartplate_pantry_updated", handleLocalUpdate);
  }, []);

  // Update items when data arrives
  useEffect(() => {
    const localSaved = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]") : [];
    const serverItems = itemsData?.items || [];
    const combined = [...localSaved, ...serverItems];
    setItems(combined);
  }, [itemsData]);

  // Refresh after delete
  useEffect(() => {
    if (deleteData?.success && !deleting) {
      toast.success("Item removed from pantry");
      fetchItems();
    }
  }, [deleteData]);

  // Refresh after update
  useEffect(() => {
    if (updateData?.success) {
      toast.success("Item updated successfully");
      setEditingId(null);
      fetchItems();
    }
  }, [updateData]);

  // Handle delete
  const handleDelete = async (itemId) => {
    if (typeof itemId === "string" && itemId.startsWith("local_")) {
      const localSaved = JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]");
      const filtered = localSaved.filter((i) => i.documentId !== itemId);
      localStorage.setItem("smartplate_local_pantry", JSON.stringify(filtered));
      setItems((prev) => prev.filter((i) => i.documentId !== itemId));
      toast.success("Item removed from pantry");
      return;
    }
    const formData = new FormData();
    formData.append("itemId", itemId);
    await deleteItem(formData);
  };

  // Start editing
  const startEdit = (item) => {
    setEditingId(item.documentId);
    setEditValues({
      name: item.name,
      quantity: item.quantity,
    });
  };

  // Save edit
  const saveEdit = async () => {
    if (typeof editingId === "string" && editingId.startsWith("local_")) {
      const localSaved = JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]");
      const updated = localSaved.map((i) =>
        i.documentId === editingId ? { ...i, name: editValues.name, quantity: editValues.quantity } : i
      );
      localStorage.setItem("smartplate_local_pantry", JSON.stringify(updated));
      setItems((prev) =>
        prev.map((i) => (i.documentId === editingId ? { ...i, name: editValues.name, quantity: editValues.quantity } : i))
      );
      toast.success("Item updated successfully");
      setEditingId(null);
      return;
    }
    const formData = new FormData();
    formData.append("itemId", editingId);
    formData.append("name", editValues.name);
    formData.append("quantity", editValues.quantity);
    await updateItem(formData);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", quantity: "" });
  };

  // Handle modal success (refresh items)
  const handleModalSuccess = () => {
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pt-20 pb-24 md:pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Top Title Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-orange-100/80 rounded-2xl border border-orange-200 text-[#F24E1E] shrink-0">
                <Package className="w-10 h-10 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 tracking-tight">
                  My Pantry
                </h1>
                <p className="text-stone-500 font-light text-sm md:text-base mt-0.5">
                  Manage your ingredients and discover what you can cook
                </p>
              </div>
            </div>

            {/* Desktop Add to Pantry Button */}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex bg-[#F24E1E] hover:bg-[#d83e12] text-white font-bold rounded-xl px-6 py-6 text-base gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              Add to Pantry
            </Button>
          </div>

          {/* Mobile Add Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden w-full bg-[#F24E1E] hover:bg-[#d83e12] text-white font-bold rounded-xl py-6 gap-2 mb-4 text-base shadow-sm"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            Add to Pantry
          </Button>

          {/* Pro Plan Scan Badge */}
          {itemsData?.scansLimit !== undefined && (
            <div className="bg-white py-2 px-3.5 border border-stone-200 rounded-xl inline-flex items-center gap-2 text-xs sm:text-sm font-medium shadow-xs">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <div>
                {itemsData.scansLimit === "unlimited" ? (
                  <>
                    <span className="font-bold text-green-600">∞</span>
                    <span className="text-stone-600 font-bold ml-1">
                      Unlimited AI scans (Pro Plan)
                    </span>
                  </>
                ) : (
                  <PricingModal>
                    <span className="text-stone-600 hover:text-orange-600 font-medium cursor-pointer">
                      Upgrade to Pro for unlimited Pantry scans
                    </span>
                  </PricingModal>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Green Recipe Finder Banner (Visible when ingredients exist) */}
        {items.length > 0 && (
          <Link href="/pantry/recipes" className="block mb-8">
            <div className="bg-[#00B050] hover:bg-[#009b46] text-white p-5 md:p-6 rounded-2xl transition-all cursor-pointer shadow-md group">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl border border-white/30 group-hover:bg-white/30 transition-colors shrink-0">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl md:text-2xl text-white tracking-tight">
                      What Can I Cook Today?
                    </h3>
                    <p className="text-green-50 text-xs md:text-sm font-light mt-0.5">
                      Get AI-powered recipe suggestions from your {items.length}{" "}
                      {items.length === 1 ? "ingredient" : "ingredients"}
                    </p>
                  </div>
                </div>

                <Badge className="bg-white/25 text-white border border-white/40 font-bold text-xs px-3 py-1 uppercase tracking-wider rounded-full shrink-0">
                  {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
                </Badge>
              </div>
            </div>
          </Link>
        )}

        {/* Loading State */}
        {loadingItems && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-200">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
            <p className="text-stone-500 font-medium">Loading your pantry...</p>
          </div>
        )}

        {/* Pantry Items Grid */}
        {!loadingItems && items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-stone-900">
                Your Ingredients
              </h2>
              <Badge
                variant="outline"
                className="text-stone-600 border-stone-300 font-bold text-xs px-3 py-1 uppercase tracking-wider rounded-full"
              >
                {items.length} {items.length === 1 ? "ITEM" : "ITEMS"}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.documentId}
                  className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-orange-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {editingId === item.documentId ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) =>
                          setEditValues({ ...editValues, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-orange-600 text-sm font-bold"
                        placeholder="Ingredient name"
                      />
                      <input
                        type="text"
                        value={editValues.quantity}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            quantity: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-orange-600 text-sm"
                        placeholder="Quantity"
                      />
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={updating}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                        >
                          {updating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={updating}
                          className="flex-1 border-stone-300 hover:bg-stone-100 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-extrabold text-xl text-stone-900 leading-snug">
                            {item.name}
                          </h3>
                          <p className="text-stone-500 text-sm font-medium mt-0.5">
                            {item.quantity}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.documentId)}
                            disabled={deleting}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-400 font-medium pt-2 border-t border-stone-100">
                        Added {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State matching screenshot 3 */}
        {!loadingItems && items.length === 0 && (
          <div className="bg-white p-12 text-center border-2 border-dashed border-stone-200 rounded-3xl space-y-4">
            <div className="bg-orange-50 w-20 h-20 border border-orange-200 rounded-2xl flex items-center justify-center mx-auto text-[#F24E1E]">
              <Package className="w-10 h-10 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-stone-900">
                Your Pantry is Empty
              </h3>
              <p className="text-stone-500 text-sm md:text-base max-w-md mx-auto font-light mt-1">
                Start by scanning your pantry with AI or adding ingredients
                manually to discover amazing recipes!
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#F24E1E] hover:bg-[#d83e12] text-white font-bold rounded-xl px-8 py-6 text-base gap-2 shadow-sm"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                Add Your First Item
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add to Pantry Modal */}
      <AddToPantryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}