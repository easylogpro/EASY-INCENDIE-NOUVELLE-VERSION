// src/App.jsx
// VERSION FUSIONNÉE - Toutes les routes incluses
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DemoProvider } from "./contexts/DemoContext";

// Pages publiques
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Pages principales
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import SitesPage from "./pages/SitesPage";
import TechniciensPage from "./pages/TechniciensPage";
import InterventionsPage from "./pages/InterventionsPage";
import PlanningPage from "./pages/PlanningPage";
import DevisPage from "./pages/DevisPage";
import FacturesPage from "./pages/FacturesPage";
import AlertesPage from "./pages/AlertesPage";
import SettingsPage from "./pages/SettingsPage";

// Nouvelles pages métier
import VehiculesPage from "./pages/VehiculesPage";
import SavPage from "./pages/SavPage";
import TravauxPage from "./pages/TravauxPage";
import ContratsPage from "./pages/ContratsPage";
import MaintenancesPage from "./pages/MaintenancesPage";
import GroupesPage from "./pages/GroupesPage";
import AstreintesPage from "./pages/AstreintesPage";
import SoustraitantsPage from "./pages/SoustraitantsPage";
import MiseEnServicePage from "./pages/MiseEnServicePage";
import ObservationsPage from "./pages/ObservationsPage";

// Demo & Subscription
import DemoPage from "./pages/DemoPage";
import DemoExpiredPage from "./pages/DemoExpiredPage";
import SubscriptionPage from "./pages/SubscriptionPage";

// Layout
import MainLayout from "./layouts/MainLayout";
import DemoBanner from "./components/demo/DemoBanner";

import "./styles/index.css";

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, needsProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsProfile) return <Navigate to="/complete-profile" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, needsProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (needsProfile) return <Navigate to="/complete-profile" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ProfileRoute = ({ children }) => {
  const { isAuthenticated, loading, needsProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!needsProfile) return <Navigate to="/dashboard" replace />;
  return children;
};

// Placeholder pour les pages en développement
const PlaceholderPage = ({ title }) => (
  <div className="p-6 flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">Module en cours de développement</p>
      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Bientôt disponible
      </div>
    </div>
  </div>
);

// ============================================================
// APP PRINCIPAL
// ============================================================

function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: "#1e293b", color: "#f1f5f9" },
            }}
          />

          <DemoBanner />

          <Routes>
            {/* ========================================
                ROUTES PUBLIQUES
            ======================================== */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* CALLBACK AUTH */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* COMPLETE PROFILE */}
            <Route path="/complete-profile" element={<ProfileRoute><CompleteProfilePage /></ProfileRoute>} />

            {/* ========================================
                DEMO -> Redirige vers le vrai Dashboard
                SUBSCRIBE (protégé, sans layout)
            ======================================== */}
            <Route path="/demo" element={<Navigate to="/dashboard" replace />} />
            <Route path="/demo-expired" element={<Navigate to="/subscribe" replace />} />
            <Route path="/subscribe" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

            {/* ========================================
                APPLICATION (protégé + MainLayout)
            ======================================== */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              
              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* --- GESTION --- */}
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/sites" element={<SitesPage />} />
              <Route path="/contrats" element={<ContratsPage />} />
              
              {/* --- ÉQUIPE --- */}
              <Route path="/techniciens" element={<TechniciensPage />} />
              <Route path="/vehicules" element={<VehiculesPage />} />
              <Route path="/groupes" element={<GroupesPage />} />
              <Route path="/sous-traitants" element={<SoustraitantsPage />} />
              <Route path="/astreintes" element={<AstreintesPage />} />
              
              {/* --- INTERVENTIONS --- */}
              <Route path="/planning" element={<PlanningPage />} />
              <Route path="/maintenances" element={<MaintenancesPage />} />
              <Route path="/interventions" element={<InterventionsPage />} />
              <Route path="/sav" element={<SavPage />} />
              <Route path="/travaux" element={<TravauxPage />} />
              <Route path="/mise-en-service" element={<MiseEnServicePage />} />
              
              {/* --- COMMERCIAL --- */}
              <Route path="/devis" element={<DevisPage />} />
              <Route path="/factures" element={<FacturesPage />} />
              
              {/* --- SUIVI --- */}
              <Route path="/observations" element={<ObservationsPage />} />
              <Route path="/alertes" element={<AlertesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* --- RAPPORTS (placeholders) --- */}
              <Route path="/rapports" element={<PlaceholderPage title="Rapports" />} />
              <Route path="/rapports-ssi" element={<PlaceholderPage title="Rapports SSI" />} />
              <Route path="/rapports-dsf" element={<PlaceholderPage title="Rapports DSF" />} />
              <Route path="/rapports-extincteurs" element={<PlaceholderPage title="Rapports Extincteurs" />} />
              <Route path="/rapports-baes" element={<PlaceholderPage title="Rapports BAES" />} />
              <Route path="/rapports-ria" element={<PlaceholderPage title="Rapports RIA" />} />
              <Route path="/rapports-colonnes-seches" element={<PlaceholderPage title="Rapports Colonnes Sèches" />} />
              <Route path="/rapports-compartimentage" element={<PlaceholderPage title="Rapports Compartimentage" />} />
              
              {/* --- AUTRES --- */}
              <Route path="/registre-securite" element={<PlaceholderPage title="Registre Sécurité" />} />
              <Route path="/utilisateurs" element={<PlaceholderPage title="Utilisateurs" />} />
              <Route path="/equipements" element={<PlaceholderPage title="Équipements" />} />
              <Route path="/export-comptable" element={<PlaceholderPage title="Export Comptable" />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DemoProvider>
    </AuthProvider>
  );
}

export default App;
