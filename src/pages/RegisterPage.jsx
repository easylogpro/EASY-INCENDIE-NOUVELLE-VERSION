// src/pages/RegisterPage.jsx
// Étape 1 : Email + mot de passe seulement
import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../config/supabase";
import { generateRequestSummary } from "../utils/pricingAlgorithm";
import {
  Flame,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

const RegisterPage = () => {
  const location = useLocation();

  // Données venant du questionnaire landing
  const questionnaireData = location.state?.questionnaireData || null;
  const pricingFromLanding = location.state?.pricing || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const requestSummary = useMemo(() => {
    if (!questionnaireData || !pricingFromLanding) return null;

    // generateRequestSummary attend un formData + pricing
    return generateRequestSummary(
      {
        ...questionnaireData,
        selectedAddons: pricingFromLanding?.selectedAddons || [],
      },
      pricingFromLanding
    );
  }, [questionnaireData, pricingFromLanding]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email invalide");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      // 1) Créer l'utilisateur Supabase Auth (avec redirect callback)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // 2) Vérifier email déjà utilisé
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("Cet email est déjà utilisé");
      }

      // 3) Traçabilité: enregistrer la demande prospect (INSERT anonyme)
      //    On le fait ici car c'est le premier moment où on connaît l'email.
      try {
        if (requestSummary) {
          await supabase.from("demandes_prospects").insert({
            email,
            telephone: null,
            domaines_demandes: requestSummary.domaines,
            profil_demande: requestSummary.profil,
            nb_utilisateurs: requestSummary.nb_utilisateurs,
            tarif_calcule: requestSummary.tarif_final,

            // On met en JSONB tout ce qui n'a pas de colonne dédiée
            options_selectionnees: {
              addons: requestSummary.options || [],
              nb_sites: requestSummary.nb_sites,
              logiciel_actuel: questionnaireData?.logicielActuel || questionnaireData?.logicielActuel,
              rapports_fournis: requestSummary.rapports_fournis || {},
              tarif_base: requestSummary.tarif_base,
              tarif_options: requestSummary.tarif_options,
              tarif_total: requestSummary.tarif_total,
              discount: pricingFromLanding?.discount,
            },

            source: "landing",
            converti: false,
          });
        }
      } catch (prospectErr) {
        // IMPORTANT: on ne bloque pas l'inscription si la traçabilité échoue (MVP)
        console.error("Erreur insertion demandes_prospects:", prospectErr);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Erreur inscription:", err);
      if (err.message?.includes("already registered")) {
        setError("Cet email est déjà utilisé");
      } else {
        setError(err.message || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
          <span className="text-white font-black text-xl">E</span>
          <span className="text-white font-black text-xl">S</span>
        </div>
        <Flame className="absolute -top-2 -right-2 w-6 h-6 text-orange-500" />
      </div>
      <div>
        <span className="text-2xl font-black text-white">Easy</span>
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          {" "}
          Sécurité
        </span>
      </div>
    </div>
  );

  // Écran de succès
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">Vérifiez votre email</h1>

          <p className="text-gray-400 mb-6">
            Un email de confirmation a été envoyé à{" "}
            <span className="text-white font-medium">{email}</span>
          </p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <p className="text-gray-300 text-sm">
              Cliquez sur le lien dans l'email pour activer votre compte et compléter votre inscription.
            </p>
          </div>

          <p className="text-gray-500 text-sm">
            Pas reçu l'email ? Vérifiez vos spams ou{" "}
            <button onClick={() => setSuccess(false)} className="text-red-400 hover:text-red-300">
              réessayez
            </button>
          </p>

          <div className="mt-6">
            <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex">
      {/* Colonne gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-900/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12">
          <Logo />

          <h1 className="text-4xl font-bold text-white mt-12 mb-4">
            Gérez votre activité{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              sécurité incendie
            </span>
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            SSI, DSF, BAES, Extincteurs... Tous vos rapports en un seul endroit.
          </p>

          <div className="space-y-4">
            {["Accès démo 3 minutes après inscription", "Tarif calculé selon vos besoins", "Sans engagement"].map(
              (t) => (
                <div key={t} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span>{t}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-2">Créez votre compte</h2>
          <p className="text-gray-400 text-center mb-8">Étape 1/2 : Vos identifiants</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.fr"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le mot de passe <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;