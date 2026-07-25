"use client";

import React from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

export function HeaderSignOutButton() {
  const { signOut } = useClerk();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="hidden lg:flex text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium gap-1 px-2 cursor-pointer"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Sign Out</span>
    </Button>
  );
}

export function MobileSignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold text-stone-700 hover:text-red-600 w-full truncate cursor-pointer"
    >
      <LogOut className="w-4 h-4 text-red-500 shrink-0" />
      <span className="truncate w-full">Sign Out</span>
    </button>
  );
}
