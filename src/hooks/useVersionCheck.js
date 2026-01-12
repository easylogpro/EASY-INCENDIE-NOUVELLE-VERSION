// src/hooks/useVersionCheck.js
import { useState, useEffect, useCallback } from 'react';

const CHECK_INTERVAL = 5 * 60 * 1000; // Vérifier toutes les 5 minutes

export const useVersionCheck = () => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);

  const checkVersion = useCallback(async () => {
    try {
      // Ajouter timestamp pour éviter le cache
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (!currentVersion) {
        // Premier chargement, on stocke la version
        setCurrentVersion(data.version);
        localStorage.setItem('app_version', data.version);
      } else if (data.version !== currentVersion) {
        // Nouvelle version détectée !
        setNewVersionAvailable(true);
      }
    } catch (error) {
      // Silencieux si erreur (offline, etc.)
      console.log('Version check skipped');
    }
  }, [currentVersion]);

  useEffect(() => {
    // Charger la version stockée au démarrage
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion) {
      setCurrentVersion(storedVersion);
    }
    
    // Vérifier immédiatement
    checkVersion();
    
    // Puis vérifier périodiquement
    const interval = setInterval(checkVersion, CHECK_INTERVAL);
    
    // Vérifier aussi quand l'onglet redevient visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVersion]);

  const refreshApp = useCallback(() => {
    // Vider le cache du service worker si présent
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    // Vider le cache et recharger
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Force reload complet
    window.location.reload(true);
  }, []);

  return { newVersionAvailable, refreshApp, currentVersion };
};

export default useVersionCheck;
