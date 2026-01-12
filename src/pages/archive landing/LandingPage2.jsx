import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Flame, FileText, BarChart3, Users, Building2, 
  CheckCircle2, ArrowRight, Star, ChevronDown, ChevronUp,
  Zap, Clock, Cloud, Lock, Phone, Mail, MapPin,
  AlertTriangle, Gauge, ClipboardCheck, Settings, Plus, Minus,
  Sparkles, BookOpen, Calculator, Brain, Bell, Download
} from 'lucide-react';

// ============================================================
// LANDING PAGE - EASY SÉCURITÉ (Incendie) V2
// Avec algorithme de recommandation et tarif dynamique
// ============================================================

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
  // LOGO ANIMÉ AVEC MÈCHE QUI SE CONSUME
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
          {/* Flamme animée */}
          <div className="absolute -top-3 -right-3">
            <div className="relative">
              <Flame className="w-7 h-7 text-orange-500 animate-flicker" />
              <Flame className="w-7 h-7 text-yellow-400 absolute top-0 left-0 animate-flicker-delay opacity-50" />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className={`${textSize} font-black text-white`}>Easy</span>
            <span className={`${textSize} font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400`}>Sécurité</span>
          </div>
          {/* Barre mèche qui se consume */}
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full animate-burn" />
          </div>
        </div>
        
        <style>{`
          @keyframes flicker {
            0%, 100% { opacity: 1; transform: scale(1) rotate(-3deg); }
            25% { opacity: 0.9; transform: scale(1.05) rotate(2deg); }
            50% { opacity: 0.8; transform: scale(1.1) rotate(-2deg); }
            75% { opacity: 0.95; transform: scale(1.02) rotate(3deg); }
          }
          @keyframes flicker-delay {
            0%, 100% { opacity: 0.5; transform: scale(0.9) rotate(3deg); }
            50% { opacity: 0.3; transform: scale(1) rotate(-3deg); }
          }
          @keyframes burn {
            0% { width: 0%; background-position: 0% 50%; }
            50% { width: 100%; background-position: 100% 50%; }
            100% { width: 0%; background-position: 0% 50%; }
          }
          .animate-flicker { animation: flicker 1.5s infinite; }
          .animate-flicker-delay { animation: flicker-delay 2s infinite 0.5s; }
          .animate-burn { animation: burn 4s ease-in-out infinite; }
        `}</style>
      </div>
    );
  };

  // ============================================================
  // FOND DYNAMIQUE ANIMÉ
  // ============================================================
  const DynamicBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient de base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-950/20 to-gray-900" />
      
      {/* Particules de feu */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
              background: `radial-gradient(circle, ${['#f97316', '#ef4444', '#eab308'][i % 3]} 0%, transparent 70%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      
      {/* Cercles lumineux */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
        .animate-float-up { animation: float-up linear infinite; }
      `}</style>
    </div>
  );

  // ============================================================
  // QUESTIONS DU FORMULAIRE (Nouvel ordre)
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
      question: 'Combien de techniciens avez-vous ?',
      subtitle: 'Incluez-vous dans le comptage',
      options: [
        { value: '1', label: '1 technicien (moi seul)', icon: Users },
        { value: '2-5', label: '2 à 5 techniciens', icon: Users },
        { value: '6-10', label: '6 à 10 techniciens', icon: Users },
        { value: '11-20', label: '11 à 20 techniciens', icon: Users },
        { value: '20+', label: 'Plus de 20 techniciens', icon: Users }
      ]
    },
    {
      id: 'nombreSites',
      question: 'Combien de sites gérez-vous ?',
      subtitle: 'Sites clients sous contrat ou interventions régulières',
      options: [
        { value: '1-50', label: '1 à 50 sites', icon: Building2 },
        { value: '51-100', label: '51 à 100 sites', icon: Building2 },
        { value: '101-500', label: '101 à 500 sites', icon: Building2 },
        { value: '500+', label: 'Plus de 500 sites', icon: Building2 }
      ]
    },
    {
      id: 'logicielActuel',
      question: 'Comment gérez-vous votre activité actuellement ?',
      subtitle: 'Votre outil actuel de gestion',
      options: [
        { value: 'aucun', label: 'Papier / Excel', icon: FileText, description: 'Gestion manuelle' },
        { value: 'autre', label: 'Un autre logiciel métier', icon: Settings, description: 'Solution existante' },
        { value: 'crm', label: 'CRM généraliste', icon: BarChart3, description: 'Non spécialisé' }
      ]
    }
  ];

  // ============================================================
  // MODULES ADDITIONNELS
  // ============================================================
  const addons = [
    {
      id: 'ia',
      name: 'Module IA',
      description: 'Génération automatique de rapports, analyse prédictive des anomalies',
      price: 29,
      icon: Brain,
      popular: true
    },
    {
      id: 'veille',
      name: 'Veille réglementaire',
      description: 'Alertes normes APSAD, NF, arrêtés... toujours à jour',
      price: 19,
      icon: Bell,
      popular: false
    },
    {
      id: 'export',
      name: 'Export comptable',
      description: 'Export automatique vers votre logiciel comptable',
      price: 15,
      icon: Download,
      popular: false
    },
    {
      id: 'formation',
      name: 'Module Formation',
      description: 'Suivi des habilitations et formations de vos techniciens',
      price: 19,
      icon: BookOpen,
      popular: false
    }
  ];

  // ============================================================
  // ALGORITHME DE RECOMMANDATION
  // ============================================================
  const recommendation = useMemo(() => {
    const modules = formData.modulesInteresses || [];
    const activite = formData.typeActivite;
    const nbTech = formData.nombreTechniciens;
    
    // Rapports recommandés selon les domaines
    const rapportsParDomaine = {
      ssi: ['Vérification SSI (ECS/CMSI)', 'Rapport annuel SSI', 'Contrôle détecteurs'],
      dsf: ['Rapport DSF Naturel', 'Rapport DSF Mécanique', 'Mesures aérauliques'],
      compartimentage: ['Vérification portes CF', 'Contrôle clapets CF', 'Test ferme-portes'],
      baes: ['Vérification BAES', 'Autonomie éclairage sécurité', 'Test télécommande'],
      extincteurs: ['Vérification extincteurs', 'Rapport maintenance', 'Requalification'],
      colonnes_seches: ['Vérification colonnes sèches', 'Essai pression', 'Contrôle étanchéité'],
      ria: ['Vérification RIA', 'Test pression/débit', 'Contrôle tuyaux']
    };
    
    // Rapports spécifiques selon l'activité
    const rapportsParActivite = {
      installateur_mainteneur: ['Rapport mise en service', 'Visite de chantier', 'Rapport maintenance', 'Formation SSI'],
      mainteneur: ['Rapport maintenance', 'Rapport SAV', 'Formation SSI', 'Suivi contrats'],
      installateur: ['Rapport mise en service', 'Visite de chantier', 'PV réception', 'Rapport essais'],
      sous_traitant: ['Rapport travaux', 'Compte-rendu intervention', 'Fiche pointage'],
      artisan: ['Rapport travaux', 'Compte-rendu intervention', 'Devis rapide']
    };
    
    // Calcul du prix de base
    let basePrice = 79;
    let techInclus = 1;
    let planName = 'Starter';
    
    if (nbTech === '2-5') {
      basePrice = 149;
      techInclus = 5;
      planName = 'Pro';
    } else if (nbTech === '6-10' || nbTech === '11-20') {
      basePrice = 299;
      techInclus = 15;
      planName = 'Premium';
    } else if (nbTech === '20+') {
      basePrice = 499;
      techInclus = 30;
      planName = 'Entreprise';
    }
    
    // Modules inclus selon les domaines sélectionnés
    const modulesInclus = modules.map(m => {
      const labels = {
        ssi: 'SSI',
        dsf: 'Désenfumage',
        compartimentage: 'Compartimentage',
        baes: 'BAES',
        extincteurs: 'Extincteurs',
        colonnes_seches: 'Colonnes sèches',
        ria: 'RIA'
      };
      return labels[m];
    });
    
    // Rapports recommandés
    let rapports = [];
    modules.forEach(m => {
      if (rapportsParDomaine[m]) {
        rapports = [...rapports, ...rapportsParDomaine[m]];
      }
    });
    if (activite && rapportsParActivite[activite]) {
      rapports = [...rapports, ...rapportsParActivite[activite]];
    }
    rapports = [...new Set(rapports)].slice(0, 8); // Unique et max 8
    
    return {
      planName,
      basePrice,
      techInclus,
      modulesInclus,
      rapports,
      activiteLabel: activite ? questions[1].options.find(o => o.value === activite)?.label : ''
    };
  }, [formData]);

  // ============================================================
  // CALCUL DU PRIX TOTAL
  // ============================================================
  const totalPrice = useMemo(() => {
    let total = recommendation.basePrice;
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    return total;
  }, [recommendation.basePrice, selectedAddons]);

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

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowPricing(true);
    }
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  // ============================================================
  // FONCTIONNALITÉS PRINCIPALES
  // ============================================================
  const features = [
    {
      icon: FileText,
      title: 'Rapports Spécialisés',
      description: 'SSI, DSF, BAES, Extincteurs... Rapports conformes aux normes en quelques clics',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Tableau de Bord',
      description: 'Statistiques en temps réel, suivi des interventions et conformité instantanée',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: Users,
      title: 'Gestion Techniciens',
      description: 'Planning, qualifications, géolocalisation et suivi des interventions terrain',
      color: 'from-yellow-500 to-red-500'
    },
    {
      icon: Building2,
      title: 'Gestion Sites & Clients',
      description: 'Base complète ERP, IGH, habitations avec historique et équipements',
      color: 'from-red-600 to-red-400'
    },
    {
      icon: ClipboardCheck,
      title: 'Checklists Normatives',
      description: 'Vérifications APSAD, NF S61-933, NF S62-200... toujours à jour',
      color: 'from-orange-600 to-orange-400'
    },
    {
      icon: Cloud,
      title: '100% Cloud',
      description: 'Accessible partout, synchronisation temps réel, sauvegarde automatique',
      color: 'from-red-500 to-yellow-500'
    }
  ];

  // ============================================================
  // FAQ
  // ============================================================
  const faqs = [
    {
      question: "Quels types de rapports puis-je générer ?",
      answer: "Easy Sécurité génère tous les rapports réglementaires : vérifications SSI (ECS, CMSI), DSF naturel et mécanique, BAES, extincteurs, RIA, colonnes sèches, portes coupe-feu. Tous conformes aux normes APSAD et NF en vigueur."
    },
    {
      question: "L'application fonctionne-t-elle hors connexion ?",
      answer: "Oui ! L'application mobile fonctionne en mode hors ligne. Toutes les données sont synchronisées automatiquement dès que la connexion est rétablie."
    },
    {
      question: "Puis-je importer mes données existantes ?",
      answer: "Absolument. Nous proposons un import Excel/CSV de vos clients, sites et équipements. Notre équipe peut également vous accompagner dans la migration de vos données."
    },
    {
      question: "Comment fonctionne le système de QR codes ?",
      answer: "Chaque équipement peut avoir un QR code unique. En le scannant, vos clients accèdent à l'historique des interventions et peuvent signaler un problème directement."
    },
    {
      question: "Y a-t-il un engagement de durée ?",
      answer: "Non, tous nos abonnements sont sans engagement. Vous pouvez résilier à tout moment. Nous proposons également une remise de 20% pour un paiement annuel."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Fond dynamique */}
      <DynamicBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <AnimatedLogo />
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-red-400 transition-colors">Fonctionnalités</a>
              <a href="#questionnaire" className="text-gray-300 hover:text-red-400 transition-colors">Configurateur</a>
              <a href="#faq" className="text-gray-300 hover:text-red-400 transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Connexion
              </button>
              <button 
                onClick={() => document.getElementById('questionnaire').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
              >
                Essai gratuit
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo grand format */}
            <div className="flex justify-center mb-8">
              <AnimatedLogo size="large" />
            </div>

            {/* Titre principal */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">La plateforme</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                tout-en-un
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Pour les professionnels de la <span className="text-red-400 font-semibold">sécurité incendie</span>
            </p>

            {/* Sous-titre */}
            <p className="text-gray-400 mb-12 max-w-xl mx-auto">
              SSI, DSF, BAES, Extincteurs, RIA, Colonnes sèches... 
              Gérez toutes vos interventions et rapports depuis une seule plateforme.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('questionnaire').scrollIntoView({ behavior: 'smooth' })}
                className="group bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Configurer ma solution sur mesure
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>14 jours d'essai gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Support français</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tout ce dont vous avez <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">besoin</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Une solution complète pour gérer votre activité de sécurité incendie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-red-500/50 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-red-500/10 backdrop-blur-sm"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questionnaire / Configurateur Section */}
      <section id="questionnaire" className="py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              <Sparkles className="w-8 h-8 inline-block text-yellow-400 mr-2" />
              Configurez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">solution sur mesure</span>
            </h2>
            <p className="text-gray-400">Répondez à quelques questions pour une recommandation personnalisée</p>
          </div>

          {!showPricing ? (
            <>
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Question {currentStep + 1} sur {questions.length}</span>
                  <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                <div className="mb-2">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
                    {questions[currentStep].question}
                  </h3>
                  {questions[currentStep].subtitle && (
                    <p className="text-gray-400 mt-2 ml-10">{questions[currentStep].subtitle}</p>
                  )}
                </div>

                <div className={`grid gap-4 mt-6 ${questions[currentStep].multiple ? 'md:grid-cols-2' : ''}`}>
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
                            ? 'border-red-500 bg-red-500/10 text-white shadow-lg shadow-red-500/20'
                            : 'border-gray-700 hover:border-red-500/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-red-500 to-orange-500' 
                            : 'bg-gray-700'
                        }`}>
                          <option.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold block">{option.label}</span>
                          {option.description && (
                            <span className="text-sm text-gray-400">{option.description}</span>
                          )}
                        </div>
                        {isSelected && <CheckCircle2 className="w-6 h-6 text-red-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédent
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={
                      !formData[questions[currentStep].id] || 
                      (Array.isArray(formData[questions[currentStep].id]) && formData[questions[currentStep].id].length === 0)
                    }
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/25 disabled:shadow-none flex items-center gap-2"
                  >
                    {currentStep === questions.length - 1 ? 'Voir ma solution' : 'Suivant'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ============================================================
               RÉSULTAT - SOLUTION PERSONNALISÉE
               ============================================================ */
            <div className="space-y-8">
              {/* Titre résultat */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium">Votre solution personnalisée est prête !</span>
                </div>
              </div>

              {/* Carte solution principale */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Colonne gauche - Détails */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">Easy Sécurité {recommendation.planName}</h3>
                        <p className="text-gray-400">Solution {recommendation.activiteLabel}</p>
                      </div>
                    </div>

                    {/* Modules inclus */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Modules inclus</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.modulesInclus.map((module, i) => (
                          <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium">
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rapports recommandés */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Rapports recommandés pour vous</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {recommendation.rapports.map((rapport, i) => (
                          <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            {rapport}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fonctionnalités incluses */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Inclus dans votre offre</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          {recommendation.techInclus} technicien{recommendation.techInclus > 1 ? 's' : ''} inclus
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Application mobile iOS & Android
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Stockage documents illimité
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Support technique inclus
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Colonne droite - Prix */}
                  <div className="lg:w-80 bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                    <div className="text-center mb-6">
                      <p className="text-gray-400 text-sm mb-1">Votre tarif mensuel</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black text-white">{totalPrice}</span>
                        <span className="text-xl text-gray-400">€/mois</span>
                      </div>
                      <p className="text-sm text-green-400 mt-2">+10€/technicien supplémentaire</p>
                    </div>

                    <div className="border-t border-gray-700 pt-4 mb-4">
                      <p className="text-sm text-gray-400 mb-2">Récapitulatif :</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Abonnement {recommendation.planName}</span>
                          <span className="text-white">{recommendation.basePrice}€</span>
                        </div>
                        {selectedAddons.map(addonId => {
                          const addon = addons.find(a => a.id === addonId);
                          return (
                            <div key={addonId} className="flex justify-between">
                              <span className="text-gray-300">{addon.name}</span>
                              <span className="text-white">+{addon.price}€</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/register')}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                    >
                      Démarrer l'essai gratuit
                    </button>
                    <p className="text-center text-gray-500 text-xs mt-3">14 jours gratuits • Sans CB • Sans engagement</p>
                  </div>
                </div>
              </div>

              {/* Modules additionnels */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Modules additionnels
                  <span className="text-sm font-normal text-gray-400 ml-2">(optionnel)</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {addons.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {addon.popular && (
                          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                            Populaire
                          </span>
                        )}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gray-700'
                        }`}>
                          <addon.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{addon.name}</span>
                            <span className="text-red-400 font-bold">+{addon.price}€/mois</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{addon.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-red-500 bg-red-500' : 'border-gray-600'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bouton modifier */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowPricing(false);
                    setCurrentStep(0);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Modifier mes réponses
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
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
            <p className="text-gray-400 mt-4 text-sm">14 jours gratuits • Sans carte bancaire • Sans engagement</p>
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
                <li><a href="#features" className="hover:text-red-400 transition-colors">Fonctionnalités</a></li>
                <li><a href="#questionnaire" className="hover:text-red-400 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Application mobile</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Ressources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Blog</a></li>
                <li><a href="#faq" className="hover:text-red-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Support</a></li>
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
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Paris, France
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Easy Sécurité. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-red-400 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-red-400 transition-colors">CGV</a>
              <a href="#" className="hover:text-red-400 transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
