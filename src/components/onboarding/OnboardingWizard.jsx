// src/components/onboarding/OnboardingWizard.jsx
// Easy Sécurité - Assistant de configuration OBLIGATOIRE première connexion
// Se coupe automatiquement à la dernière étape

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { 
  CheckCircle2, Settings, Building2, MapPin, Wrench, Users, FileText,
  ArrowRight, ArrowLeft, Sparkles, Rocket, Shield, AlertCircle
} from 'lucide-react';

const OnboardingWizard = ({ onComplete }) => {
  const navigate = useNavigate();
  const { orgId, orgSettings, refreshUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState({});

  // ============================================================
  // ÉTAPES DE L'ONBOARDING
  // L'ordre est important: Paramètres → Client → Site → Technicien → Fin
  // ============================================================
  const steps = [
    { 
      id: 'welcome', 
      label: 'Bienvenue', 
      icon: Sparkles,
      title: '🎉 Bienvenue sur Easy Sécurité !',
      description: 'Cet assistant va vous guider pour configurer votre espace de travail. Suivez les étapes pour être opérationnel rapidement.',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Shield className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-900">Gestion complète</h4>
              <p className="text-sm text-blue-700">Clients, sites, contrats, interventions - tout centralisé</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-green-900">Rapports professionnels</h4>
              <p className="text-sm text-green-700">Générez des rapports conformes en quelques clics</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">5 étapes pour démarrer</p>
              <p className="text-sm text-amber-700">Prenez 5 minutes pour configurer votre espace. Vous pouvez toujours compléter plus tard.</p>
            </div>
          </div>
        </div>
      ),
      action: null
    },
    { 
      id: 'parametres', 
      label: 'Paramètres', 
      icon: Settings,
      title: '⚙️ Étape 1 : Paramètres de l\'entreprise',
      description: 'Configurez les informations de votre entreprise qui apparaîtront sur vos rapports et devis.',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">À configurer :</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">1</span>
                </div>
                <span><strong>Logo de l'entreprise</strong> - Apparaît sur tous vos documents</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">2</span>
                </div>
                <span><strong>Mentions légales</strong> - SIRET, assurance RC, décennale</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">3</span>
                </div>
                <span><strong>Coordonnées bancaires</strong> - Pour vos factures</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 italic">
            💡 Conseil : Complétez au minimum votre logo et vos coordonnées pour des rapports professionnels.
          </p>
        </div>
      ),
      action: { label: 'Aller aux paramètres', route: '/settings' }
    },
    { 
      id: 'client', 
      label: 'Premier client', 
      icon: Building2,
      title: '🏢 Étape 2 : Créer votre premier client',
      description: 'Un client est une entreprise ou un particulier pour qui vous réalisez des interventions.',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informations à renseigner :</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Raison sociale / Nom du client</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Adresse de facturation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Contact principal (nom, téléphone, email)</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 italic">
            💡 Vous pourrez ajouter d'autres clients à tout moment depuis le menu "Clients".
          </p>
        </div>
      ),
      action: { label: 'Créer un client', route: '/clients' }
    },
    { 
      id: 'site', 
      label: 'Premier site', 
      icon: MapPin,
      title: '📍 Étape 3 : Ajouter un site d\'intervention',
      description: 'Un site est un lieu physique où vous intervenez. Un client peut avoir plusieurs sites.',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informations du site :</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Nom du site (ex: "Siège social", "Usine Nord")</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Adresse complète</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Type d'ERP et catégorie (si applicable)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Domaines actifs (SSI, Désenfumage, BAES...)</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 italic">
            💡 Les équipements seront associés au site pour générer des rapports adaptés.
          </p>
        </div>
      ),
      action: { label: 'Créer un site', route: '/sites' }
    },
    { 
      id: 'technicien', 
      label: 'Technicien', 
      icon: Users,
      title: '👷 Étape 4 : Ajouter un technicien',
      description: 'Les techniciens réalisent les interventions sur le terrain et signent les rapports.',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informations du technicien :</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Nom, prénom, téléphone</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Habilitations et certifications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Sites affectés (optionnel)</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 italic">
            💡 Si vous travaillez seul, vous pouvez vous ajouter comme technicien.
          </p>
        </div>
      ),
      action: { label: 'Ajouter un technicien', route: '/techniciens' }
    },
    { 
      id: 'finish', 
      label: 'Terminé', 
      icon: Rocket,
      title: '🚀 Vous êtes prêt !',
      description: 'Votre espace est configuré. Vous pouvez maintenant créer vos premiers rapports.',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-green-900 mb-2">Configuration terminée !</h4>
            <p className="text-green-700">Votre espace Easy Sécurité est prêt à l'emploi.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Prochaines étapes :</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span>Créez votre premier rapport d'intervention</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span>Planifiez vos maintenances dans le calendrier</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span>Créez vos contrats de maintenance</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      action: null
    }
  ];

  // ============================================================
  // NAVIGATION ENTRE ÉTAPES
  // ============================================================
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToAction = (route) => {
    // Marquer l'étape comme vue
    setStepsCompleted(prev => ({ ...prev, [steps[currentStep].id]: true }));
    // Naviguer vers la page
    navigate(route);
  };

  // ============================================================
  // TERMINER L'ONBOARDING (automatique à la dernière étape)
  // ============================================================
  const handleComplete = async () => {
    setLoading(true);
    try {
      if (!orgId) throw new Error('organisation_id introuvable');
      
      // Marquer TOUTES les étapes comme complétées
      await supabase
        .from('onboarding_progress')
        .upsert({
          organisation_id: orgId,
          step_profil: true,
          step_logo: true,
          step_client: true,
          step_site: true,
          step_equipement: true,
          step_technicien: true,
          step_rapport: true,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organisation_id'
        });
      
      console.log('✅ Onboarding terminé et enregistré');
      
      if (refreshUserData) await refreshUserData();
      onComplete();
    } catch (error) {
      console.error('Erreur handleComplete:', error);
      // On ferme quand même pour ne pas bloquer l'utilisateur
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header - PAS de bouton fermer (obligatoire) */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
          <h2 className="text-2xl font-bold">Configuration initiale</h2>
          <p className="opacity-90 text-sm">Étape {currentStep + 1} sur {steps.length}</p>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    index < currentStep 
                      ? 'bg-green-500 text-white' 
                      : index === currentStep 
                        ? 'bg-red-500 text-white ring-4 ring-red-100' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-12 h-1 mx-1 rounded ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {currentStepData.label}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 mb-6">
            {currentStepData.description}
          </p>
          
          {currentStepData.content}

          {/* Bouton d'action si présent */}
          {currentStepData.action && (
            <div className="mt-6">
              <button
                onClick={() => goToAction(currentStepData.action.route)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {currentStepData.action.label}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Vous pourrez revenir à cette configuration plus tard
              </p>
            </div>
          )}
        </div>

        {/* Footer - Navigation */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>

          <div className="flex items-center gap-3">
            {!isLastStep && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Passer
              </button>
            )}
            
            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Finalisation...
                  </>
                ) : (
                  <>
                    Commencer à utiliser Easy Sécurité
                    <Rocket className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-orange-600"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
