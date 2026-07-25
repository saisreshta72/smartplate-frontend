"use client";

import useFetch from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClockLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Lightbulb,  CheckCircle2, ChefHat,  Bookmark,  Download, BookmarkCheck, Users,  Flame, AlertCircle, Loader2, Package } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense } from "react";
import { RecipePDF } from "@/components/RecipePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import {
  getOrGenerateRecipe,
  saveRecipeToCollection,
  removeRecipeFromCollection,
} from "@/actions/recipe.actions";
import { getPantryItems } from "@/actions/pantry.actions";

function RecipeContent(){
const searchParams = useSearchParams();
  const recipeName = searchParams.get("cook");
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [recipeId, setRecipeId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [pantryItemNames, setPantryItemNames] = useState([]);

  // Load Pantry Items for cross-referencing
  useEffect(() => {
    async function loadPantry() {
      try {
        const res = await getPantryItems();
        const serverNames = (res?.items || []).map((i) => i.name.toLowerCase());
        const localItems =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]")
            : [];
        const localNames = localItems.map((i) => i.name.toLowerCase());
        setPantryItemNames([...serverNames, ...localNames]);
      } catch (e) {
        const localItems =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("smartplate_local_pantry") || "[]")
            : [];
        setPantryItemNames(localItems.map((i) => i.name.toLowerCase()));
      }
    }
    loadPantry();
  }, []);

  const isInPantry = (ingName) => {
    if (!ingName || pantryItemNames.length === 0) return false;
    const nameLower = ingName.toLowerCase();
    return pantryItemNames.some(
      (p) => p.includes(nameLower) || nameLower.includes(p)
    );
  };


    // Get or generate recipe
  const {
    loading: loadingRecipe,
    data: recipeData,
    fn: fetchRecipe,
  } = useFetch(getOrGenerateRecipe);
  console.log(recipeData)

// Save to collection
  const {
    loading: saving,
    data: saveData,
    fn: saveToCollection,
  } = useFetch(saveRecipeToCollection);

  // Remove from collection
  const {
    loading: removing,
    data: removeData,
    fn: removeFromCollection,
  } = useFetch(removeRecipeFromCollection);

    // Handle save success
  useEffect(() => {
    if (saveData?.success) {
      if (saveData.alreadySaved) {
        toast.info("Recipe is already in your collection");
      } else {
        setIsSaved(true);
        toast.success("Recipe saved to your collection!");
      }
    }
  }, [saveData]);

  // Handle remove success
  useEffect(() => {
    if (removeData?.success) {
      setIsSaved(false);
      toast.success("Recipe removed from collection");
    }
  }, [removeData]);

 // Toggle save/unsave
  const handleToggleSave = async () => {
    if (!recipeId) return;

    const formData = new FormData();
    formData.append("recipeId", recipeId);

    if (isSaved) {
      await removeFromCollection(formData);
    } else {
      await saveToCollection(formData);
    }
  };

// Fetch recipe on mount
  useEffect(() => {
    if (recipeName && !recipe) {
      const formData = new FormData();
      formData.append("recipeName", recipeName);
      fetchRecipe(formData);
    }
  }, [recipeName]);

  // Update recipe when data arrives
  useEffect(() => {
    if (recipeData?.success) {
      setRecipe(recipeData.recipe);
      setRecipeId(recipeData.recipeId);
      setIsSaved(recipeData.isSaved);

      if (recipeData.fromDatabase) {
        toast.success("Recipe loaded from database");
      } else {
        toast.success("New recipe generated and saved!");
      }
    }
  }, [recipeData]);

// No recipe name in URL
  if (!recipeName) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <div className="bg-orange-50 w-20 h-20 border-2 border-orange-200 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            No recipe specified
          </h2>
          <p className="text-stone-600 mb-6 font-light">
            Please select a recipe from the dashboard
          </p>
          <Link href="/dashboard">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

 // Loading state
  if (loadingRecipe === null || loadingRecipe) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16 ">
        <div className="container mx-auto max-w-4xl ">
          <div className="text-center py-20">
            <ClockLoader className="mx-auto mb-6" color="#dc6300" />
            <h2 className="text-3xl font-bold text-stone-900 mb-2 tracking-tight">
              Preparing Your Recipe
            </h2>
            <p className="text-stone-600 font-light">
              Our AI chef is crafting detailed instructions for{" "}
              <span className="font-bold text-orange-600">{recipeName}</span>
              ...
            </p>
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-sm text-stone-500">
                <div className="flex-1 h-1 bg-stone-200 overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-orange-600 animate-slow-fill" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

