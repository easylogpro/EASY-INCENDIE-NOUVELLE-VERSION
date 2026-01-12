// src/pages/RegisterPage.jsx
// Easy Sécurité - Page d'inscription V5 COMPLÈTE
// - Tous les champs OBLIGATOIRES (email, tel, nom, prénom, entreprise, siret, ville)
// - Sauvegarde des demandes dans demandes_prospects
// - Envoi des emails de bienvenue + séquence

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';
import { sendWelcomeEmail, scheduleEmailSequence } from '../services/emailService';
import { calculatePrice, getAvailableReports, generateRequestSummary } from '../utils/pricingAlgorithm';
import { 
  Flame, Mail, Lock, User, Building2, Phone, MapPin, Hash,
  Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Récupérer les données du questionnaire
  const questionnaireData = location.state?.questionnaireData || null;
  const calculatedPricing = location.state?.pricing || null;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    prenom: '',
    nom: '',
    telephone: '',
    entreprise: '',
    siret: '',
    ville: ''
  });

  // Label avec astérisque obligatoire
  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');

    // Formatage automatique du téléphone
    if (name === 'telephone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      const formatted = cleaned.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
    }
    // Formatage automatique du SIRET (14 chiffres max)
    else if (name === 'siret') {
      const cleaned = value.replace(/\D/g, '').slice(0, 14);
      const formatted = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validation étape 1
  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tous les champs sont obligatoires');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email invalide');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  // Validation étape 2 - TOUS OBLIGATOIRES
  const validateStep2 = () => {
    if (!formData.prenom.trim()) {
      setError('Le prénom est obligatoire');
      return false;
    }
    if (!formData.nom.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }
    // Téléphone OBLIGATOIRE et 10 chiffres
    const telephoneClean = formData.telephone.replace(/\s/g, '');
    if (!telephoneClean) {
      setError('Le téléphone est obligatoire');
      return false;
    }
    if (!/^0[1-9]\d{8}$/.test(telephoneClean)) {
      setError('Le téléphone doit contenir 10 chiffres (ex: 06 12 34 56 78)');
      return false;
    }
    return true;
  };

  // Validation étape 3 - TOUS OBLIGATOIRES
  const validateStep3 = () => {
    if (!formData.entreprise.trim()) {
      setError('Le nom de l\'entreprise est obligatoire');
      return false;
    }
    // SIRET OBLIGATOIRE et 14 chiffres
    const siretClean = formData.siret.replace(/\s/g, '');
    if (!siretClean) {
      setError('Le SIRET est obligatoire');
      return false;
    }
    if (siretClean.length !== 14) {
      setError(`Le SIRET doit contenir exactement 14 chiffres (vous avez ${siretClean.length} chiffres)`);
      return false;
    }
    if (!/^\d{14}$/.test(siretClean)) {
      setError('Le SIRET ne doit contenir que des chiffres');
      return false;
    }
    // Ville OBLIGATOIRE
    if (!formData.ville.trim()) {
      setError('La ville est obligatoire');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  // Inscription complète
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (step === 1) { nextStep(); return; }
    if (step === 2) { nextStep(); return; }
    if (!validateStep3()) return;

    setLoading(true);
    setError('');

    const telephoneClean = formData.telephone.replace(/\s/g, '');
    const siretClean = formData.siret.replace(/\s/g, '');

    try {
      // 1. Créer l'utilisateur Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Mettre à jour le profil Firebase
      await updateProfile(user, { displayName: `${formData.prenom} ${formData.nom}` });

      // 3. Calculer le tarif si données questionnaire
      const pricing = calculatedPricing || (questionnaireData ? 
        calculatePrice(questionnaireData.modulesInteresses, questionnaireData.nombreTechniciens, []) : 
        { basePrice: 59, totalPrice: 59, finalPrice: 53 }
      );

      // 4. Créer l'organisation dans Supabase avec domaines
      const { data: orgData, error: orgError } = await supabase
        .from('organisations')
        .insert({
          nom: formData.entreprise,
          siret: siretClean,
          ville: formData.ville,
          email: formData.email,
          telephone: telephoneClean,
          formule: 'starter',
          // DOMAINES ACTIFS selon questionnaire
          modules_actifs: questionnaireData?.modulesInteresses || ['ssi']
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 5. Créer l'utilisateur dans Supabase
      const { error: userError } = await supabase
        .from('utilisateurs')
        .insert({
          organisation_id: orgData.id,
          firebase_uid: user.uid,
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: telephoneClean,
          role: 'admin'
        });

      if (userError) throw userError;

      // 6. ENREGISTRER LA DEMANDE DU PROSPECT (traçabilité)
      const rapportsFournis = getAvailableReports(
        questionnaireData?.typeActivite || 'mainteneur',
        questionnaireData?.modulesInteresses || ['ssi']
      );

      await supabase.from('demandes_prospects').insert({
        organisation_id: orgData.id,
        email: formData.email,
        telephone: telephoneClean,
        prenom: formData.prenom,
        nom: formData.nom,
        entreprise: formData.entreprise,
        siret: siretClean,
        ville: formData.ville,
        domaines_demandes: questionnaireData?.modulesInteresses || ['ssi'],
        profil_demande: questionnaireData?.typeActivite || 'mainteneur',
        nb_utilisateurs: questionnaireData?.nombreTechniciens || '1',
        nb_sites: questionnaireData?.nombreSites || '1-10',
        tarif_calcule: pricing.totalPrice,
        options_selectionnees: calculatedPricing?.selectedAddons || [],
        rapports_fournis: rapportsFournis
      });

      // 7. ENVOYER L'EMAIL DE BIENVENUE
      await sendWelcomeEmail({
        email: formData.email,
        prenom: formData.prenom,
        nom: formData.nom,
        organisation_id: orgData.id,
        domaines: questionnaireData?.modulesInteresses || ['ssi'],
        tarif: pricing.finalPrice
      });

      // 8. PLANIFIER LA SÉQUENCE D'EMAILS (J+1, J+3, J+5, J+7, J+30)
      await scheduleEmailSequence({
        email: formData.email,
        prenom: formData.prenom,
        organisation_id: orgData.id
      });

      // 9. Rediriger vers la démo si questionnaire, sinon paiement
      if (questionnaireData) {
        navigate('/demo', {
          state: {
            questionnaireData,
            pricing,
            rapportsFournis
          }
        });
      } else {
        navigate('/subscribe');
      }

    } catch (err) {
      console.error('Erreur inscription:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible');
      } else {
        setError(err.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex">
      {/* Colonne gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-900/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">ES</span>
            </div>
            <span className="text-2xl font-black text-white">Easy Sécurité</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Créez votre compte <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Easy Sécurité</span>
          </h1>
          
          {questionnaireData && (
            <div className="mt-8 bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Votre configuration :</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>✓ {(questionnaireData.modulesInteresses || []).length} domaine(s) : {(questionnaireData.modulesInteresses || []).map(d => d.toUpperCase()).join(', ')}</p>
                <p>✓ {questionnaireData.nombreTechniciens || '1'} utilisateur(s)</p>
                <p className="text-xl font-bold text-white mt-4">
                  {calculatedPricing?.finalPrice || 53}€/mois <span className="text-sm font-normal text-green-400">(-10% 1er mois)</span>
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Démo gratuite de 3 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Support inclus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-red-500' : 'bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 && 'Créez votre compte'}
            {step === 2 && 'Vos informations'}
            {step === 3 && 'Votre entreprise'}
          </h2>
          <p className="text-gray-400 mb-6">
            {step === 1 && 'Entrez vos identifiants de connexion'}
            {step === 2 && 'Tous les champs sont obligatoires'}
            {step === 3 && 'Tous les champs sont obligatoires'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Étape 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <RequiredLabel>Email professionnel</RequiredLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="vous@entreprise.fr"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
                <div>
                  <RequiredLabel>Mot de passe</RequiredLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 caractères"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <RequiredLabel>Confirmer le mot de passe</RequiredLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <RequiredLabel>Prénom</RequiredLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Jean"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                    </div>
                  </div>
                  <div>
                    <RequiredLabel>Nom</RequiredLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Dupont"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <RequiredLabel>Téléphone</RequiredLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="06 12 34 56 78"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                  </div>
                  <p className={`text-xs mt-1 ${formData.telephone.replace(/\s/g, '').length === 10 ? 'text-green-400' : 'text-gray-500'}`}>
                    {formData.telephone.replace(/\s/g, '').length}/10 chiffres
                  </p>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <RequiredLabel>Nom de l'entreprise</RequiredLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="entreprise" value={formData.entreprise} onChange={handleChange} placeholder="Ma Société SARL"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                  </div>
                </div>
                <div>
                  <RequiredLabel>SIRET (14 chiffres)</RequiredLabel>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="siret" value={formData.siret} onChange={handleChange} placeholder="123 456 789 00012"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">papillon.entreprises.gouv.fr</p>
                    <p className={`text-xs ${formData.siret.replace(/\s/g, '').length === 14 ? 'text-green-400' : 'text-gray-500'}`}>
                      {formData.siret.replace(/\s/g, '').length}/14 chiffres
                    </p>
                  </div>
                </div>
                <div>
                  <RequiredLabel>Ville</RequiredLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" name="ville" value={formData.ville} onChange={handleChange} placeholder="Paris"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium">
                  Retour
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? 'Accéder à la démo' : 'Continuer'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Déjà un compte ? <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
