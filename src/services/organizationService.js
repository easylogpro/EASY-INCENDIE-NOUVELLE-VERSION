// src/services/organizationService.js
// Service de gestion des organisations - SUPABASE

import { supabase } from '../config/supabase';

/**
 * Récupérer les paramètres de l'organisation
 */
export const getOrganizationSettings = async (orgId) => {
  try {
    const { data, error } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur récupération settings:', error);
    return null;
  }
};

/**
 * Mettre à jour les paramètres de l'organisation
 */
export const updateOrganizationSettings = async (orgId, settings) => {
  try {
    const { data, error } = await supabase
      .from('organisations')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur mise à jour settings:', error);
    throw error;
  }
};

/**
 * Uploader le logo de l'organisation
 */
export const uploadLogo = async (orgId, file) => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Le fichier ne doit pas dépasser 2 Mo');
    }

    const extension = file.name.split('.').pop();
    const fileName = `logo_${orgId}_${Date.now()}.${extension}`;
    const filePath = `logos/${fileName}`;

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('organisations')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('organisations')
      .getPublicUrl(filePath);

    // Mettre à jour l'organisation avec le nouveau logo
    await updateOrganizationSettings(orgId, { logo_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Erreur upload logo:', error);
    throw error;
  }
};

/**
 * Récupérer les paramètres détaillés
 */
export const getParametres = async (orgId) => {
  try {
    const { data, error } = await supabase
      .from('parametres')
      .select('*')
      .eq('organisation_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    return null;
  }
};

/**
 * Mettre à jour les paramètres détaillés
 */
export const updateParametres = async (orgId, parametres) => {
  try {
    const { data: existing } = await supabase
      .from('parametres')
      .select('id')
      .eq('organisation_id', orgId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('parametres')
        .update({
          ...parametres,
          updated_at: new Date().toISOString()
        })
        .eq('organisation_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('parametres')
        .insert({
          organisation_id: orgId,
          ...parametres
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error);
    throw error;
  }
};
