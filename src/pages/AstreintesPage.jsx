// src/pages/AstreintesPage.jsx
import React from 'react';
import { Phone } from 'lucide-react';

const AstreintesPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
      <Phone className="w-7 h-7 text-orange-500" />
      Planning des astreintes
    </h1>
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">Module en cours de développement</p>
      <p className="text-gray-400 mt-2">Planifiez les astreintes de vos techniciens</p>
    </div>
  </div>
);

export default AstreintesPage;
