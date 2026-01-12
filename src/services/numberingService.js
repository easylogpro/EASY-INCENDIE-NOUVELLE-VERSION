// src/services/numberingService.js
// Service de numérotation automatique - SUPABASE

import { supabase } from '../config/supabase';

/**
 * Générer un numéro de client
 */
export const generateClientNumber = async (orgId) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('numero_client')
      .eq('organisation_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0 && data[0].numero_client) {
      const match = data[0].numero_client.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }

    return `CLI-${String(nextNum).padStart(5, '0')}`;
  } catch (error) {
    console.error('Erreur génération numéro client:', error);
    return `CLI-${Date.now()}`;
  }
};

/**
 * Générer un numéro de devis
 */
export const generateDevisNumber = async (orgId) => {
  try {
    const year = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('devis')
      .select('numero')
      .eq('organisation_id', orgId)
      .like('numero', `DEV-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0 && data[0].numero) {
      const match = data[0].numero.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }

    return `DEV-${year}-${String(nextNum).padStart(4, '0')}`;
  } catch (error) {
    console.error('Erreur génération numéro devis:', error);
    return `DEV-${Date.now()}`;
  }
};

/**
 * Générer un numéro de facture
 */
export const generateFactureNumber = async (orgId) => {
  try {
    const year = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('factures')
      .select('numero')
      .eq('organisation_id', orgId)
      .like('numero', `FAC-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0 && data[0].numero) {
      const match = data[0].numero.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }

    return `FAC-${year}-${String(nextNum).padStart(4, '0')}`;
  } catch (error) {
    console.error('Erreur génération numéro facture:', error);
    return `FAC-${Date.now()}`;
  }
};

/**
 * Générer un numéro de SAV
 */
export const generateSavNumber = async (orgId) => {
  try {
    const year = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('sav')
      .select('numero')
      .eq('organisation_id', orgId)
      .like('numero', `SAV-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0 && data[0].numero) {
      const match = data[0].numero.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }

    return `SAV-${year}-${String(nextNum).padStart(4, '0')}`;
  } catch (error) {
    console.error('Erreur génération numéro SAV:', error);
    return `SAV-${Date.now()}`;
  }
};

/**
 * Générer un numéro de site
 */
export const generateSiteCode = async (orgId, clientId) => {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('code_site')
      .eq('organisation_id', orgId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNum = 1;
    if (data && data.length > 0 && data[0].code_site) {
      const match = data[0].code_site.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0]) + 1;
      }
    }

    return `SITE-${String(nextNum).padStart(3, '0')}`;
  } catch (error) {
    console.error('Erreur génération code site:', error);
    return `SITE-${Date.now()}`;
  }
};

export default {
  generateClientNumber,
  generateDevisNumber,
  generateFactureNumber,
  generateSavNumber,
  generateSiteCode
};
