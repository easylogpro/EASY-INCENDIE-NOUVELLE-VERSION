// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [userData, setUserData] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  const safeSetLoadingFalse = () => setLoading(false);

  const loadSubscription = async (organisationId) => {
    if (!organisationId) {
      setSubscription(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("abonnements")
        .select("*")
        .eq("organisation_id", organisationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Erreur loadSubscription:", error);
        setSubscription(null);
        return null;
      }

      setSubscription(data || null);
      return data || null;
    } catch (e) {
      console.error("Erreur loadSubscription catch:", e);
      setSubscription(null);
      return null;
    }
  };

  const loadUserData = async (authUser) => {
    if (!authUser) {
      setUserData(null);
      setOrgSettings(null);
      setSubscription(null);
      setNeedsProfile(false);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("utilisateurs")
        .select("*")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Erreur loadUserData:", error);
        // Erreur DB != profil incomplet
        setUserData(null);
        setOrgSettings(null);
        setSubscription(null);
        setNeedsProfile(false);
        return null;
      }

      if (!data) {
        // Profil inexistant => il faut compléter
        setNeedsProfile(true);
        setUserData(null);
        setOrgSettings(null);
        setSubscription(null);
        return null;
      }

      setUserData(data);
      setNeedsProfile(false);

      if (data.organisation_id) {
        const { data: orgData, error: orgError } = await supabase
          .from("organisations")
          .select("*")
          .eq("id", data.organisation_id)
          .maybeSingle();

        if (orgError) {
          console.error("Erreur load org:", orgError);
          setOrgSettings(null);
        } else {
          setOrgSettings(orgData || null);
        }

        await loadSubscription(data.organisation_id);
      } else {
        setOrgSettings(null);
        setSubscription(null);
      }

      return data;
    } catch (e) {
      console.error("Erreur chargement userData catch:", e);
      setNeedsProfile(false);
      setUserData(null);
      setOrgSettings(null);
      setSubscription(null);
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    // Sécurité anti-spinner infini (même si un await bloque)
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn("Auth loading timeout: forcing loading=false");
        safeSetLoadingFalse();
      }
    }, 6000);

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) console.error("getSession error:", error);

        if (cancelled) return;

        // IMPORTANT: on débloque l'UI tout de suite
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          setUserData(null);
          setOrgSettings(null);
          setSubscription(null);
          setNeedsProfile(false);
        }

        safeSetLoadingFalse();

        // On charge le profil en arrière-plan (ne bloque plus l'écran)
        if (session?.user) {
          void loadUserData(session.user);
        }
      } catch (e) {
        console.error("init auth crash:", e);
        if (!cancelled) safeSetLoadingFalse();
      }
    };

    init();

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      // On débloque l'UI immédiatement (important)
      safeSetLoadingFalse();

      if (session?.user) {
        setUser(session.user);
        void loadUserData(session.user);
      } else {
        setUser(null);
        setUserData(null);
        setOrgSettings(null);
        setSubscription(null);
        setNeedsProfile(false);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      authSub?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, metadata = {}, emailRedirectTo) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: emailRedirectTo || `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // loadUserData se fera via onAuthStateChange aussi
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setUser(null);
    setUserData(null);
    setOrgSettings(null);
    setSubscription(null);
    setNeedsProfile(false);
  };

  const refreshUserData = async () => {
    if (user) await loadUserData(user);
  };

  const refreshSubscription = async () => {
    const organisationId = userData?.organisation_id;
    return await loadSubscription(organisationId);
  };

  const value = useMemo(
    () => ({
      user,
      userData,
      orgSettings,
      subscription,
      orgId: userData?.organisation_id,

      loading,
      needsProfile,
      isAuthenticated: !!user,

      signUp,
      signIn,
      logout,
      refreshUserData,
      refreshSubscription,
    }),
    [user, userData, orgSettings, subscription, loading, needsProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;