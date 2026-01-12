// src/components/demo/LockedFeatureModal.jsx
// Easy Sécurité - Modal pour fonctionnalités verrouillées en démo

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../../contexts/DemoContext';
import { Lock, X, Zap, FileText, CheckCircle2 } from 'lucide-react';

const LockedFeatureModal = ({ isOpen, onClose, featureType = 'default' }) => {
  const navigate = useNavigate();
  const { formatTimeRemaining, demoRequest } = useDemo();

  if (!isOpen) return null;

  const messages = {
    create_report: { title: 'Créer un rapport', desc: 'Créez des rapports SSI, BAES, Extincteurs...' },
    edit_report: { title: 'Modifier un rapport', desc: 'Modifiez vos rapports existants' },
    generate_pdf: { title: 'Générer un PDF', desc: 'Exportez vos rapports en PDF professionnel' },
    export_data: { title: 'Exporter les données', desc: 'Exportez vers Excel ou votre comptable' },
    add_client: { title: 'Ajouter un client', desc: 'Gérez votre portefeuille client' },
    add_site: { title: 'Ajouter un site', desc: 'Ajoutez les sites de vos clients' },
    settings: { title: 'Paramètres', desc: 'Configurez votre entreprise' },
    default: { title: 'Fonctionnalité Premium', desc: 'Accédez à toutes les fonctionnalités' }
  };

  const feature = messages[featureType] || messages.default;

  const handleSubscribe = () => {
    onClose();
    navigate('/subscribe', { state: { fromDemo: true, request: demoRequest } });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{feature.title}</h2>
          <p className="text-white/80 mt-1">{feature.desc}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Cette fonctionnalité est disponible avec un abonnement. Souscrivez maintenant et profitez de <strong className="text-red-500">-10% sur le premier mois</strong> !
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Avec l'abonnement vous aurez :</p>
            <div className="space-y-2">
              {['Création illimitée de rapports', 'Génération PDF automatique', 'Signature électronique', 'Envoi client en 1 clic', 'Application mobile'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Souscrire maintenant
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
            >
              Continuer la démo ({formatTimeRemaining()} restant)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockedFeatureModal;