// Error state
  if (loadingRecipe === false && !recipe) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <div className="bg-red-50 w-20 h-20 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Failed to load recipe
          </h2>
          <p className="text-stone-600 mb-6 font-light">
            Something went wrong while loading the recipe. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-2 border-stone-900 hover:bg-stone-900 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

   // Main recipe view
  return(
    <div className="min-h-screen bg-stone-50 pt-20 pb-24 md:pb-16 px-4">
    <div className="container mx-auto max-w-4xl">
    <div className="mb-8">
      <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

{/* Title Section */}
          <div className="bg-white p-8 md:p-10 border-2 border-stone-200 mb-6">
            {/* Badges */}
            {recipe.imageUrl && (
              <div className="relative w-full h-72 overflow-hidden mb-7">
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              </div>
            )}

       <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant="outline"
                className="text-orange-600 border-2 border-orange-200 capitalize"
              >
                {recipe.cuisine}
              </Badge>
              <Badge
                variant="outline"
                className="text-stone-600 border-2 border-stone-200 capitalize"
              >
                {recipe.category}
              </Badge>
            </div>

{/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
              {recipe.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-stone-600 mb-6 font-light">
              {recipe.description}
            </p>

   {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-stone-600 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">
                  {parseInt(recipe.prepTime) + parseInt(recipe.cookTime)} mins
                  total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span className="font-medium">{recipe.servings} servings</span>
              </div>
              {recipe.nutrition?.calories && (
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">
                    {recipe.nutrition.calories} cal/serving
                  </span>
                </div>
              )}
            </div>

<div  className="flex flex-wrap gap-3">
     <Button
                onClick={handleToggleSave}
                disabled={saving || removing}
                className={`${
                  isSaved
                    ? "bg-green-600 hover:bg-green-700 border-2 border-green-700"
                    : "bg-orange-600 hover:bg-orange-700 border-2 border-orange-700"
                } text-white gap-2 transition-all`}
              >
                {saving || removing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {saving ? "Saving..." : "Removing..."}
                  </>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Saved to Collection
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save to Collection
                  </>
                )}
              </Button>

              {/*PDF Download Button*/}
 <PDFDownloadLink
                document={<RecipePDF recipe={recipe} />}
                fileName={`${recipe.title
                  .replace(/\s+/g, "-")
                  .toLowerCase()}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    variant="outline"
                    className="border-2 border-orange-600 text-orange-700 hover:bg-orange-50 gap-2"
                    disabled={loading}
                  >
                    <Download className="w-4 h-4" />
                    {loading ? "Preparing PDF..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>



        </div>
          </div>
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
         {/* Left Column - Ingredients & Nutrition */}
         <div className="lg:col-span-1 space-y-6">
       <div className="bg-white p-4 sm:p-6 border-2 border-stone-200 lg:sticky lg:top-24 overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 shrink-0" />
            Ingredients
          </h2>
          {pantryItemNames.length > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[11px] font-bold gap-1 shrink-0">
              <Package className="w-3 h-3" />
              Pantry Active
            </Badge>
          )}
        </div>

        {/* Pantry Stock Summary Banner */}
        {pantryItemNames.length > 0 && recipe.ingredients && (
          <div className="mb-5 p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between text-xs font-medium text-stone-600 gap-1">
            <span>Pantry Availability:</span>
            <span className="font-extrabold text-orange-600 shrink-0">
              {recipe.ingredients.filter((ing) => isInPantry(ing.item)).length} of {recipe.ingredients.length} in stock
            </span>
          </div>
        )}

      {/* Group by category */}
              {Object.entries(
                recipe.ingredients.reduce((acc, ing) => {
                  const cat = ing.category || "Other";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(ing);
                  return acc;
                }, {})
              ).map(([category, items]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-500 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((ingredient, i) => {
                      const inPantry = isInPantry(ingredient.item);
                      return (
                        <li
                          key={i}
                          className="flex items-start justify-between py-2.5 border-b border-stone-100 last:border-0 gap-2"
                        >
                          <div className="flex-1 min-w-0 pr-1">
                            <span className="text-stone-800 font-medium block text-xs sm:text-sm break-words leading-tight">
                              {ingredient.item}
                            </span>
                            <span className="font-bold text-orange-600 text-xs mt-0.5 block">
                              {ingredient.amount}
                            </span>
                          </div>
                          {inPantry ? (
                            <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border border-green-300 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                              In Pantry ✓
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-stone-50 text-stone-500 border border-stone-200 text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">
                              To Buy 🛒
                            </Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}



              {/* Nutrition Info */}
              {recipe.nutrition && (
                <div className="mt-6 pt-6 border-t-2 border-stone-200">
                  <h3 className="font-bold text-stone-900 mb-3 uppercase tracking-wide text-sm flex items-center gap-2">
                    Nutrition (per serving)
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 p-3 text-center border-2 border-orange-100">
                        <div className="text-2xl font-bold text-orange-600">
                          {recipe.nutrition.calories}
                        </div>
                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                          Calories
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                        <div className="text-2xl font-bold text-stone-900">
                          {recipe.nutrition.protein}
                        </div>
                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                          Protein
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                        <div className="text-2xl font-bold text-stone-900">
                          {recipe.nutrition.carbs}
                        </div>
                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                          Carbs
                        </div>
                      </div>

                      <div className="bg-stone-50 p-3 text-center border-2 border-stone-100">
                        <div className="text-2xl font-bold text-stone-900">
                          {recipe.nutrition.fat}
                        </div>
                        <div className="text-xs text-stone-500 font-bold uppercase tracking-wide">
                          Fat
                        </div>
                      </div>
                    </div>
                </div>
              )}
       </div>
         </div>
          {/* Right Column - Instructions & Tips */}
          <div className="lg:col-span-2 space-y-6">
            <div  className="bg-white p-8 border-2 border-stone-200">
                 <h2 className="text-2xl font-bold text-stone-900 mb-6">
                Step-by-Step Instructions
              </h2>

            <div>
                 {recipe.instructions.map((step, index) => (
                  <div
                    key={step.step}
                    className={`relative pl-12 pb-8 ${
                      index !== recipe.instructions.length - 1
                        ? "border-l-2 border-orange-300 ml-5"
                        : "ml-5"
                    }`}
                    >
         {/* Step Number */}
                    <div className="absolute -left-5 top-0 w-10 h-10 bg-orange-600 text-white flex items-center justify-center font-bold border-2 border-orange-700">
                      {step.step}
                    </div>    

                    <div>
                        <h3 className="font-bold text-lg text-stone-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-stone-700 font-light mb-3">
                        {step.instruction}
                      </p>
                          {step.tip && (
                        <div className="bg-orange-50 border-l-4 border-orange-600 p-4">
                          <p className="text-sm text-orange-900 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 fill-orange-600" />
                            <span>
                              <strong className="font-bold">Pro Tip:</strong>{" "}
                              {step.tip}
                            </span>
                          </p>
                        </div>
                      )}
                      </div>            
                    </div>
                ))}
            </div>

  <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
    <div className="flex items-start gap-3">
         <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">
                      You&apos;re all done!
                    </h3>
                    <p className="text-sm text-green-800 font-light">
                      Plate your masterpiece and enjoy your delicious{" "}
                      {recipe.title}!
                    </p>
                  </div>
               </div>
             </div>
            </div>

{/* General Tips */}
            {recipe.tips && recipe.tips.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 border-2 border-orange-200">
                <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-orange-600 fill-orange-600" />
                  Chef&apos;s Tips & Tricks
                  {!recipeData.isPro && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                      PRO
                    </span>
                  )}
                </h2>
                  <ul className="space-y-3">
                    {recipe.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-stone-700"
                      >
                        <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="font-light">{tip}</span>
                      </li>
                    ))}
                  </ul>
              </div>
            )}

 {/* Substitutions */}
            {recipe.substitutions && recipe.substitutions.length > 0 && (
              <div className="bg-white p-8 border-2 border-stone-200">
                <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                  Ingredient Substitutions
                  {!recipeData.isPro && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                      PRO
                    </span>
                  )}
                </h2>

                <p className="text-stone-600 mb-6 text-sm font-light">
                  Don&apos;t have everything? Here are some alternatives you can
                  use:
                </p>
                  <div className="space-y-4">
                    {recipe.substitutions.map((sub, i) => (
                      <div
                        key={i}
                        className="border-b-2 border-stone-100 pb-4 last:border-0 last:pb-0"
                      >
                        <h3 className="font-bold text-stone-900 mb-2">
                          Instead of{" "}
                          <span className="text-orange-600">
                            {sub.original}
                          </span>
                          :
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {sub.alternatives.map((alt, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="text-stone-600 border-2 border-stone-200"
                            >
                              {alt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
              
              </div>
            )}



          </div>
          </div>
        </div>
    </div>
  
  )
}

export default function RecipePage () {
  return ( 
    <Suspense
    fallback={
         <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
    <div className="container mx-auto max-w-4xl text-center py-20">
        <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-6"/>
        <p className="text-stone-600">Loading recipe...</p>
    </div>
  </div>
    }
    >
        <RecipeContent/>
    </Suspense>
 
  )
}


