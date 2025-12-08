import { useEffect, useState, useCallback } from 'react';

// Store install prompt globally so it persists across navigation
let globalInstallPrompt = null;
let listenersAttached = false;

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(globalInstallPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if currently installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      globalInstallPrompt = null;
      setInstallPrompt(null);
      return;
    }

    // Clear any stored install state on mount (in case app was uninstalled)
    const storedInstallState = localStorage.getItem('pwa-installed');
    if (storedInstallState === 'true' && !isStandalone) {
      localStorage.removeItem('pwa-installed');
    }

    // If we already have a stored prompt, use it immediately
    if (globalInstallPrompt) {
      setInstallPrompt(globalInstallPrompt);
    }

    // Set up event listeners only once (singleton pattern)
    if (!listenersAttached) {
      const handleBeforeInstall = (event) => {
        event.preventDefault();
        // Store globally so it persists across navigation
        globalInstallPrompt = event;
        setInstallPrompt(event);
        localStorage.removeItem('pwa-installed');
        setIsInstalled(false);
      };

      const handleInstalled = () => {
        setIsInstalled(true);
        globalInstallPrompt = null;
        setInstallPrompt(null);
        localStorage.setItem('pwa-installed', 'true');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', handleInstalled);
      listenersAttached = true;
    }

    // Sync state with global prompt on mount/update
    if (globalInstallPrompt && !installPrompt) {
      setInstallPrompt(globalInstallPrompt);
    }
  }, [installPrompt]);

  const promptInstall = useCallback(async () => {
    const prompt = installPrompt || globalInstallPrompt;
    if (!prompt) {
      return false;
    }
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      globalInstallPrompt = null;
      setInstallPrompt(null);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      globalInstallPrompt = null;
      setInstallPrompt(null);
      return false;
    }
  }, [installPrompt]);

  return {
    isInstallable: Boolean(installPrompt || globalInstallPrompt),
    promptInstall,
    isInstalled,
  };
};
