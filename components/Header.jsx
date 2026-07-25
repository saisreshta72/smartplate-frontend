import React from "react";
import { Button } from "./ui/button";
import { Cookie, Refrigerator, Camera, HeartPulse, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import UserDropdown from "./UserDropdown";
import PricingModal from "./PricingModal";
import HealthProfileModal from "./HealthProfileModal";
import { Badge } from "./ui/badge";
import HowToCookModal from "./HowToCookModal";
import { HeaderSignOutButton, MobileSignOutButton } from "./SignOutNavButton";

export default async function Header() {
  const user = await checkUser();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md z-40 supports-backdrop-filter:bg-stone-50/60">
        <nav className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          
          {/* Prominent Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
            <Image
              src="/smartplate_logo_v1_clear.svg"
              alt="SmartPlate Logo"
              width={140}
              height={40}
              priority
              className="w-26 sm:w-32 h-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600">
            <Link href="/meal-scanner" className="hover:text-orange-600 font-bold transition-colors flex gap-1.5 items-center text-orange-700 bg-orange-100/60 px-3 py-1.5 rounded-full border border-orange-200">
              <Camera className="w-4 h-4 text-orange-600" />
              AI Meal Scanner 📸
            </Link>
            <Link href="/recipes" className="hover:text-orange-600 transition-colors flex gap-1.5 items-center">
              <Cookie className="w-4 h-4" />
              My Recipes
            </Link>
            <Link href="/pantry" className="hover:text-orange-600 transition-colors flex gap-1.5 items-center">
              <Refrigerator className="w-4 h-4" />
              My Pantry
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 min-w-0">
            <HealthProfileModal />

            <SignedIn>
              {/*How to Cook?*/}
              <HowToCookModal/>

              {user && (
                <PricingModal subscriptionTier ={user.subscriptionTier} >
                   <Badge
                    variant="outline"
                    className={`flex h-7 sm:h-8 px-2 sm:px-3 gap-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all shrink-0 ${
                      user.subscriptionTier === "pro"
                        ? "bg-linear-to-r from-orange-600 to-amber-500 text-white border-none shadow-sm"
                        : "bg-stone-200/50 text-stone-600 border-stone-200 cursor-pointer hover:bg-stone-300/50 hover:border-stone-300"
                    }`}
                  >
                    <span>
                      {user.subscriptionTier === "pro" ? "Pro Chef" : "Free Plan"}
                    </span>
                  </Badge>
                  </PricingModal>
                )}
              <div className="shrink-0 flex items-center">
                <UserDropdown />
              </div>
              <HeaderSignOutButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal"><Button variant="ghost" className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 font-medium px-2 sm:px-3 text-xs sm:text-sm">Sign In</Button></SignInButton>
              <SignUpButton mode="modal"><Button variant="primary" className="rounded-full px-3 sm:px-5 text-xs sm:text-sm">Get Started</Button></SignUpButton>
            </SignedOut>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Navigation Bar - Rendered outside top fixed header */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-stone-200 z-50 px-1 py-2 shadow-2xl">
        <div className="grid grid-cols-5 text-center text-stone-600 w-full">
          <Link href={user ? "/dashboard" : "/"} className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold text-stone-700 hover:text-orange-600 truncate">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="truncate w-full">Home</span>
          </Link>
          <Link href="/meal-scanner" className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold text-stone-700 hover:text-orange-600 truncate">
            <Camera className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="truncate w-full">Scanner</span>
          </Link>
          <Link href="/pantry" className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold text-stone-700 hover:text-orange-600 truncate">
            <Refrigerator className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="truncate w-full">Pantry</span>
          </Link>
          <Link href="/recipes" className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold text-stone-700 hover:text-orange-600 truncate">
            <Cookie className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="truncate w-full">Recipes</span>
          </Link>

          <SignedOut>
            <SignInButton mode="modal"><button className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold text-orange-600 hover:text-orange-700 w-full truncate"><span className="flex flex-col items-center gap-0.5 w-full truncate"><LogIn className="w-4 h-4 text-orange-600 shrink-0" /><span className="truncate w-full">Sign In</span></span></button></SignInButton>
          </SignedOut>

          <SignedIn>
            <MobileSignOutButton />
          </SignedIn>
        </div>
      </div>
    </>
  );
}