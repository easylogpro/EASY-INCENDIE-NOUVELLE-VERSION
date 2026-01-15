// src/pages/AuthCallbackPage.jsx
// ============================================================
// VERSION CORRIGÉE - LE VRAI FIX
// 
// PROBLÈME: Après exchangeCodeForSession(), on faisait setProcessing(false)
// immédiatement, AVANT que onAuthStateChange ait eu le temps de se déclencher.
// Donc loading=false, isAuthenticated=false → navigation vers /login
//
// SOLUTION: Attendre que isAuthenticated devienne TRUE avant de naviguer
// ============================================================

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { isAuthenticated, loading, needsProfile, userData } = useAuth();

  const [status, setStatus] = useState("processing"); // processing | waiting | ready | error
  const [error, setError] = useState(null);
  const hasNavigated = useRef(false);

  // ============================================================
  // ÉTAPE 1: Échanger le code (une seule fois)
  // ============================================================
  useEffect(() => {
    const processCode = async () => {
      try {
        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const errorParam = searchParams.get("error");

        console.log("AuthCallback: Démarrage...");

        if (errorParam) {
          throw new Error(searchParams.get("error_description") || errorParam);
        }

        if (code) {
          console.log("AuthCallback: Échange du code PKCE...");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          console.log("AuthCallback: Code échangé ✅");
        } else if (token_hash && type) {
          console.log("AuthCallback: Vérification OTP...");
          const { error: otpError } = await supabase.auth.verifyOtp({ token_hash, type });
          if (otpError) throw otpError;
          console.log("AuthCallback: OTP vérifié ✅");
        } else {
          // Pas de code - vérifier si déjà authentifié
          if (isAuthenticated) {
            console.log("AuthCallback: Déjà authentifié");
            setStatus("ready");
            return;
          }
          throw new Error("Pas de code d'authentification");
        }

        // ============================================================
        // FIX: Ne PAS mettre "ready" tout de suite !
        // On passe en "waiting" et on attend que isAuthenticated devienne true
        // ============================================================
        console.log("AuthCallback: Code traité, en attente de l'événement auth...");
        setStatus("waiting");

      } catch (err) {
        console.error("AuthCallback: Erreur:", err);
        setError(err?.message || "Erreur de validation");
        setStatus("error");
      }
    };

    processCode();
  }, []); // Une seule fois au montage

  // ============================================================
  // ÉTAPE 2: Attendre que isAuthenticated devienne TRUE
  // C'est ici que le bug était - on n'attendait pas assez
  // ============================================================
  useEffect(() => {
    // Pas encore prêt
    if (status === "processing") {
      return;
    }

    // Erreur - redirection vers login après 3s
    if (status === "error") {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }

    // En attente de l'événement auth
    if (status === "waiting") {
      console.log("AuthCallback: waiting, isAuthenticated =", isAuthenticated, "loading =", loading);
      
      // ============================================================
      // FIX: Attendre que isAuthenticated devienne TRUE
      // onAuthStateChange va mettre user, ce qui rend isAuthenticated=true
      // ============================================================
      if (isAuthenticated) {
        console.log("AuthCallback: isAuthenticated ✅, passage en ready");
        setStatus("ready");
      } else {
        // Timeout de sécurité - si après 5s toujours pas auth, erreur
        const timer = setTimeout(() => {
          console.log("AuthCallback: Timeout - toujours pas authentifié");
          setError("Session non créée. Veuillez réessayer.");
          setStatus("error");
        }, 5000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Prêt - on peut naviguer
    if (status === "ready") {
      // Éviter double navigation
      if (hasNavigated.current) return;
      
      // Attendre que loading soit false (loadUserData terminé)
      if (loading) {
        console.log("AuthCallback: ready mais loading, on attend...");
        return;
      }

      console.log("AuthCallback: Navigation finale", { isAuthenticated, needsProfile, userData: !!userData });
      
      hasNavigated.current = true;

      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (needsProfile) {
        console.log("AuthCallback: → /complete-profile");
        navigate("/complete-profile", { replace: true });
      } else {
        console.log("AuthCallback: → /dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [status, isAuthenticated, loading, needsProfile, userData, navigate]);

  // ============================================================
  // AFFICHAGE
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">ES</span>
          </div>
          <span className="text-xl font-black text-white">Easy</span>
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> Sécurité</span>
        </div>

        {/* Status */}
        <p className="text-gray-400">
          {status === "processing" && "Validation de votre email..."}
          {status === "waiting" && "Création de la session..."}
          {status === "ready" && (loading ? "Chargement du profil..." : "Redirection...")}
          {status === "error" && "Erreur..."}
        </p>

        {/* Erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-w-sm mx-auto">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-gray-500 text-xs mt-2">Redirection vers la connexion...</p>
          </div>
        )}

        {/* Debug */}
        <div className="mt-8 text-xs text-gray-600 space-y-1">
          <p>Status: {status}</p>
          <p>Auth: {isAuthenticated ? "✅" : "⏳"}</p>
          <p>Loading: {loading ? "⏳" : "✅"}</p>
          <p>NeedsProfile: {needsProfile ? "OUI" : "NON"}</p>
        </div>
      </div>
    </div>
  );
}
