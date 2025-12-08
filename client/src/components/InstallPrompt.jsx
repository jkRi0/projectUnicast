import { usePWAInstall } from '../hooks/usePWAInstall.js';

const InstallPrompt = () => {
  const { isInstallable, promptInstall, isInstalled } = usePWAInstall();

  const handleClick = async () => {
    await promptInstall();
  };

  if (isInstalled) {
    return (
      <button
        type="button"
        className="btn btn--outline"
        disabled
        style={{ opacity: 0.65, cursor: 'not-allowed' }}
        title="App already installed"
      >
        App Installed
      </button>
    );
  }

  if (!isInstallable) {
    return (
      <button
        type="button"
        className="btn btn--outline"
        disabled
        style={{ opacity: 0.65, cursor: 'not-allowed' }}
        title="If you just uninstalled the app, try: 1) Clear browser cache 2) Unregister service workers in DevTools 3) Wait a few minutes 4) Hard refresh (Ctrl+Shift+R)"
      >
        Install App (Not Available)
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn--outline"
      onClick={handleClick}
      title="Install UniEvent as an app"
    >
      Install App
    </button>
  );
};

export default InstallPrompt;
