// src/pages/ObservationsPage.jsx
import React from 'react';
import { Camera } from 'lucide-react';

const ObservationsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
      <Camera className="w-7 h-7 text-cyan-500" />
      Observations
    </h1>
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">Module en cours de développement</p>
      <p className="text-gray-400 mt-2">Photos et observations terrain avec génération de devis</p>
    </div>
  </div>
);

export default ObservationsPage;
