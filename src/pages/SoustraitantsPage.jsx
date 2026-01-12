// src/pages/SoustraitantsPage.jsx
import React from 'react';
import { Briefcase } from 'lucide-react';

const SoustraitantsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
      <Briefcase className="w-7 h-7 text-purple-500" />
      Sous-traitants
    </h1>
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">Module en cours de développement</p>
      <p className="text-gray-400 mt-2">Gérez vos partenaires sous-traitants</p>
    </div>
  </div>
);

export default SoustraitantsPage;
