// src/pages/DemoPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDemo } from "../contexts/DemoContext";
import { useAuth } from "../contexts/AuthContext";
import LockedFeatureModal from "../components/demo/LockedFeatureModal";
import {
  Building2,
  Users,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  AlertTriangle,
  Clock,
  Plus,
  Eye,
  Lock,
  Zap,
  Shield,
  Gauge,
  Flame,
} from "lucide-react";

const DemoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, orgId } = useAuth();
  const { isDemoMode, startDemo, demoExpired, demoRequest, timeRemaining, formatTimeRemaining, DEMO_DURATION } =
    useDemo();

  const [lockedModal, setLockedModal] = useState({ open: false, feature: "default" });
  const [demoStarted, setDemoStarted] = useState(false);

  const request = useMemo(() => {
    // On passe request depuis Dashboard
    return location.state?.request || demoRequest || null;
  }, [location.state, demoRequest]);

  // Démarrer la démo à l'arrivée sur la page (le clic est fait avant: "Lancer la démo")
  useEffect(() => {
    const run = async () => {
      if (!user?.email) {
        navigate("/login", { replace: true });
        return;
      }

      if (!request) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (demoExpired) {
        navigate("/demo-expired", { state: { request } });
        return;
      }

      if (!isDemoMode && !demoStarted) {
        setDemoStarted(true);
        await startDemo({
          organisation_id: orgId || null,
          email: user.email,
          domaines_demandes: request.domaines_demandes || request.domaines || request.modulesInteresses || ["ssi"],
          profil_demande: request.profil_demande || request.profil || request.typeActivite || "mainteneur",
          nb_utilisateurs: request.nb_utilisateurs || request.nombreTechniciens || "1",
          tarif_calcule: request.tarif_calcule,
          options_selectionnees: request.options_selectionnees || {},
        });
      }
    };

    run();
  }, [user?.email, request, isDemoMode, demoStarted, demoExpired, startDemo, navigate, orgId]);

  useEffect(() => {
    if (demoExpired) {
      navigate("/demo-expired", { state: { request: request || demoRequest } });
    }
  }, [demoExpired, navigate, request, demoRequest]);

  const handleLockedFeature = (feature) => setLockedModal({ open: true, feature });
  const handleSubscribe = () => navigate("/subscribe", { state: { fromDemo: true, request: request || demoRequest } });

  const activeDomains = request?.domaines_demandes || ["ssi"];

  const domainConfig = {
    ssi: { label: "SSI", icon: Shield },
    dsf: { label: "Désenfumage", icon: Gauge },
    baes: { label: "BAES", icon: Zap },
    extincteurs: { label: "Extincteurs", icon: Flame },
    ria: { label: "RIA", icon: Shield },
    colonnes_seches: { label: "Colonnes sèches", icon: Settings },
    compartimentage: { label: "Compartimentage", icon: Building2 },
  };

  const percentage = (timeRemaining / DEMO_DURATION) * 100;
  const timerColor =
    timeRemaining <= 30 ? "text-red-500" : timeRemaining <= 60 ? "text-orange-500" : "text-green-500";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="font-black">ES</span>
              </div>
              <div>
                <span className="font-bold">Easy Sécurité</span>
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-xs rounded font-bold">DÉMO</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs opacity-75">Temps restant</div>
                <div className={`text-4xl font-mono font-black ${timerColor} ${timeRemaining <= 30 ? "animate-pulse" : ""}`}>
                  {formatTimeRemaining()}
                </div>
              </div>

              <div className="w-32 h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    timeRemaining <= 30 ? "bg-red-500" : timeRemaining <= 60 ? "bg-orange-400" : "bg-green-400"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 px-6 py-2 rounded-lg font-bold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <Zap className="w-4 h-4" />
              Souscrire -10%
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-60px)] p-4">
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </a>

            <button
              onClick={() => handleLockedFeature("add_client")}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-50 rounded-lg"
            >
              <Building2 className="w-5 h-5" />
              Clients
              <Lock className="w-4 h-4 ml-auto text-orange-500" />
            </button>

            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5" />
              Planning
            </a>

            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5" />
              Rapports (aperçu)
            </a>

            <button
              onClick={() => handleLockedFeature("settings")}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-50 rounded-lg"
            >
              <Settings className="w-5 h-5" />
              Paramètres
              <Lock className="w-4 h-4 ml-auto text-orange-500" />
            </button>
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-800 mb-3">VOS DOMAINES</p>
            <div className="space-y-2">
              {activeDomains.map((domain) => {
                const config = domainConfig[domain];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <div key={domain} className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-700">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="font-bold">Démo 3 minutes (lecture seule)</p>
                <p className="text-sm opacity-90">Explorez l'interface. Les actions de création sont verrouillées.</p>
              </div>
            </div>
            <div className={`text-3xl font-mono font-black ${timeRemaining <= 30 ? "animate-pulse" : ""}`}>
              {formatTimeRemaining()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Clients (exemples)</h2>
                <button
                  onClick={() => handleLockedFeature("add_client")}
                  className="flex items-center gap-1 text-orange-500 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                  <Lock className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {["Carrefour Béziers", "Mairie Montpellier", "Hôpital Saint-Roch"].map((client) => (
                  <div key={client} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="font-medium">{client}</span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Rapports (aperçu)</h2>
                <button
                  onClick={() => handleLockedFeature("create_report")}
                  className="flex items-center gap-1 text-orange-500 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau
                  <Lock className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {["Rapport SSI - Cat A", "Rapport BAES - Maintenance", "Rapport Extincteurs"].map((r) => (
                  <div key={r} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="font-medium">{r}</span>
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <LockedFeatureModal
            isOpen={lockedModal.open}
            onClose={() => setLockedModal({ open: false, feature: "default" })}
            featureType={lockedModal.feature}
          />
        </main>
      </div>
    </div>
  );
};

export default DemoPage;
