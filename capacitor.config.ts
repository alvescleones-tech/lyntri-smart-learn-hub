import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1f13dccd23744f819f5f44cfdf6f5fb5',
  appName: 'lyntri-smart-learn-hub',
  webDir: 'dist',
  server: {
    url: 'https://1f13dccd-2374-4f81-9f5f-44cfdf6f5fb5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1f2e",
      showSpinner: false
    }
  }
};

export default config;
