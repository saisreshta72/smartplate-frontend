"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Upload,
  Sparkles,
  Flame,
  Dumbbell,
  Wheat,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  HeartPulse,
  Award,
  ChevronRight,
  Info,
  Edit3,
  ChefHat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analyzeMealImage, analyzeMealText } from "@/actions/meal.actions";
import HealthProfileModal, { getHealthProfile } from "@/components/HealthProfileModal";
import { toast } from "sonner";

export default function MealScannerPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userProfile, setUserProfile] = useState({ dietType: "Pure Veg", healthGoal: "Balanced Nutrition", allergens: [] });

  const loadProfile = () => {
    setUserProfile(getHealthProfile());
  };

  useEffect(() => {
    loadProfile();
    const handleUpdate = () => loadProfile();
    window.addEventListener("smartplate_profile_updated", handleUpdate);
    return () => window.removeEventListener("smartplate_profile_updated", handleUpdate);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|jfif|gif|bmp)$/i.test(file.name);

    if (isImage) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    } else {
      toast.error("Please drop a valid image file (JPG, PNG, WebP)");
    }
  };

  const runAnalysis = async (imageFile = selectedImage) => {
    if (!imageFile) {
      toast.error("Please upload or capture a meal photo first");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Analyzing meal with AI Vision...");

    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await analyzeMealImage(formData, userProfile);

    setIsAnalyzing(false);
    if (res.success) {
      setAnalysisResult(res.data);
      toast.success("Meal analysis complete!");
    } else {
      toast.error(res.error || "Failed to analyze meal image");
    }
  };

  const runTextAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) {
      toast.error("Please enter ingredient or dish items");
      return;
    }

    setIsAnalyzing(true);
    toast.info("Generating recipes & nutrition analysis...");

    const res = await analyzeMealText(manualInput, userProfile);

    setIsAnalyzing(false);
    if (res.success) {
      setAnalysisResult(res.data);
      toast.success("Recipe & nutrition analysis ready!");
    } else {
      toast.error(res.error || "Failed to analyze items");
    }
  };

  // Quick Sample Demo Image handler
  const loadSampleImage = async (sampleName, sampleUrl) => {
    try {
      toast.info(`Loading sample: ${sampleName}...`);
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], `${sampleName}.jpg`, { type: "image/jpeg" });
      setSelectedImage(file);
      setPreviewUrl(sampleUrl);
      setAnalysisResult(null);
      await runAnalysis(file);
    } catch (err) {
      console.error("Failed to load sample image:", err);
      toast.error("Failed to load sample image");
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setManualInput("");
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pt-20 pb-24 md:pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Upload / Capture Section */}
        {!analysisResult && !isAnalyzing && (
          <div className="space-y-4">
            <Card
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-4 border-dashed border-stone-300 hover:border-orange-500 bg-white rounded-3xl p-8 text-center transition-all py-10 cursor-pointer shadow-sm relative overflow-hidden"
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-stone-900 max-w-lg mx-auto">
                    <Image src={previewUrl} alt="Meal Preview" fill className="object-cover" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => runAnalysis()} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-full text-base">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Nutrition & Allergens
                    </Button>
                    <Button onClick={resetAll} variant="outline" className="border-2 border-stone-900 rounded-full px-6 py-6 font-bold">
                      Change Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto border-2 border-orange-300">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">Snap or Upload Meal Photo</h3>
                    <p className="text-stone-500 text-sm mt-1 max-w-md mx-auto">
                      Drag and drop your food photo here, or use your camera. Supports Thalis, Biryani, Curries, Dosa, Salads, & Snacks.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <label className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-3.5 rounded-full text-sm cursor-pointer flex items-center gap-2 shadow">
                      <Upload className="w-4 h-4" />
                      Choose Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    <label className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3.5 rounded-full text-sm cursor-pointer flex items-center gap-2 shadow md:hidden">
                      <Camera className="w-4 h-4" />
                      Take Photo
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>
              )}
            </Card>

            {/* Type Ingredients / Dish Name Manually */}
            {!previewUrl && (
              <Card className="border-4 border-stone-900 bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center border border-orange-300 shrink-0">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">Type Ingredients or Dish Manually</h3>
                    <p className="text-stone-500 text-xs sm:text-sm font-light">
                      Don&apos;t have a photo? Type your ingredients or dish name below to get recipes & complete nutrition analysis!
                    </p>
                  </div>
                </div>

                <form onSubmit={runTextAnalysis} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. Paneer, Tomatoes, Garlic, Naan or Chicken Curry with Rice"
                    className="flex-1 px-5 py-4 border-2 border-stone-300 focus:border-orange-500 rounded-2xl outline-none font-medium text-sm text-stone-900 bg-stone-50"
                  />
                  <Button
                    type="submit"
                    disabled={isAnalyzing || !manualInput.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-4 rounded-2xl text-sm gap-2 shrink-0 shadow h-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Recipes & Nutrition
                  </Button>
                </form>
              </Card>
            )}

            {/* Quick Demo Samples */}
            {!previewUrl && (
              <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-orange-600" />
                  Try a Quick Sample Indian Meal Demo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => loadSampleImage("Paneer Butter Masala", "/pasta-dish.png")}
                    className="p-3 bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-400 rounded-xl text-left transition flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg bg-orange-200 overflow-hidden relative shrink-0 border border-stone-900">
                      <Image src="/pasta-dish.png" alt="Sample 1" fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">North Indian Meal</h4>
                      <p className="text-xs text-stone-500">Paneer Gravy with Rice & Bread</p>
                    </div>
                  </button>

                  <button
                    onClick={() => loadSampleImage("South Indian Meal", "/pasta-dish.png")}
                    className="p-3 bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-400 rounded-xl text-left transition flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg bg-amber-200 overflow-hidden relative shrink-0 border border-stone-900">
                      <Image src="/pasta-dish.png" alt="Sample 2" fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Traditional Meal Plate</h4>
                      <p className="text-xs text-stone-500">Curry, Dal, Grains & Side</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="border-4 border-stone-900 bg-white rounded-3xl p-12 text-center space-y-6">
            <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">AI Vision Analyzing Meal...</h3>
              <p className="text-stone-500 text-sm mt-2 max-w-sm mx-auto">
                Identifying food items, calculating Indian portion sizes, measuring macros & checking allergen warnings.
              </p>
            </div>
          </Card>
        )}

        {/* Analysis Results Screen */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6">
            {/* Header Result Card */}
            <Card className="border-4 border-stone-900 bg-stone-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden py-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="bg-orange-500 text-white font-bold text-xs uppercase tracking-wide">
                      {analysisResult.cuisine || "Indian Cuisine"}
                    </Badge>
                    <Badge variant="outline" className="border-stone-700 text-stone-300 font-mono text-xs">
                      Confidence: {Math.round((analysisResult.confidenceScore || 0.95) * 100)}%
                    </Badge>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-50">{analysisResult.dishName}</h2>
                </div>

                {/* Health Score Gauge */}
                <div className="bg-stone-800 border-2 border-stone-700 rounded-2xl p-4 text-center shrink-0 min-w-[130px]">
                  <div className="text-3xl font-extrabold text-orange-400">{analysisResult.healthScore}</div>
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mt-0.5">
                    Health Score / 100
                  </div>
                </div>
              </div>
            </Card>

            {/* Allergen Warning Banner */}
            {analysisResult.allergenWarnings?.length > 0 && (
              <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900 text-base">Allergen & Sensitivity Alert</h4>
                  <ul className="mt-1 text-sm text-red-700 space-y-1 font-medium list-disc list-inside">
                    {analysisResult.allergenWarnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Total Nutritional Macros Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="border-2 border-stone-900 bg-orange-500 text-white rounded-2xl p-4 text-center">
                <div className="text-xs uppercase tracking-wider opacity-90 font-bold flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Calories
                </div>
                <div className="text-2xl sm:text-3xl font-black mt-1">
                  {analysisResult.totalNutrition?.calories} <span className="text-xs font-normal">kcal</span>
                </div>
              </Card>

              <Card className="border-2 border-stone-900 bg-white rounded-2xl p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-bold flex items-center justify-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-blue-600" /> Protein
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  {analysisResult.totalNutrition?.protein} <span className="text-xs font-normal text-stone-500">g</span>
                </div>
              </Card>

              <Card className="border-2 border-stone-900 bg-white rounded-2xl p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-bold flex items-center justify-center gap-1">
                  <Wheat className="w-3.5 h-3.5 text-amber-600" /> Carbs
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  {analysisResult.totalNutrition?.carbs} <span className="text-xs font-normal text-stone-500">g</span>
                </div>
              </Card>

              <Card className="border-2 border-stone-900 bg-white rounded-2xl p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-bold flex items-center justify-center gap-1">
                  💧 Fats
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  {analysisResult.totalNutrition?.fats} <span className="text-xs font-normal text-stone-500">g</span>
                </div>
              </Card>

              <Card className="border-2 border-stone-900 bg-white rounded-2xl p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-stone-500 font-bold flex items-center justify-center gap-1">
                  🥗 Fiber
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  {analysisResult.totalNutrition?.fiber} <span className="text-xs font-normal text-stone-500">g</span>
                </div>
              </Card>

              <Card className="border-2 border-stone-900 bg-amber-50 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                <div className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                  Glycemic Index
                </div>
                <div className="text-xl font-black text-amber-900 mt-1">
                  {analysisResult.totalNutrition?.glycemicIndex || "Medium"}
                </div>
              </Card>
            </div>

            {/* Food Item Sizing & Portion Breakdown */}
            <Card className="border-2 border-stone-900 bg-white rounded-2xl p-6">
              <h3 className="text-xl font-extrabold text-stone-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Food Items & Portion Breakdown
              </h3>
              <div className="divide-y divide-stone-200">
                {analysisResult.items?.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{item.name}</h4>
                      <p className="text-xs text-stone-500">Estimated Portion: <span className="font-bold text-stone-700">{item.portion}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-800 font-bold">
                        {item.calories} kcal
                      </Badge>
                      <Badge variant="outline" className="bg-stone-100 text-stone-700">P: {item.protein}g</Badge>
                      <Badge variant="outline" className="bg-stone-100 text-stone-700">C: {item.carbs}g</Badge>
                      <Badge variant="outline" className="bg-stone-100 text-stone-700">F: {item.fats}g</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Health Coach Recommendations */}
            <Card className="border-2 border-stone-900 bg-orange-50/70 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-orange-900 font-extrabold text-lg">
                <HeartPulse className="w-5 h-5 text-orange-600" />
                Personalized AI Health Coach Advice ({userProfile.healthGoal})
              </div>
              <ul className="space-y-2">
                {analysisResult.healthRecommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-800 text-sm font-light">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* AI Recommended Recipes From Scanned Photo */}
            {analysisResult.recipesThatCanBeMade?.length > 0 && (
              <Card className="border-2 border-stone-900 bg-white rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-extrabold text-stone-900">
                      Recipes You Can Cook With These Items
                    </h3>
                  </div>
                  <Badge className="bg-orange-600 text-white font-bold text-xs uppercase">
                    {analysisResult.recipesThatCanBeMade.length} AI Recipes
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysisResult.recipesThatCanBeMade.map((recipe, index) => (
                    <div
                      key={index}
                      className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-5 hover:border-orange-500 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-lg text-stone-900 leading-snug">
                            {recipe.title}
                          </h4>
                        </div>
                        <p className="text-xs text-stone-600 font-light">
                          {recipe.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                            ⏱️ Prep: {recipe.prepTime}
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                            🔥 Cook: {recipe.cookTime}
                          </Badge>
                          <Badge variant="outline" className="bg-stone-100 text-stone-700">
                            🍽️ {recipe.servings}
                          </Badge>
                        </div>

                        {/* Ingredients */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                            Ingredients Needed:
                          </span>
                          <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                            {recipe.ingredients?.slice(0, 4).map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                            {recipe.ingredients?.length > 4 && (
                              <li className="text-stone-400 italic font-normal">
                                + {recipe.ingredients.length - 4} more items
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Step-by-step instructions preview */}
                        {recipe.instructions?.length > 0 && (
                          <div className="pt-2 border-t border-stone-200">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                              Step-by-Step Cooking Steps:
                            </span>
                            <ol className="text-xs text-stone-800 space-y-1 list-decimal list-inside font-light">
                              {recipe.instructions.map((step, sIdx) => (
                                <li key={sIdx} className="leading-relaxed">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-2">
                        <Link href={`/recipe?cook=${encodeURIComponent(recipe.title)}`}>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs">
                            <ChefHat className="w-4 h-4" /> Start Cooking Recipe
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Reset / Scan Another Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={resetAll} size="lg" className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-8 py-6 text-base font-bold flex gap-2">
                <RotateCcw className="w-4 h-4" /> Scan Another Meal
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
