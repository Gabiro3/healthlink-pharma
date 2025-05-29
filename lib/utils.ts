import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSupabaseClient() {
  // Import dynamically to avoid SSR issues
  const { supabase } = require("@/lib/supabase-client")
  return supabase
}
