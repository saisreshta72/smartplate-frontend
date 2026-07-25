import React from "react";
import { Globe, ArrowRight, Flame, Package, ChefHat, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getRecipeOfTheDay,
  getCategories,
  getAreas,
} from "@/actions/mealdb.actions";
import { getCategoryEmoji, getCountryFlag, allowedCuisines } from "@/lib/data";

const DashboardPage = async () => {
  const recipeData = await getRecipeOfTheDay();
  const categoriesData = await getCategories();
  const areasData = await getAreas();

  const recipeOfTheDay = recipeData?.recipe;
  const categories = categoriesData?.categories || [];
  const areas = [...new Map((areasData?.areas || []).map(a => [a.strArea, a])).values()];
  const filteredAreas = areas.filter((area) => allowedCuisines.includes(area.strArea));

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-24 md:pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-stone-900 mb-3 tracking-tight leading-tight">
            Fresh Recipes, SmartPlate Daily 🔥
          </h1>
          <p className="text-base sm:text-xl text-stone-600 font-light max-w-2xl">
            Discover thousands of recipes from around the world. Cook, create,
            and savor.
          </p>
        </div>

        {/* Pantry & AI Chef Quick Action Banner */}
        <section className="mb-12 md:mb-16">
          <div className="bg-linear-to-r from-orange-600 to-amber-600 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none hidden sm:block">
              <Package className="w-96 h-96" />
            </div>
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-orange-100 mb-4 border border-white/30">
                <Sparkles className="w-4 h-4 text-amber-300" />
                AI Pantry Assistant
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                Got Ingredients? Let AI Cook for You! 🍳
              </h2>
              <p className="text-orange-100 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6 sm:mb-8">
                Add your fridge & pantry items manually or by scanning photo. SmartPlate AI instantly turns your available ingredients into delicious step-by-step recipes.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                <Link href="/pantry/recipes" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-orange-700 hover:bg-orange-50 font-extrabold px-6 sm:px-8 py-5 sm:py-6 rounded-2xl text-sm sm:text-base shadow-md gap-2 justify-center">
                    <ChefHat className="w-5 h-5 text-orange-600" />
                    What Can I Cook Today?
                  </Button>
                </Link>
                <Link href="/pantry" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-extrabold px-6 sm:px-7 py-5 sm:py-6 rounded-2xl text-sm sm:text-base gap-2 shadow-md border-2 border-stone-900 justify-center">
                    <Package className="w-5 h-5 text-orange-400" />
                    Manage My Pantry
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe of the Day */}
        {recipeOfTheDay && (
          <section className="mb-24 relative">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-600" />
              <h2 className="text-3xl font-serif font-bold text-stone-900">
                Recipe of the Day
              </h2>
            </div>

            <div className="absolute top-20 left-5 z-10 flex items-center gap-3 mb-6">
              <Badge
                variant="outline"
                className="border-2 border-orange-600 text-orange-700 bg-orange-50 font-bold uppercase tracking-wide"
              >
                <Flame className="mr-1 w-4 h-4" />
                Today&apos;s Special
              </Badge>
            </div>

            <Link href={`/recipe?cook=${encodeURIComponent(recipeOfTheDay.strMeal)}`}>
              <div className="relative bg-white border-2 border-stone-900 overflow-hidden hover:border-orange-600 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative aspect-4/3 md:aspect-auto border-b-2 md:border-b-0 md:border-r-2 border-stone-900">
                    <Image
                      src={recipeOfTheDay.strMealThumb}
                      alt={recipeOfTheDay.strMeal}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="outline" className="border-2 border-orange-600 text-orange-700 bg-orange-50 font-bold">
                        {recipeOfTheDay.strCategory}
                      </Badge>
                      <Badge variant="outline" className="border-2 border-stone-900 text-stone-700 bg-stone-50 font-bold">
                        <Globe className="w-3 h-3 mr-1" />
                        {recipeOfTheDay.strArea}
                      </Badge>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4 group-hover:text-orange-600 transition-colors leading-tight">
                      {recipeOfTheDay.strMeal}
                    </h3>
                    <p className="text-stone-600 mb-6 line-clamp-3 font-light text-lg">
                      {recipeOfTheDay.strInstructions?.substring(0, 200)}...
                    </p>
                    {recipeOfTheDay.strTags && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {recipeOfTheDay.strTags.split(",").slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="bg-stone-100 text-stone-600 border border-stone-200 font-mono text-xs uppercase">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button variant="primary" size="lg">
                      Start Cooking <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Browse by Categories */}
        <section className="mb-24">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">
              Browse by Category
            </h2>
            <p className="text-stone-600 text-lg font-light">
              Find recipes that match your mood
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link key={category.strCategory} href={`/recipes/category/${category.strCategory.toLowerCase()}`}>
                <div className="bg-white p-6 border-2 border-stone-200 hover:border-orange-600 hover:shadow-lg transition-all text-center group cursor-pointer">
                  <div className="text-4xl mb-3">
                    {getCategoryEmoji(category.strCategory)}
                  </div>
                  <h3 className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors text-sm">
                    {category.strCategory}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Cuisine */}
        <section className="pb-12">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">
              Explore World Cuisines
            </h2>
            <p className="text-stone-600 text-lg font-light">
              Travel the globe through food
            </p>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {filteredAreas.map((area) => (
              <Link
                key={area.strArea}
                href={`/recipes/cuisine/${area.strArea.toLowerCase().replace(/\s+/g, "-")}`}
                className="min-w-0"
              >
                <div className="bg-stone-50 p-3 sm:p-5 border-2 border-stone-200 hover:border-orange-600 hover:shadow-lg transition-all group cursor-pointer rounded-xl h-full flex items-center">
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <span className="text-2xl sm:text-3xl shrink-0">
                      {getCountryFlag(area.strArea)}
                    </span>
                    <span className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors text-xs sm:text-sm truncate">
                      {area.strArea}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>


        </section>

      </div>
    </div>
  );
};

export default DashboardPage;