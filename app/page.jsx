import { auth } from "@clerk/nextjs/server";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ArrowRight, Flame, Star, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FEATURES, SITE_STATS, HOW_IT_WORKS_STEPS } from "@/lib/data";
import PricingSection from "@/components/PricingSection";

export default async function Home() {
  const { has } = await auth();
  const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pt-20 pb-24 md:pb-16 px-4 sm:px-6 overflow-x-hidden w-full max-w-full">
      <section className="py-8 sm:py-16 md:py-20 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center w-full">
          
          {/* Left - Text */}
          <div className="w-full min-w-0">
            <Badge variant="outline" className="border-2 border-orange-600 text-orange-700 bg-orange-50 text-xs sm:text-sm font-bold mb-4 sm:mb-6 uppercase tracking-wide">
              <Flame className="mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"/>
              #1 AI Cooking Assistant
            </Badge>
            <h1 className="text-3xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-[0.9] tracking-tight break-words max-w-full">
              Turn your{" "}
              <span className="italic underline decoration-4 decoration-orange-600">
                leftovers
              </span>{" "}
              into masterpieces.
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-stone-600 mb-6 sm:mb-10 max-w-lg font-light leading-relaxed break-words">
              Snap a photo of your meal or fridge. Instantly analyze Indian dishes, portion sizes, calories, allergens, and personalized health insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full">
              <Link href="/meal-scanner" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-lg rounded-full font-bold shadow-md justify-center">
                  Scan Meal Photo 📸 <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-stone-900 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-lg rounded-full font-bold justify-center">
                  Pantry & Recipes
                </Button>
              </Link>
            </div>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-stone-500">
              <span className="font-bold text-stone-900">10k+ cooks</span>{" "}
              joined last month
            </p>
          </div>

          {/* Right - Image Card */}
          <div className="w-full min-w-0">
            <Card className="relative aspect-4/3 sm:aspect-square md:aspect-[4/5] border-3 sm:border-4 border-stone-900 bg-stone-200 overflow-hidden py-0 max-w-full w-full rounded-2xl sm:rounded-3xl shadow-xl">
              <Image
                src="/pasta-dish.png"
                alt="Delicious pasta dish"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Floating Card */}
              <Card className="absolute bottom-3 left-3 right-3 sm:bottom-8 sm:left-8 sm:right-8 bg-white/95 backdrop-blur-sm border-2 border-stone-900 py-0 max-w-full rounded-xl">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-wrap justify-between items-start mb-1.5 sm:mb-2 gap-1 min-w-0">
                    <div className="min-w-0 pr-1 flex-1">
                      <h3 className="font-bold text-sm sm:text-lg truncate text-stone-900">Rustic Tomato Basil Pasta</h3>
                      <div className="flex gap-0.5 mt-0.5 sm:mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-orange-500 text-orange-500"/>
                        ))}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-2 border-green-700 bg-green-50 text-green-700 font-bold text-[10px] sm:text-xs shrink-0">
                      98% MATCH
                    </Badge>
                  </div>
                  <div className="flex gap-3 sm:gap-4 text-[11px] sm:text-xs text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-600 shrink-0" /> 25 mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-orange-600 shrink-0" /> 2 servings
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 sm:py-12 border-y-2 border-stone-900 bg-stone-900 w-full overflow-hidden rounded-2xl sm:rounded-none">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center px-4 w-full">
          {SITE_STATS.map((stat, i) => (
            <div key={i}>
              <div className="text-3xl sm:text-4xl font-bold mb-1 text-stone-50">
                {stat.val}
              </div>
              <Badge
                variant="secondary"
                className="bg-transparent text-orange-500 text-xs sm:text-sm uppercase tracking-wider font-medium border-none"
              >
                {stat.label}
              </Badge>
            </div>
          ))}
        </div>
      </section>  

      {/* Features */}
      <section className="py-12 sm:py-24 px-2 sm:px-4 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
              Your Smart Kitchen
            </h2>
            <p className="text-stone-600 text-base sm:text-xl font-light">
              Everything you need to master your meal prep.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            {FEATURES.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-stone-200 bg-white hover:border-orange-600 hover:shadow-lg transition-all group py-0 rounded-2xl w-full overflow-hidden"
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-6 gap-2">
                      <div className="border-2 border-stone-200 bg-orange-50 p-3 group-hover:border-orange-600 group-hover:bg-orange-100 transition-colors rounded-xl shrink-0">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs font-mono bg-stone-100 text-stone-600 uppercase tracking-wide border border-stone-200 shrink-0"
                      >
                        {feature.limit}
                      </Badge>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-stone-600 text-sm sm:text-lg font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-24 px-4 border-y-2 border-stone-200 bg-stone-900 text-stone-50 w-full overflow-hidden rounded-2xl sm:rounded-none">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-10 sm:mb-16">
            Cook in 3 Steps
          </h2>

          <div className="space-y-8 sm:space-y-12 w-full">
            {HOW_IT_WORKS_STEPS.map((item, i) => (
              <div key={i} className="w-full">
                <div className="flex gap-4 sm:gap-6 items-start">
                  <Badge
                    variant="outline"
                    className="text-4xl sm:text-6xl font-bold text-orange-500 border-none bg-transparent p-0 h-auto shrink-0"
                  >
                    {item.step}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-sm sm:text-lg text-stone-400 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <hr className="my-6 sm:my-8 border-stone-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-24 px-2 sm:px-4 w-full overflow-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <PricingSection/>
        </div>
      </section>
    </div>
  );
}