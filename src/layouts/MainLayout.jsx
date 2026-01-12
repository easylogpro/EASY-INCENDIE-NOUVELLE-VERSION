// src/layouts/MainLayout.jsx
// Easy Sécurité - Layout principal avec sidebar

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import { 
  LayoutDashboard, Building2, Users, MapPin, Calendar, 
  FileText, ClipboardList, Receipt, AlertTriangle, Settings,
  LogOut, ChevronLeft, ChevronRight, Flame, Shield,
  Gauge, Zap, Menu, X, Wrench, UserCog
} from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, orgSettings, subscription, logout } = useAuth();
  const { isDemoMode } = useDemo();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeDomains = subscription?.domaines_actifs || orgSettings?.modules_actifs || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Menu principal
  const mainMenu = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/clients', label: 'Clients', icon: Building2 },
    { path: '/sites', label: 'Sites', icon: MapPin },
    { path: '/planning', label: 'Planning', icon: Calendar },
    { path: '/interventions', label: 'Interventions', icon: Wrench },
  ];

  // Menu rapports (selon domaines actifs)
  const rapportsMenu = [
    { path: '/rapports-ssi', label: 'SSI', icon: Shield, domain: 'ssi' },
    { path: '/rapports-dsf', label: 'Désenfumage', icon: Gauge, domain: 'dsf' },
    { path: '/rapports-baes', label: 'BAES', icon: Zap, domain: 'baes' },
    { path: '/rapports-extincteurs', label: 'Extincteurs', icon: Flame, domain: 'extincteurs' },
    { path: '/rapports-ria', label: 'RIA', icon: Shield, domain: 'ria' },
    { path: '/rapports-colonnes-seches', label: 'Colonnes sèches', icon: Settings, domain: 'colonnes_seches' },
  ].filter(item => activeDomains.includes(item.domain));

  // Menu commercial
  const commercialMenu = [
    { path: '/devis', label: 'Devis', icon: FileText },
    { path: '/factures', label: 'Factures', icon: Receipt },
  ];

  // Menu gestion
  const gestionMenu = [
    { path: '/techniciens', label: 'Techniciens', icon: UserCog },
    { path: '/alertes', label: 'Alertes', icon: AlertTriangle },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ];

  const MenuItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25' 
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="font-medium">{item.label}</span>}
      </Link>
    );
  };

  const MenuSection = ({ title, items }) => (
    <div className="mb-6">
      {!collapsed && (
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-3">{title}</p>
      )}
      <div className="space-y-1">
        {items.map(item => <MenuItem key={item.path} item={item} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Overlay mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-20' : 'w-64'} 
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gray-900 transition-all duration-300 flex flex-col
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-white font-bold">Easy</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-bold">Sécurité</span>
              </div>
            )}
          </div>
        </div>

        {/* Organisation */}
        {!collapsed && orgSettings && (
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-gray-500 text-xs">Organisation</p>
            <p className="text-white font-medium truncate">{orgSettings.nom}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <MenuSection title="Principal" items={mainMenu} />
          
          {rapportsMenu.length > 0 && (
            <MenuSection title="Rapports" items={rapportsMenu} />
          )}
          
          <MenuSection title="Commercial" items={commercialMenu} />
          <MenuSection title="Gestion" items={gestionMenu} />
        </nav>

        {/* User & Toggle */}
        <div className="p-4 border-t border-gray-800">
          {!collapsed && userData && (
            <div className="mb-3">
              <p className="text-white font-medium">{userData.prenom} {userData.nom}</p>
              <p className="text-gray-500 text-sm truncate">{userData.email}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Déconnexion</span>}
            </button>
            
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden lg:block"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-500" />
            <span className="font-bold">Easy Sécurité</span>
          </div>
          
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
