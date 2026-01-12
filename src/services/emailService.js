// src/services/emailService.js
// Easy Sécurité - Service d'envoi d'emails

import { supabase } from '../config/supabase';

/**
 * Envoyer un email (log en base pour l'instant)
 */
export const sendEmail = async (to, type, data) => {
  try {
    console.log(`📧 Email "${type}" envoyé à ${to}`, data);

    // Enregistrer dans email_logs
    await supabase.from('email_logs').insert({
      organisation_id: data.organisation_id || null,
      email_to: to,
      email_type: type,
      email_subject: getSubject(type),
      statut: 'sent',
      sent_at: new Date().toISOString(),
      metadata: data
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
};

/**
 * Obtenir le sujet selon le type
 */
const getSubject = (type) => {
  const subjects = {
    bienvenue: '🔥 Bienvenue sur Easy Sécurité !',
    rappel_profil: '⚙️ Complétez votre profil Easy Sécurité',
    rappel_clients: '📁 Importez vos clients en 2 clics',
    rappel_rapport: '📝 Créez votre premier rapport !',
    checkin: '👋 Comment ça se passe ?',
    anniversaire_1_mois: '🎂 1 mois avec Easy Sécurité !'
  };
  return subjects[type] || 'Easy Sécurité';
};

/**
 * Envoyer l'email de bienvenue
 */
export const sendWelcomeEmail = async (userData) => {
  return sendEmail(userData.email, 'bienvenue', {
    prenom: userData.prenom,
    nom: userData.nom,
    organisation_id: userData.organisation_id,
    domaines: userData.domaines,
    tarif: userData.tarif
  });
};

/**
 * Planifier la séquence d'emails (J+1, J+3, J+5, J+7, J+30)
 */
export const scheduleEmailSequence = async (userData) => {
  const sequence = [
    { delay: 1, type: 'rappel_profil' },
    { delay: 3, type: 'rappel_clients' },
    { delay: 5, type: 'rappel_rapport' },
    { delay: 7, type: 'checkin' },
    { delay: 30, type: 'anniversaire_1_mois' }
  ];

  for (const item of sequence) {
    const sendAt = new Date();
    sendAt.setDate(sendAt.getDate() + item.delay);

    await supabase.from('email_logs').insert({
      organisation_id: userData.organisation_id,
      email_to: userData.email,
      email_type: item.type,
      email_subject: getSubject(item.type),
      statut: 'scheduled',
      sent_at: sendAt.toISOString()
    });
  }

  console.log(`📅 Séquence email planifiée pour ${userData.email}`);
  return { success: true };
};

export default { sendEmail, sendWelcomeEmail, scheduleEmailSequence };
