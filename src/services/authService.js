// src/services/authService.js
// Service d'authentification - SUPABASE

import { supabase } from '../config/supabase';

/**
 * Inscription d'un nouvel utilisateur
 */
export const registerUser = async (email, password, userData) => {
  try {
    // 1. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          prenom: userData.prenom,
          nom: userData.nom
        }
      }
    });

    if (authError) throw authError;

    return authData;
  } catch (error) {
    console.error('Erreur inscription:', error);
    throw error;
  }
};

/**
 * Connexion utilisateur
 */
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur connexion:', error);
    throw error;
  }
};

/**
 * Déconnexion
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    throw error;
  }
};

/**
 * Réinitialisation mot de passe
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  } catch (error) {
    console.error('Erreur reset password:', error);
    throw error;
  }
};

/**
 * Récupérer l'utilisateur courant
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Erreur get user:', error);
    return null;
  }
};

/**
 * Récupérer les données utilisateur depuis la table utilisateurs
 */
export const getUserData = async (authId) => {
  try {
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('*, organisations(*)')
      .eq('auth_id', authId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur get user data:', error);
    return null;
  }
};
