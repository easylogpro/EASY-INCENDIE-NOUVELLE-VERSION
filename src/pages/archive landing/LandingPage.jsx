// src/pages/LandingPage.jsx
// Easy Sécurité (Incendie) - Landing Page V5
// AVEC passage des données du questionnaire vers inscription

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Flame, FileText, BarChart3, Users, Building2, 
  CheckCircle2, ArrowRight, Star, ChevronDown, ChevronUp,
  Zap, Clock, Cloud, Lock, Phone, Mail, MapPin,
  AlertTriangle, Gauge, ClipboardCheck, Settings, Plus, Minus,
  Sparkles, BookOpen, Calculator, Brain, Bell, Download
} from 'lucide-react';
import { calculatePrice, getAvailableReports, getDomainLabels } from '../utils/pricingAlgorithm';

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    modulesInteresses: [],
    typeActivite: '',
    nombreTechniciens: '',
    nombreSites: '',
    logicielActuel: ''
  });
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  // ============================================================
  // LOGO ANIMÉ
  // ============================================================
  const AnimatedLogo = ({ size = "normal" }) => {
    const sizeClasses = size === "large" ? "w-16 h-16" : "w-12 h-12";
    const textSize = size === "large" ? "text-4xl" : "text-2xl";
    
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`${sizeClasses} bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30`}>
            <span className={`text-white font-black ${textSize}`}>E</span>
            <span className={`text-white font-black ${textSize} animate-pulse`}>S</span>
          </div>
          <div className="absolute -top-3 -right-3">
            <Flame className="w-7 h-7 text-orange-500 animate-bounce" style={{ animationDuration: '1s' }} />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`${textSize} font-black text-white`}>Easy</span>
            <span className={`${textSize} font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400`}>Sécurité</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // FOND ANIMÉ
  // ============================================================
  const DynamicBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-950/20 to-gray-900" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );

  // ============================================================
  // QUESTIONS DU QUESTIONNAIRE
  // ============================================================
  const questions = [
    {
      id: 'modulesInteresses',
      question: 'Quels sont vos domaines d\'intervention ?',
      subtitle: 'Sélectionnez tous les domaines que vous couvrez',
      multiple: true,
      options: [
        { value: 'ssi', label: 'SSI (Système Sécurité Incendie)', icon: Shield, color: 'red' },
        { value: 'dsf', label: 'Désenfumage (Naturel / Mécanique)', icon: Gauge, color: 'orange' },
        { value: 'compartimentage', label: 'Compartimentage (Portes CF, Clapets)', icon: Building2, color: 'yellow' },
        { value: 'baes', label: 'BAES / Éclairage de sécurité', icon: Zap, color: 'green' },
        { value: 'extincteurs', label: 'Extincteurs', icon: AlertTriangle, color: 'red' },
        { value: 'colonnes_seches', label: 'Colonnes sèches', icon: Settings, color: 'blue' },
        { value: 'ria', label: 'RIA (Robinets Incendie Armés)', icon: Shield, color: 'cyan' }
      ]
    },
    {
      id: 'typeActivite',
      question: 'Vous êtes ?',
      subtitle: 'Sélectionnez votre activité principale',
      options: [
        { value: 'installateur_mainteneur', label: 'Installateur / Mainteneur', icon: Settings, description: 'Installation et maintenance' },
        { value: 'mainteneur', label: 'Mainteneur', icon: ClipboardCheck, description: 'Maintenance et vérifications' },
        { value: 'installateur', label: 'Installateur', icon: Zap, description: 'Installation uniquement' },
        { value: 'sous_traitant', label: 'Sous-traitant', icon: Users, description: 'Travaux en sous-traitance' },
        { value: 'artisan', label: 'Artisan', icon: Building2, description: 'Activité indépendante' }
      ]
    },
    {
      id: 'nombreTechniciens',
      question: 'Combien d\'utilisateurs auront accès ?',
      subtitle: 'Incluez-vous dans le comptage',
      options: [
        { value: '1', label: '1 utilisateur (moi seul)', icon: Users },
        { value: '2-5', label: '2 à 5 utilisateurs', icon: Users },
        { value: '6-10', label: '6 à 10 utilisateurs', icon: Users },
        { value: '11-25', label: '11 à 25 utilisateurs', icon: Users }
      ]
    },
    {
      id: 'nombreSites',
      question: 'Combien de sites gérez-vous ?',
      subtitle: 'Nombre approximatif',
      options: [
        { value: '1-10', label: '1 à 10 sites', icon: Building2 },
        { value: '11-50', label: '11 à 50 sites', icon: Building2 },
        { value: '51-100', label: '51 à 100 sites', icon: Building2 },
        { value: '100+', label: 'Plus de 100 sites', icon: Building2 }
      ]
    },
    {
      id: 'logicielActuel',
      question: 'Comment gérez-vous actuellement ?',
      subtitle: 'Votre outil actuel',
      options: [
        { value: 'excel', label: 'Excel / Tableurs', icon: FileText },
        { value: 'papier', label: 'Papier / Carnets', icon: ClipboardCheck },
        { value: 'logiciel', label: 'Autre logiciel', icon: Settings },
        { value: 'rien', label: 'Pas d\'outil dédié', icon: AlertTriangle }
      ]
    }
  ];

  // ============================================================
  // OPTIONS ADDITIONNELLES
  // ============================================================
  const addons = [
    { id: 'ia', name: 'Module IA', description: 'Intelligence artificielle pour vos rapports', price: 9, icon: Brain },
    { id: 'export_compta', name: 'Export comptable', description: 'Export vers votre logiciel comptable', price: 5, icon: Calculator },
    { id: 'veille_reglementaire', name: 'Veille réglementaire', description: 'Alertes évolutions normatives', price: 5, icon: Bell }
  ];

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // ============================================================
  // CALCUL DU PRIX AVEC L'ALGORITHME
  // ============================================================
  const pricing = useMemo(() => {
    return calculatePrice(
      formData.modulesInteresses || [],
      formData.nombreTechniciens || '1',
      selectedAddons
    );
  }, [formData.modulesInteresses, formData.nombreTechniciens, selectedAddons]);

  // Rapports disponibles selon le profil
  const availableReports = useMemo(() => {
    return getAvailableReports(
      formData.typeActivite || 'mainteneur',
      formData.modulesInteresses || []
    );
  }, [formData.typeActivite, formData.modulesInteresses]);

  // ============================================================
  // GESTION DES RÉPONSES
  // ============================================================
  const handleAnswer = (value) => {
    const currentQuestion = questions[currentStep];
    
    if (currentQuestion.multiple) {
      const currentValues = formData[currentQuestion.id] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setFormData({ ...formData, [currentQuestion.id]: newValues });
    } else {
      setFormData({ ...formData, [currentQuestion.id]: value });
      if (currentStep < questions.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 300);
      } else {
        setTimeout(() => setShowPricing(true), 300);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPricing(true);
    }
  };

  // ============================================================
  // NAVIGATION VERS INSCRIPTION AVEC DONNÉES
  // ============================================================
  const handleStartRegistration = () => {
    navigate('/register', {
      state: {
        questionnaireData: formData,
        pricing: {
          ...pricing,
          selectedAddons,
          availableReports
        }
      }
    });
  };

  // ============================================================
  // FAQ
  // ============================================================
  const faqs = [
    {
      question: 'Easy Sécurité aide-t-il à la conformité ?',
      answer: 'Oui ! Easy Sécurité est un assistant qui vous aide à rédiger vos rapports selon les normes en vigueur. Les rapports sont pré-remplis selon les normes APSAD, NF et les arrêtés applicables pour faciliter vos vérifications.'
    },
    {
      question: 'Comment fonctionne la démo ?',
      answer: 'Après inscription, vous accédez à une démo de 3 minutes en lecture seule. Vous verrez le dashboard, les rapports correspondant à vos domaines, et l\'interface complète. Pour créer des rapports, il faudra souscrire.'
    },
    {
      question: 'Puis-je changer de formule ?',
      answer: 'Absolument ! Vous pouvez modifier votre nombre d\'utilisateurs ou ajouter des domaines à tout moment depuis votre espace. La facturation s\'ajuste automatiquement.'
    },
    {
      question: 'Y a-t-il un engagement ?',
      answer: 'Non, aucun engagement. Vous pouvez résilier à tout moment. Nous offrons -10% sur le premier mois pour vous permettre de tester sereinement.'
    },
    {
      question: 'L\'application mobile est-elle incluse ?',
      answer: 'Oui, l\'application mobile iOS et Android est incluse dans tous les abonnements. Vos techniciens peuvent remplir les rapports sur le terrain, même hors connexion.'
    }
  ];

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <DynamicBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <AnimatedLogo />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Connexion
            </button>
            <button 
              onClick={() => document.getElementById('questionnaire').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
            >
              Commencer
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-300">Logiciel de gestion sécurité incendie</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Gérez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">rapports incendie</span> simplement
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            SSI, Désenfumage, BAES, Extincteurs, RIA... Tous vos rapports de vérification et maintenance en un seul outil.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              onClick={() => document.getElementById('questionnaire').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/25 flex items-center gap-2"
            >
              Configurer ma solution
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Démo 3 min gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>-10% premier mois</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Sans engagement</span>
            </div>
          </div>
        </div>
      </section>

      {/* Questionnaire Section */}
      <section id="questionnaire" className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              Configurez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">solution</span>
            </h2>
            <p className="text-gray-400">Répondez à quelques questions pour obtenir votre tarif personnalisé</p>
          </div>

          {!showPricing ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{questions[currentStep].question}</h3>
                <p className="text-gray-400">{questions[currentStep].subtitle}</p>
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {questions[currentStep].options.map((option) => {
                  const isSelected = questions[currentStep].multiple
                    ? (formData[questions[currentStep].id] || []).includes(option.value)
                    : formData[questions[currentStep].id] === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gray-700'
                      }`}>
                        <option.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-white block">{option.label}</span>
                        {option.description && (
                          <span className="text-sm text-gray-400">{option.description}</span>
                        )}
                      </div>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-red-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                  className={`text-gray-400 hover:text-white ${currentStep === 0 ? 'invisible' : ''}`}
                >
                  ← Précédent
                </button>
                {questions[currentStep].multiple && (
                  <button
                    onClick={nextStep}
                    disabled={(formData[questions[currentStep].id] || []).length === 0}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuer →
                  </button>
                )}
              </div>
            </div>
          ) : (
            // ============================================================
            // RÉSULTAT TARIFICATION
            // ============================================================
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">Votre tarif personnalisé</span>
                  </div>
                  
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-2">
                    {pricing.finalPrice}€<span className="text-2xl">/mois</span>
                  </div>
                  <p className="text-gray-400">Premier mois (-10%)</p>
                  <p className="text-sm text-gray-500">Puis {pricing.totalPrice}€/mois</p>
                </div>

                {/* Résumé */}
                <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold mb-4">Votre configuration</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{pricing.domainCount} domaine(s)</span>
                      <div className="flex gap-1">
                        {(formData.modulesInteresses || []).map(d => (
                          <span key={d} className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs">
                            {d.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Utilisateurs</span>
                      <span className="text-white">{formData.nombreTechniciens}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-3">
                      <span className="text-gray-400">Prix de base</span>
                      <span className="text-white">{pricing.basePrice}€/mois</span>
                    </div>
                    {pricing.addonsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Options</span>
                        <span className="text-white">+{pricing.addonsTotal}€/mois</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button 
                  onClick={handleStartRegistration}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                >
                  Créer mon compte et tester
                </button>
                <p className="text-center text-gray-500 text-xs mt-3">Démo 3 min → Paiement → Accès complet</p>
              </div>

              {/* Options additionnelles */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Options additionnelles
                </h3>

                <div className="space-y-3">
                  {addons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected ? 'border-red-500 bg-red-500/10' : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-red-500' : 'bg-gray-700'
                        }`}>
                          <addon.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-white">{addon.name}</span>
                          <p className="text-sm text-gray-400">{addon.description}</p>
                        </div>
                        <span className="text-red-400 font-bold">+{addon.price}€</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-red-500 bg-red-500' : 'border-gray-600'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modifier */}
              <div className="text-center">
                <button
                  onClick={() => { setShowPricing(false); setCurrentStep(0); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Modifier mes réponses
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">fréquentes</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-white pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-red-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-3xl p-12 backdrop-blur-sm">
            <Flame className="w-16 h-16 text-orange-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black mb-4">
              Prêt à simplifier votre gestion ?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Rejoignez les professionnels qui font confiance à Easy Sécurité
            </p>
            <button 
              onClick={() => document.getElementById('questionnaire').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-red-500/30 hover:shadow-red-500/50"
            >
              Configurer ma solution
            </button>
            <p className="text-gray-400 mt-4 text-sm">Démo gratuite • -10% premier mois • Sans engagement</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <AnimatedLogo />
              <p className="text-gray-400 mt-4 text-sm">
                La solution de gestion pour les professionnels de la sécurité incendie.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#questionnaire" className="hover:text-red-400 transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-red-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">CGV</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contact@easy-securite.fr
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  01 23 45 67 89
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            © 2025 Easy Sécurité. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
