// src/components/UpdateBanner.jsx
import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useVersionCheck } from '../hooks/useVersionCheck';

const UpdateBanner = () => {
  const { newVersionAvailable, refreshApp } = useVersionCheck();
  const [dismissed, setDismissed] = React.useState(false);

  if (!newVersionAvailable || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Nouvelle version disponible !</p>
            <p className="text-sm text-blue-100">Actualisez pour bénéficier des dernières améliorations.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshApp}
            className="px-4 py-2 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Ignorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBanner;
