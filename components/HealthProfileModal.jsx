"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Check, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const DIET_TYPES = [
  { id: "Pure Veg", label: "🥦 Pure Veg (Shakahari)", desc: "No meat, fish, or eggs" },
  { id: "Non-Veg", label: "🍗 Non-Vegetarian", desc: "Includes meat, poultry, seafood" },
  { id: "Jain", label: "🪷 Jain", desc: "No root vegetables, onion, garlic, or meat" },
  { id: "Vegan", label: "🌱 Plant-Based (Vegan)", desc: "100% plant-based, no dairy" },
  { id: "Eggetarian", label: "🥚 Eggetarian", desc: "Vegetarian plus eggs" },
  { id: "General", label: "🍽️ Flexible / General", desc: "No specific dietary rules" },
];

export const HEALTH_GOALS = [
  { id: "Weight Loss", label: "⚖️ Weight Loss / Calorie Deficit" },
  { id: "Muscle Gain", label: "💪 Muscle Building & High Protein" },
  { id: "Diabetes Management", label: "🩸 Diabetes & Blood Sugar Control" },
  { id: "PCOS Friendly", label: "🌸 PCOS / PCOD Balance" },
  { id: "Low Carb", label: "🥑 Low Carb / Keto" },
  { id: "Heart Health", label: "🫀 Heart & BP Care" },
  { id: "Balanced Nutrition", label: "✨ General Wellness & Vitality" },
];

export const ALLERGEN_OPTIONS = [
  "Dairy / Lactose",
  "Gluten (Wheat/Maida)",
  "Peanuts",
  "Tree Nuts (Cashews/Almonds)",
  "Mustard / Seeds",
  "Soy",
  "Eggs",
  "Shellfish",
];

export function getHealthProfile() {
  if (typeof window === "undefined") return { dietType: "Pure Veg", healthGoal: "Balanced Nutrition", allergens: [] };
  const saved = localStorage.getItem("smartplate_health_profile");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load health profile:", e);
    }
  }
  return { dietType: "Pure Veg", healthGoal: "Balanced Nutrition", allergens: [] };
}

export default function HealthProfileModal({ children }) {
  const [open, setOpen] = useState(false);
  const [dietType, setDietType] = useState("Pure Veg");
  const [healthGoal, setHealthGoal] = useState("Balanced Nutrition");
  const [allergens, setAllergens] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (open) {
      const profile = getHealthProfile();
      if (mounted) {
        setDietType(profile.dietType || "Pure Veg");
        setHealthGoal(profile.healthGoal || "Balanced Nutrition");
        setAllergens(profile.allergens || []);
      }
    }
    return () => {
      mounted = false;
    };
  }, [open]);

  const toggleDietType = (id) => {
    setDietType((prev) => (prev === id ? "" : id));
  };

  const toggleHealthGoal = (id) => {
    setHealthGoal((prev) => (prev === id ? "" : id));
  };

  const toggleAllergen = (item) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    const profile = { dietType, healthGoal, allergens };
    localStorage.setItem("smartplate_health_profile", JSON.stringify(profile));
    window.dispatchEvent(new Event("smartplate_profile_updated"));
    toast.success("Health & Dietary Profile Saved!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 rounded-full flex items-center gap-1 font-semibold text-xs sm:text-sm px-2 sm:px-3 shrink-0">
            <HeartPulse className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="hidden md:inline">Health Profile</span>
            <span className="hidden sm:inline md:hidden">Health</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-50 border-2 border-stone-900 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-stone-900">
            <Sparkles className="w-6 h-6 text-orange-600" />
            Personalized Health & Dietary Profile
          </DialogTitle>
          <p className="text-sm text-stone-600 font-light">
            Tailor AI meal recognition, macro targets, and allergen warnings specifically to your preferences. Click any selected item again to deselect it.
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Dietary Type */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-orange-600" />
                1. Dietary Preference
              </h4>
              {dietType && (
                <button
                  type="button"
                  onClick={() => setDietType("")}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold underline"
                >
                  Deselect Diet
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DIET_TYPES.map((dt) => {
                const isSelected = dietType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => toggleDietType(dt.id)}
                    className={`text-left p-3 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-orange-500 text-white border-stone-900 shadow-md"
                        : "bg-white text-stone-800 border-stone-200 hover:border-orange-400"
                    }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      {dt.label}
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs mt-1 ${isSelected ? "text-orange-100" : "text-stone-500"}`}>
                      {dt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Goal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-500" />
                2. Primary Health Goal
              </h4>
              {healthGoal && (
                <button
                  type="button"
                  onClick={() => setHealthGoal("")}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold underline"
                >
                  Deselect Goal
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEALTH_GOALS.map((hg) => {
                const isSelected = healthGoal === hg.id;
                return (
                  <button
                    key={hg.id}
                    type="button"
                    onClick={() => toggleHealthGoal(hg.id)}
                    className={`p-2.5 px-3 rounded-xl border-2 text-left text-sm font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-800 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <span>{hg.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                3. Known Allergens & Intolerances
              </h4>
              {allergens.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAllergens([])}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold underline"
                >
                  Deselect All Allergens
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((alg) => {
                const isSelected = allergens.includes(alg);
                return (
                  <Badge
                    key={alg}
                    onClick={() => toggleAllergen(alg)}
                    className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${
                      isSelected
                        ? "bg-red-600 text-white border-red-800 shadow-sm"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    {isSelected ? `✓ ${alg}` : `+ ${alg}`}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Save & Reset Actions */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDietType("");
                setHealthGoal("");
                setAllergens([]);
                toast.info("Cleared all selections");
              }}
              className="border-stone-300 hover:bg-stone-100 rounded-full text-xs font-bold text-stone-600"
            >
              Clear All Selections
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-full text-base"
            >
              Save Profile & Apply to AI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
