// src/pages/DashboardPage.jsx
// Easy Sécurité - Dashboard avec modules selon abonnement

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";
import OnboardingWizard from "../components/onboarding/OnboardingWizard";
import { calculatePrice, getAvailableReports } from "../utils/pricingAlgorithm";

import {
  BarChart3,
  Building2,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
  Gauge,
  Zap,
  Settings,
  Flame,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, userData, orgId, orgSettings, subscription } = useAuth();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(null);
  const [stats, setStats] = useState({ clients: 0, sites: 0, rapports: 0, alertes: 3 });

  // Prospect (traçabilité) pour afficher la démo / paiement avant abonnement
  const [prospect, setProspect] = useState(null);

  const justSubscribed = location.state?.subscriptionSuccess;
  const isFirstMonth = location.state?.firstMonth;

  useEffect(() => {
    if (orgId) {
      loadStats();
      checkOnboarding();
    }
  }, [orgId]);

  useEffect(() => {
    const loadProspect = async () => {
      try {
        if (!user?.email) return;

        const { data, error } = await supabase
          .from("demandes_prospects")
          .select("*")
          .eq("email", user.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Erreur load prospect:", error);
          return;
        }

        setProspect(data || null);
      } catch (e) {
        console.error("Erreur loadProspect catch:", e);
      }
    };

    loadProspect();
  }, [user?.email]);

  const loadStats = async () => {
    try {
      const [clients, sites] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact" }).eq("organisation_id", orgId),
        supabase.from("sites").select("id", { count: "exact" }).eq("organisation_id", orgId),
      ]);

      setStats({
        clients: clients.count || 0,
        sites: sites.count || 0,
        rapports: 0,
        alertes: 3,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const checkOnboarding = async () => {
    try {
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("organisation_id", orgId)
        .maybeSingle();

      if (error) throw error;

      setOnboardingProgress(data);
      const isCompleted = !!(data?.completed || data?.onboarding_complete);
      if (!isCompleted) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (e) {
      setShowOnboarding(true);
    }
  };

  // MODULES ACTIFS SELON L'ABONNEMENT
  const activeDomains = subscription?.domaines_actifs || orgSettings?.modules_actifs || ["ssi"];

  const domainConfig = {
    ssi: { label: "SSI (Système Sécurité Incendie)", icon: Shield, color: "bg-red-500", route: "/rapports-ssi" },
    dsf: { label: "Désenfumage", icon: Gauge, color: "bg-orange-500", route: "/rapports-dsf" },
    compartimentage: { label: "Compartimentage", icon: Building2, color: "bg-purple-500", route: "/rapports" },
    baes: { label: "BAES / Éclairage sécurité", icon: Zap, color: "bg-yellow-500", route: "/rapports-baes" },
    extincteurs: { label: "Extincteurs", icon: Flame, color: "bg-red-600", route: "/rapports-extincteurs" },
    ria: { label: "RIA", icon: Shield, color: "bg-cyan-500", route: "/rapports-ria" },
    colonnes_seches: {
      label: "Colonnes sèches",
      icon: Settings,
      color: "bg-gray-500",
      route: "/rapports-colonnes-seches",
    },
  };

  // Calcul pricing + reports à partir du prospect (si pas d’abonnement)
  const prospectComputed = useMemo(() => {
    if (!prospect) return null;

    const domains = prospect.domaines_demandes || ["ssi"];
    const profile = prospect.profil_demande || "mainteneur";
    const addons = prospect.options_selectionnees?.addons || [];
    const userCount = prospect.nb_utilisateurs || "1";

    const pricing = calculatePrice(domains, userCount, addons, profile);
    const reports = getAvailableReports(profile, domains);

    return { domains, profile, addons, userCount, pricing, reports };
  }, [prospect]);

  return (
    <div className="p-6 space-y-6">
      {/* Message bienvenue si abonnement vient d’être activé */}
      {justSubscribed && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8" />
          <div>
            <h3 className="font-bold">🎉 Bienvenue sur Easy Sécurité !</h3>
            <p className="text-sm opacity-90">
              Votre abonnement est actif. {isFirstMonth && "Profitez de -10% ce mois-ci !"}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour {userData?.prenom || "Utilisateur"} 👋</h1>
          <p className="text-gray-500">{orgSettings?.nom || "Votre entreprise"}</p>
        </div>

        <button
          onClick={() => navigate("/rapports")}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4" />
          Nouveau rapport
        </button>
      </div>

      {/* BLOC AVANT PAIEMENT: démo 3 minutes + paiement */}
      {!subscription && prospectComputed && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">Avant paiement</p>
            <h2 className="text-2xl font-black">Votre configuration est prête</h2>

            <p className="text-white/90 mt-2">
              Tarif: <span className="font-black">{prospectComputed.pricing.finalPrice}€</span> le 1er mois (-10%),
              puis {prospectComputed.pricing.totalPrice}€/mois
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {(prospectComputed.domains || []).map((d) => (
                <span key={d} className="px-3 py-1 bg-white/15 rounded-full text-sm font-semibold">
                  {d.toUpperCase()}
                </span>
              ))}
              <span className="px-3 py-1 bg-white/15 rounded-full text-sm font-semibold">
                {prospectComputed.userCount} utilisateur(s)
              </span>
            </div>

            <p className="text-white/80 text-sm mt-3">
              Démo: 3 minutes en lecture seule (sans création de rapports)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                navigate("/demo", {
                  state: {
                    request: prospect,
                    pricing: prospectComputed.pricing,
                    reports: prospectComputed.reports,
                  },
                })
              }
              className="flex items-center gap-2 bg-white text-blue-700 px-5 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              <Clock className="w-5 h-5" />
              Lancer la démo
            </button>

            <button
              onClick={() =>
                navigate("/subscribe", {
                  state: {
                    request: prospect,
                    pricing: prospectComputed.pricing,
                    reports: prospectComputed.reports,
                  },
                })
              }
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Passer au paiement
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Clients</p>
              <p className="text-2xl font-bold">{stats.clients}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sites</p>
              <p className="text-2xl font-bold">{stats.sites}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rapports</p>
              <p className="text-2xl font-bold">{stats.rapports}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm">Alertes</p>
              <p className="text-2xl font-bold text-red-700">{stats.alertes}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* MODULES ACTIFS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Vos modules actifs</h2>
            <p className="text-gray-500 text-sm">{activeDomains.length} domaine(s) selon votre abonnement</p>
          </div>
          <button onClick={() => navigate("/settings")} className="text-sm text-red-500 hover:text-red-600 font-medium">
            Gérer les modules →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDomains.map((domain) => {
            const config = domainConfig[domain];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <button
                key={domain}
                onClick={() => navigate(config.route)}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left group"
              >
                <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{config.label}</p>
                  <p className="text-sm text-gray-500">Créer un rapport</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>
            );
          })}
        </div>

        {activeDomains.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun module actif. Souscrivez pour accéder aux rapports.</p>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/clients")}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Ajouter un client</p>
                <p className="text-sm text-gray-500">Nouveau client ou import Excel</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/planning")}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Planifier une intervention</p>
                <p className="text-sm text-gray-500">Maintenance, SAV, Travaux</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Paramètres</p>
                <p className="text-sm text-gray-500">Configurer votre compte</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Prochaines échéances</h2>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune échéance à venir</p>
          </div>
        </div>
      </div>

      {/* Onboarding progress (bannière) */}
      {onboardingProgress && !(onboardingProgress.completed || onboardingProgress.onboarding_complete) && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Finalisez votre configuration</h3>
              <p className="text-gray-600 text-sm">
                Suivez l’onboarding pour paramétrer votre entreprise et commencer rapidement.
              </p>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600"
            >
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingWizard
          orgId={orgId}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            setShowOnboarding(false);
            checkOnboarding();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;