// src/pages/MiseEnServicePage.jsx
import React from 'react';
import { PlayCircle } from 'lucide-react';

const MiseEnServicePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
      <PlayCircle className="w-7 h-7 text-green-500" />
      Mises en service SSI
    </h1>
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">Module en cours de développement</p>
      <p className="text-gray-400 mt-2">Suivi des mises en service SSI (commande → réception)</p>
    </div>
  </div>
);

export default MiseEnServicePage;
