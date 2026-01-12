// src/components/AnnouncementBanner.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X, ExternalLink } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'announcement'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (data.active) {
            setAnnouncement(data);
            setDismissed(false); // Réafficher si nouvelle annonce
          } else {
            setAnnouncement(null);
          }
        }
      },
      (error) => {
        console.log('Announcement listener error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  if (!announcement || dismissed) return null;

  const styles = {
    incident: {
      bg: 'bg-gradient-to-r from-red-600 to-rose-600',
      icon: XCircle,
      iconBg: 'bg-white/20'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: AlertTriangle,
      iconBg: 'bg-white/20'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      icon: Info,
      iconBg: 'bg-white/20'
    },
    success: {
      bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
      icon: CheckCircle,
      iconBg: 'bg-white/20'
    }
  };

  const style = styles[announcement.type] || styles.info;
  const Icon = style.icon;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[99] ${style.bg} text-white px-4 py-3 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{announcement.message}</p>
            {announcement.details && (
              <p className="text-sm opacity-90">{announcement.details}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {announcement.link && (
            <a
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              En savoir plus <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {announcement.dismissable !== false && (
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
