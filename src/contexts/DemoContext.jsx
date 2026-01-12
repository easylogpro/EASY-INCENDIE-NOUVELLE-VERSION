// src/contexts/DemoContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";

const DemoContext = createContext();

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    return {
      isDemoMode: false,
      demoExpired: false,
      timeRemaining: 180,
      demoRequest: null,
      startDemo: async () => false,
      restoreDemo: () => false,
      endDemo: async () => {},
      isFeatureLocked: () => false,
      formatTimeRemaining: () => "3:00",
      DEMO_DURATION: 180,
    };
  }
  return context;
};

const DEMO_DURATION = 180;

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStartTime, setDemoStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(DEMO_DURATION);
  const [demoExpired, setDemoExpired] = useState(false);
  const [demoSessionId, setDemoSessionId] = useState(null);
  const [demoRequest, setDemoRequest] = useState(null);

  useEffect(() => {
    let interval;

    if (isDemoMode && demoStartTime && !demoExpired) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - demoStartTime) / 1000);
        const remaining = Math.max(0, DEMO_DURATION - elapsed);

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          setDemoExpired(true);
          setIsDemoMode(false);
          clearInterval(interval);
          localStorage.removeItem("demo_session");
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDemoMode, demoStartTime, demoExpired]);

  useEffect(() => {
    restoreDemo();
  }, []);

  const startDemo = useCallback(async (requestData) => {
    try {
      const now = Date.now();
      let createdId = "local-demo";

      // Insert minimal (si tu as organisation_id)
      try {
        if (requestData?.organisation_id) {
          const { data, error } = await supabase
            .from("demo_sessions")
            .insert({
              organisation_id: requestData.organisation_id,
              started_at: new Date(now).toISOString(),
              expires_at: new Date(now + DEMO_DURATION * 1000).toISOString(),
              converted: false,
            })
            .select()
            .single();

          if (!error && data?.id) createdId = data.id;
        }
      } catch (e) {
        console.error("demo_sessions insert failed (non bloquant):", e);
      }

      setDemoSessionId(createdId);
      setDemoRequest(requestData);
      setDemoStartTime(now);
      setTimeRemaining(DEMO_DURATION);
      setDemoExpired(false);
      setIsDemoMode(true);

      localStorage.setItem(
        "demo_session",
        JSON.stringify({
          id: createdId,
          startTime: now,
          request: requestData,
        })
      );

      return true;
    } catch (error) {
      console.error("Erreur startDemo:", error);
      return false;
    }
  }, []);

  // ============================================================
  // RESTAURER LA DÉMO (au montage)
  // SÉCURITÉ: Ne pas restaurer si l'utilisateur a un abonnement actif
  // ============================================================
  const restoreDemo = useCallback(() => {
    try {
      const stored = localStorage.getItem("demo_session");
      if (!stored) return false;
      
      const { id, startTime, request } = JSON.parse(stored);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      // Si la démo est expirée, nettoyer
      if (elapsed >= DEMO_DURATION) {
        localStorage.removeItem("demo_session");
        setDemoExpired(true);
        return false;
      }

      // Restaurer la session active
      setDemoSessionId(id);
      setDemoRequest(request);
      setDemoStartTime(startTime);
      setTimeRemaining(DEMO_DURATION - elapsed);
      setDemoExpired(false);
      setIsDemoMode(true);
      return true;

    } catch (error) {
      console.error("Erreur restoreDemo:", error);
      // En cas d'erreur, nettoyer le localStorage
      localStorage.removeItem("demo_session");
    }
    return false;
  }, []);

  // ============================================================
  // TERMINER LA DÉMO (appelé après paiement)
  // NETTOYAGE COMPLET du localStorage et des états
  // ============================================================
  const endDemo = useCallback(
    async (converted = false) => {
      console.log("🔚 endDemo appelé, converted:", converted);
      
      try {
        // Mettre à jour la session en BDD si existe
        if (demoSessionId && demoSessionId !== "local-demo") {
          await supabase
            .from("demo_sessions")
            .update({ converted })
            .eq("id", demoSessionId);
        }
      } catch (error) {
        console.error("Erreur update demo_sessions:", error);
      }

      // NETTOYAGE COMPLET
      localStorage.removeItem("demo_session");
      setIsDemoMode(false);
      setDemoStartTime(null);
      setTimeRemaining(DEMO_DURATION);
      setDemoExpired(false);
      setDemoSessionId(null);
      setDemoRequest(null);
      
      console.log("✅ Session démo nettoyée");
    },
    [demoSessionId]
  );

  const isFeatureLocked = useCallback(
    (feature) => {
      if (!isDemoMode) return false;

      const lockedFeatures = [
        "create_report",
        "edit_report",
        "generate_pdf",
        "export_data",
        "add_client",
        "add_site",
        "settings",
        "billing",
      ];

      return lockedFeatures.includes(feature);
    },
    [isDemoMode]
  );

  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [timeRemaining]);

  const value = {
    isDemoMode,
    demoExpired,
    timeRemaining,
    demoRequest,
    startDemo,
    restoreDemo,
    endDemo,
    isFeatureLocked,
    formatTimeRemaining,
    DEMO_DURATION,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};