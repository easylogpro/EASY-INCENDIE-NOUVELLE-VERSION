// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // indispensable pour garder la session après refresh
    persistSession: true,
    autoRefreshToken: true,

    // IMPORTANT : mode "manuel" => évite la double gestion (source d'instabilité)
    detectSessionInUrl: false,

    storage: window.localStorage,

    // Flow PKCE
    flowType: "pkce",
  },
});

export const handleSupabaseError = (error) => {
  console.error("Supabase Error:", error);
  return { error: error?.message || "Une erreur est survenue" };
};