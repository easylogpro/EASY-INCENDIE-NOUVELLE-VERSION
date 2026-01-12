// ============================================================
// EASY INCENDIE - DASHBOARD PRINCIPAL
// ============================================================
// Version: 1.0 - 12/01/2026
// Design: Professionnel, clair, informatif
// Couleurs: Bleu professionnel (pas de rouge)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  MapPin,
  Users,
  Car,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  Calendar,
  ChevronRight,
  RefreshCw,
  Flame,
  Wind,
  DoorOpen,
  Lightbulb,
  FireExtinguisher,
  Droplets,
  CircleDot,
  Phone,
  Euro,
  FileCheck,
  FileClock,
  AlertCircle,
  CheckCircle2,
  Timer,
  Wrench,
  ClipboardList,
  CalendarDays,
  BadgeAlert,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

// ============================================================
// CONFIGURATION DES MODULES (7 domaines)
// ============================================================
const MODULES_CONFIG = {
  SSI: { 
    nom: 'SSI', 
    fullName: 'Système Sécurité Incendie',
    icon: Flame, 
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  DSF: { 
    nom: 'DSF', 
    fullName: 'Désenfumage',
    icon: Wind, 
    color: 'bg-sky-500',
    lightBg: 'bg-sky-50',
    textColor: 'text-sky-700'
  },
  CMP: { 
    nom: 'CMP', 
    fullName: 'Compartimentage',
    icon: DoorOpen, 
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-700'
  },
  BAES: { 
    nom: 'BAES', 
    fullName: 'Éclairage de sécurité',
    icon: Lightbulb, 
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  EXT: { 
    nom: 'EXT', 
    fullName: 'Extincteurs',
    icon: FireExtinguisher, 
    color: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    textColor: 'text-rose-700'
  },
  RIA: { 
    nom: 'RIA', 
    fullName: 'Robinets Incendie',
    icon: Droplets, 
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  COLSEC: { 
    nom: 'COLSEC', 
    fullName: 'Colonnes Sèches',
    icon: CircleDot, 
    color: 'bg-violet-500',
    lightBg: 'bg-violet-50',
    textColor: 'text-violet-700'
  }
};

// ============================================================
// CONFIGURATION DES PRIORITÉS SAV
// ============================================================
const PRIORITES_SAV = {
  p1: { 
    label: 'P1 - Urgence', 
    delai: '4h', 
    color: 'bg-red-500', 
    textColor: 'text-red-700',
    lightBg: 'bg-red-50',
    borderColor: 'border-red-300'
  },
  p2: { 
    label: 'P2 - Urgent', 
    delai: '24h', 
    color: 'bg-orange-500', 
    textColor: 'text-orange-700',
    lightBg: 'bg-orange-50',
    borderColor: 'border-orange-300'
  },
  p3: { 
    label: 'P3 - Normal', 
    delai: '72h', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-700',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-300'
  }
};

// ============================================================
// COMPOSANT: Carte de statistique
// ============================================================
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'bg-blue-500',
  lightBg = 'bg-blue-50',
  onClick,
  loading = false,
  alert = false
}) => (
  <div 
    onClick={onClick}
    className={`
      bg-white rounded-xl border border-gray-100 p-5 
      hover:shadow-lg hover:border-gray-200 transition-all duration-200
      ${onClick ? 'cursor-pointer' : ''}
      ${alert ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}
    `}
  >
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${lightBg}`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {alert && (
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </span>
      )}
    </div>
    <div className="mt-4">
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
      <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  </div>
);

// ============================================================
// COMPOSANT: Ligne de module maintenance
// ============================================================
const ModuleRow = ({ module, stats, onClick }) => {
  const config = MODULES_CONFIG[module] || MODULES_CONFIG.SSI;
  const Icon = config.icon;
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center py-3 px-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
    >
      <div className={`p-2 rounded-lg ${config.lightBg} mr-4`}>
        <Icon className={`w-5 h-5 ${config.textColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{config.nom}</p>
        <p className="text-xs text-gray-500 truncate">{config.fullName}</p>
      </div>
      
      <div className="flex items-center gap-3 text-sm">
        <div className="text-center px-3">
          <p className="font-semibold text-gray-900">{stats?.contrats || 0}</p>
          <p className="text-xs text-gray-400">Contrats</p>
        </div>
        <div className="text-center px-3">
          <p className="font-semibold text-emerald-600">{stats?.realise || 0}</p>
          <p className="text-xs text-gray-400">Réalisé</p>
        </div>
        <div className="text-center px-3">
          <p className="font-semibold text-blue-600">{stats?.planifie || 0}</p>
          <p className="text-xs text-gray-400">Planifié</p>
        </div>
        <div className="text-center px-3">
          <p className={`font-semibold ${stats?.retard > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
            {stats?.retard || 0}
          </p>
          <p className="text-xs text-gray-400">Retard</p>
        </div>
      </div>
      
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 ml-2" />
    </div>
  );
};

// ============================================================
// COMPOSANT: Carte SAV
// ============================================================
const SavCard = ({ sav, onClick }) => {
  const priorite = PRIORITES_SAV[sav.priorite] || PRIORITES_SAV.p3;
  
  // Calcul du temps restant (basé sur date_demande + délai)
  const getTempsRestant = () => {
    if (!sav.date_demande) return null;
    
    const delaiHeures = sav.priorite === 'p1' ? 4 : sav.priorite === 'p2' ? 24 : 72;
    const dateLimite = new Date(sav.date_demande);
    dateLimite.setHours(dateLimite.getHours() + delaiHeures);
    
    const maintenant = new Date();
    const diffMs = dateLimite - maintenant;
    const diffHeures = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) {
      return { depasse: true, texte: 'Dépassé' };
    }
    
    if (diffHeures < 1) {
      return { critique: true, texte: `${diffMinutes}min` };
    }
    
    return { texte: `${diffHeures}h${diffMinutes > 0 ? diffMinutes : ''}` };
  };
  
  const tempsRestant = getTempsRestant();
  
  return (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-xl border-l-4 ${priorite.borderColor} ${priorite.lightBg}
        hover:shadow-md transition-all cursor-pointer
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${priorite.color} text-white`}>
              {sav.priorite?.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">{sav.numero || 'SAV'}</span>
          </div>
          <p className="font-medium text-gray-900 line-clamp-1">
            {sav.sites?.nom || 'Site non défini'}
          </p>
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
            {sav.symptome_declare || 'Aucune description'}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {sav.demandeur_nom && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {sav.demandeur_nom}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(sav.date_demande).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
        
        {tempsRestant && (
          <div className={`
            text-center px-3 py-2 rounded-lg ml-3
            ${tempsRestant.depasse ? 'bg-red-100 text-red-700' : 
              tempsRestant.critique ? 'bg-orange-100 text-orange-700' : 
              'bg-white text-gray-700'}
          `}>
            <Timer className="w-4 h-4 mx-auto mb-1" />
            <p className="font-bold text-sm">{tempsRestant.texte}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT: Carte Intervention Planning
// ============================================================
const InterventionCard = ({ intervention }) => {
  const getTypeLabel = (type) => {
    switch(type) {
      case 'maintenance': return { label: 'Maintenance', color: 'bg-blue-100 text-blue-700' };
      case 'sav': return { label: 'SAV', color: 'bg-orange-100 text-orange-700' };
      case 'travaux': return { label: 'Travaux', color: 'bg-emerald-100 text-emerald-700' };
      default: return { label: 'Intervention', color: 'bg-gray-100 text-gray-700' };
    }
  };
  
  const typeInfo = getTypeLabel(intervention.type);
  
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="text-center min-w-[60px]">
        <p className="text-lg font-bold text-gray-900">
          {intervention.heure || '09:00'}
        </p>
      </div>
      
      <div className="w-px h-10 bg-gray-300"></div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          {intervention.domaine && (
            <span className="text-xs text-gray-500">
              {MODULES_CONFIG[intervention.domaine]?.nom || intervention.domaine}
            </span>
          )}
        </div>
        <p className="font-medium text-gray-900 text-sm">{intervention.site}</p>
        <p className="text-xs text-gray-500">{intervention.technicien}</p>
      </div>
    </div>
  );
};

// ============================================================
// COMPOSANT: Alerte Dashboard
// ============================================================
const AlerteItem = ({ alerte, onClick }) => {
  const getAlertStyle = (priorite) => {
    switch(priorite) {
      case 'haute': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' };
      case 'moyenne': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' };
      default: return { icon: BadgeAlert, color: 'text-blue-500', bg: 'bg-blue-50' };
    }
  };
  
  const style = getAlertStyle(alerte.priorite);
  const Icon = style.icon;
  
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg ${style.bg} hover:opacity-80 cursor-pointer transition-opacity`}
    >
      <Icon className={`w-5 h-5 ${style.color} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{alerte.titre}</p>
        <p className="text-xs text-gray-500 truncate">{alerte.message}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  );
};

// ============================================================
// COMPOSANT PRINCIPAL: Dashboard
// ============================================================
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, organisation } = useAuth();
  
  // États
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    clients: 0,
    sites: 0,
    techniciens: 0,
    vehicules: 0,
    contrats: 0,
    alertes: 0
  });
  const [modulesStats, setModulesStats] = useState({});
  const [savEnCours, setSavEnCours] = useState([]);
  const [planningJour, setPlanningJour] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [commercial, setCommercial] = useState({
    devisEnAttente: 0,
    devisMontant: 0,
    facturesImpayees: 0,
    impayesMontant: 0,
    caMois: 0
  });
  const [userData, setUserData] = useState(null);

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  const loadDashboardData = async () => {
    if (!organisation?.id) return;
    
    try {
      setRefreshing(true);
      const orgId = organisation.id;

      // 1. Charger les statistiques globales en parallèle
      const [
        clientsRes,
        sitesRes,
        techniciensRes,
        vehiculesRes,
        contratsRes,
        alertesRes,
        userRes
      ] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('actif', true),
        supabase.from('sites').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('actif', true),
        supabase.from('techniciens').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('actif', true),
        supabase.from('vehicules').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId),
        supabase.from('contrats').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('statut', 'actif'),
        supabase.from('alertes').select('id', { count: 'exact', head: true }).eq('organisation_id', orgId).eq('statut', 'nouvelle'),
        supabase.from('utilisateurs').select('nom, prenom, role').eq('auth_id', user?.id).single()
      ]);

      setStats({
        clients: clientsRes.count || 0,
        sites: sitesRes.count || 0,
        techniciens: techniciensRes.count || 0,
        vehicules: vehiculesRes.count || 0,
        contrats: contratsRes.count || 0,
        alertes: alertesRes.count || 0
      });

      if (userRes.data) {
        setUserData(userRes.data);
      }

      // 2. Charger les stats par module (maintenances)
      const modulesData = {};
      for (const module of Object.keys(MODULES_CONFIG)) {
        const tableName = `maintenances_${module.toLowerCase()}`;
        
        // Essayer de charger depuis la table spécifique
        try {
          const { data: maintenances } = await supabase
            .from(tableName)
            .select('statut, planif_visite')
            .eq('organisation_id', orgId);
          
          if (maintenances) {
            const today = new Date().toISOString().split('T')[0];
            modulesData[module] = {
              contrats: maintenances.length,
              realise: maintenances.filter(m => m.statut === 'termine').length,
              planifie: maintenances.filter(m => m.statut === 'planifie').length,
              retard: maintenances.filter(m => m.statut === 'planifie' && m.planif_visite && m.planif_visite < today).length
            };
          }
        } catch (e) {
          // Table n'existe peut-être pas encore
          modulesData[module] = { contrats: 0, realise: 0, planifie: 0, retard: 0 };
        }
      }
      
      // Alternative: charger depuis les contrats par domaine
      const { data: contratsByDomaine } = await supabase
        .from('contrats')
        .select('domaine, statut, prochaine_visite')
        .eq('organisation_id', orgId)
        .eq('statut', 'actif');
      
      if (contratsByDomaine) {
        const today = new Date().toISOString().split('T')[0];
        for (const contrat of contratsByDomaine) {
          const module = contrat.domaine?.toUpperCase();
          if (module && MODULES_CONFIG[module]) {
            if (!modulesData[module]) {
              modulesData[module] = { contrats: 0, realise: 0, planifie: 0, retard: 0 };
            }
            modulesData[module].contrats++;
            if (contrat.prochaine_visite && contrat.prochaine_visite < today) {
              modulesData[module].retard++;
            }
          }
        }
      }
      
      setModulesStats(modulesData);

      // 3. Charger les SAV en cours
      const { data: savData } = await supabase
        .from('sav')
        .select(`
          id, numero, priorite, symptome_declare, demandeur_nom, demandeur_tel,
          date_demande, date_prevue, statut, domaine,
          sites (nom, adresse)
        `)
        .eq('organisation_id', orgId)
        .not('statut', 'in', '("termine","annule")')
        .order('priorite', { ascending: true })
        .order('date_demande', { ascending: true })
        .limit(5);
      
      setSavEnCours(savData || []);

      // 4. Charger le planning du jour
      const today = new Date().toISOString().split('T')[0];
      const interventions = [];
      
      // SAV prévus aujourd'hui
      const { data: savJour } = await supabase
        .from('sav')
        .select('id, numero, domaine, date_prevue, sites(nom), techniciens(nom, prenom)')
        .eq('organisation_id', orgId)
        .eq('date_prevue', today)
        .limit(3);
      
      if (savJour) {
        savJour.forEach(s => {
          interventions.push({
            type: 'sav',
            heure: '09:00',
            site: s.sites?.nom || 'Non défini',
            technicien: s.techniciens ? `${s.techniciens.prenom} ${s.techniciens.nom}` : 'Non assigné',
            domaine: s.domaine
          });
        });
      }
      
      // Travaux prévus aujourd'hui
      const { data: travauxJour } = await supabase
        .from('travaux')
        .select('id, objet, domaine, date_prevue, sites(nom), techniciens(nom, prenom)')
        .eq('organisation_id', orgId)
        .eq('date_prevue', today)
        .limit(3);
      
      if (travauxJour) {
        travauxJour.forEach(t => {
          interventions.push({
            type: 'travaux',
            heure: '14:00',
            site: t.sites?.nom || 'Non défini',
            technicien: t.techniciens ? `${t.techniciens.prenom} ${t.techniciens.nom}` : 'Non assigné',
            domaine: t.domaine
          });
        });
      }
      
      setPlanningJour(interventions);

      // 5. Charger les alertes récentes
      const { data: alertesData } = await supabase
        .from('alertes')
        .select('id, titre, message, priorite, type_alerte, date_alerte')
        .eq('organisation_id', orgId)
        .eq('statut', 'nouvelle')
        .order('date_alerte', { ascending: false })
        .limit(5);
      
      setAlertes(alertesData || []);
      
      // 6. Générer des alertes automatiques
      const alertesAuto = [];
      
      // Visites en retard
      const { count: visitesRetard } = await supabase
        .from('contrats')
        .select('id', { count: 'exact', head: true })
        .eq('organisation_id', orgId)
        .eq('statut', 'actif')
        .lt('prochaine_visite', today);
      
      if (visitesRetard > 0) {
        alertesAuto.push({
          id: 'auto-visites',
          titre: `${visitesRetard} visite(s) en retard`,
          message: 'Contrats avec visites dépassées',
          priorite: 'haute'
        });
      }
      
      // CT véhicules à venir (15 jours)
      const dateLimite = new Date();
      dateLimite.setDate(dateLimite.getDate() + 15);
      
      const { count: ctProche } = await supabase
        .from('vehicules')
        .select('id', { count: 'exact', head: true })
        .eq('organisation_id', orgId)
        .lt('date_prochain_ct', dateLimite.toISOString().split('T')[0]);
      
      if (ctProche > 0) {
        alertesAuto.push({
          id: 'auto-ct',
          titre: `${ctProche} CT véhicule(s) à prévoir`,
          message: 'Contrôles techniques dans les 15 jours',
          priorite: 'moyenne'
        });
      }
      
      // Contrats expirant bientôt (30 jours)
      const dateContrat = new Date();
      dateContrat.setDate(dateContrat.getDate() + 30);
      
      const { count: contratsExpire } = await supabase
        .from('contrats')
        .select('id', { count: 'exact', head: true })
        .eq('organisation_id', orgId)
        .eq('statut', 'actif')
        .lt('date_fin', dateContrat.toISOString().split('T')[0]);
      
      if (contratsExpire > 0) {
        alertesAuto.push({
          id: 'auto-contrats',
          titre: `${contratsExpire} contrat(s) à renouveler`,
          message: 'Expirent dans les 30 jours',
          priorite: 'moyenne'
        });
      }
      
      setAlertes(prev => [...alertesAuto, ...(prev || [])]);

      // 7. Charger les données commerciales
      const debutMois = new Date();
      debutMois.setDate(1);
      debutMois.setHours(0, 0, 0, 0);
      
      const { data: devisData } = await supabase
        .from('devis')
        .select('montant_ttc')
        .eq('organisation_id', orgId)
        .eq('statut', 'envoye');
      
      const { data: facturesData } = await supabase
        .from('factures')
        .select('montant_ttc, statut, date_emission')
        .eq('organisation_id', orgId);
      
      const facturesImpayees = facturesData?.filter(f => f.statut === 'impayee') || [];
      const facturesMois = facturesData?.filter(f => 
        f.statut === 'payee' && 
        new Date(f.date_emission) >= debutMois
      ) || [];
      
      setCommercial({
        devisEnAttente: devisData?.length || 0,
        devisMontant: devisData?.reduce((sum, d) => sum + (d.montant_ttc || 0), 0) || 0,
        facturesImpayees: facturesImpayees.length,
        impayesMontant: facturesImpayees.reduce((sum, f) => sum + (f.montant_ttc || 0), 0),
        caMois: facturesMois.reduce((sum, f) => sum + (f.montant_ttc || 0), 0)
      });

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadDashboardData();
  }, [organisation?.id]);

  // ============================================================
  // CALCULS DÉRIVÉS
  // ============================================================
  const totalRetards = useMemo(() => {
    return Object.values(modulesStats).reduce((sum, m) => sum + (m.retard || 0), 0);
  }, [modulesStats]);

  const savUrgents = useMemo(() => {
    return savEnCours.filter(s => s.priorite === 'p1' || s.priorite === 'p2').length;
  }, [savEnCours]);

  // ============================================================
  // RENDU
  // ============================================================
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {greeting}, {userData?.prenom || 'Admin'} 👋
              </h1>
              <p className="text-slate-300 mt-1">
                {organisation?.nom || 'Easy Sécurité'} • 
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            
            <button 
              onClick={loadDashboardData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
          
          {/* Résumé rapide */}
          {(totalRetards > 0 || savUrgents > 0) && (
            <div className="mt-6 flex items-center gap-4 text-sm">
              {totalRetards > 0 && (
                <span className="flex items-center gap-2 bg-orange-500/20 text-orange-200 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" />
                  {totalRetards} visite(s) en retard
                </span>
              )}
              {savUrgents > 0 && (
                <span className="flex items-center gap-2 bg-red-500/20 text-red-200 px-3 py-1.5 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  {savUrgents} SAV urgent(s)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ============================================================ */}
        {/* STATISTIQUES GLOBALES */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Clients"
            value={stats.clients}
            icon={Building2}
            color="bg-blue-500"
            lightBg="bg-blue-50"
            onClick={() => navigate('/clients')}
          />
          <StatCard
            title="Sites"
            value={stats.sites}
            icon={MapPin}
            color="bg-emerald-500"
            lightBg="bg-emerald-50"
            onClick={() => navigate('/sites')}
          />
          <StatCard
            title="Techniciens"
            value={stats.techniciens}
            icon={Users}
            color="bg-violet-500"
            lightBg="bg-violet-50"
            onClick={() => navigate('/techniciens')}
          />
          <StatCard
            title="Véhicules"
            value={stats.vehicules}
            icon={Car}
            color="bg-amber-500"
            lightBg="bg-amber-50"
            onClick={() => navigate('/vehicules')}
          />
          <StatCard
            title="Contrats"
            value={stats.contrats}
            subtitle="actifs"
            icon={FileText}
            color="bg-cyan-500"
            lightBg="bg-cyan-50"
            onClick={() => navigate('/contrats')}
          />
          <StatCard
            title="Alertes"
            value={stats.alertes + alertes.length}
            icon={AlertTriangle}
            color="bg-orange-500"
            lightBg="bg-orange-50"
            onClick={() => navigate('/alertes')}
            alert={stats.alertes > 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============================================================ */}
          {/* COLONNE GAUCHE - ACTIVITÉ TERRAIN */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-8">
            {/* Maintenances par module */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Activité Terrain</h2>
                    <p className="text-sm text-gray-500">Maintenances par module</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/maintenances')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Tout voir <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-50">
                {Object.keys(MODULES_CONFIG).map(module => (
                  <ModuleRow
                    key={module}
                    module={module}
                    stats={modulesStats[module]}
                    onClick={() => navigate(`/maintenances?module=${module}`)}
                  />
                ))}
              </div>
              
              {/* Résumé total */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total tous modules</span>
                  <div className="flex items-center gap-6">
                    <span className="font-medium text-gray-900">
                      {Object.values(modulesStats).reduce((s, m) => s + (m.contrats || 0), 0)} contrats
                    </span>
                    <span className="font-medium text-emerald-600">
                      {Object.values(modulesStats).reduce((s, m) => s + (m.realise || 0), 0)} réalisés
                    </span>
                    {totalRetards > 0 && (
                      <span className="font-medium text-orange-600">
                        {totalRetards} en retard
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SAV En Cours */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Wrench className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">SAV en cours</h2>
                    <p className="text-sm text-gray-500">
                      {savEnCours.length} demande(s) • {savUrgents} urgente(s)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/sav')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Tout voir <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-3">
                {savEnCours.length > 0 ? (
                  savEnCours.map(sav => (
                    <SavCard 
                      key={sav.id} 
                      sav={sav}
                      onClick={() => navigate(`/sav/${sav.id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="font-medium">Aucun SAV en cours</p>
                    <p className="text-sm">Toutes les demandes ont été traitées</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section Commerciale */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Euro className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Commercial</h2>
                    <p className="text-sm text-gray-500">Devis, factures & CA</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                {/* Devis en attente */}
                <div 
                  className="p-5 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/devis?statut=envoye')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileClock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-500">Devis en attente</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{commercial.devisEnAttente}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {commercial.devisMontant.toLocaleString('fr-FR')} € TTC
                  </p>
                </div>
                
                {/* Factures impayées */}
                <div 
                  className={`p-5 cursor-pointer transition-colors ${commercial.facturesImpayees > 0 ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                  onClick={() => navigate('/factures?statut=impayee')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`w-4 h-4 ${commercial.facturesImpayees > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-500">Impayées</span>
                  </div>
                  <p className={`text-2xl font-bold ${commercial.facturesImpayees > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {commercial.facturesImpayees}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {commercial.impayesMontant.toLocaleString('fr-FR')} € TTC
                  </p>
                </div>
                
                {/* CA du mois */}
                <div 
                  className="p-5 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/factures')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-500">CA ce mois</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {commercial.caMois.toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-sm text-gray-500 mt-1">TTC encaissé</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLONNE DROITE - PLANNING & ALERTES */}
          {/* ============================================================ */}
          <div className="space-y-8">
            {/* Planning du jour */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <CalendarDays className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Aujourd'hui</h2>
                    <p className="text-sm text-gray-500">{planningJour.length} intervention(s)</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/planning')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Planning <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {planningJour.length > 0 ? (
                  planningJour.map((intervention, idx) => (
                    <InterventionCard key={idx} intervention={intervention} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium">Aucune intervention</p>
                    <p className="text-sm">Pas d'intervention prévue aujourd'hui</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alertes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Alertes</h2>
                    <p className="text-sm text-gray-500">{alertes.length} à traiter</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/alertes')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Tout voir <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {alertes.length > 0 ? (
                  alertes.slice(0, 5).map(alerte => (
                    <AlerteItem 
                      key={alerte.id} 
                      alerte={alerte}
                      onClick={() => navigate('/alertes')}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                    <p className="font-medium">Tout est en ordre</p>
                    <p className="text-sm">Aucune alerte à traiter</p>
                  </div>
                )}
              </div>
            </div>

            {/* Accès rapides */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">Accès rapides</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/sav/nouveau')}
                  className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  <Wrench className="w-4 h-4" />
                  Nouveau SAV
                </button>
                <button 
                  onClick={() => navigate('/devis/nouveau')}
                  className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Nouveau devis
                </button>
                <button 
                  onClick={() => navigate('/clients/nouveau')}
                  className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  <Building2 className="w-4 h-4" />
                  Nouveau client
                </button>
                <button 
                  onClick={() => navigate('/sites/nouveau')}
                  className="flex items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  Nouveau site
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
