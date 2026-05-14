import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement (Vite/Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification pour le débogage
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Clés Supabase introuvables ! Vérifie tes variables sur Vercel.");
}

// Initialisation du client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);