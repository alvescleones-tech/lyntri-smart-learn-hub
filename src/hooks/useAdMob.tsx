import { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { useToast } from '@/hooks/use-toast';

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // IDs reais do AdMob
  const AD_IDS = {
    banner: 'ca-app-pub-3733287743092429/4614693153', // Edward Banner/Interstitial
    interstitial: 'ca-app-pub-3733287743092429/4614693153', // Edward
    rewarded: 'ca-app-pub-3733287743092429/4614693153', // Edward (use IDs separados se tiver)
  };

  useEffect(() => {
    initializeAdMob();
  }, []);

  const initializeAdMob = async () => {
    try {
      await AdMob.initialize({
        testingDevices: [], // Deixe vazio para produção
        initializeForTesting: false, // Modo produção
      });
      setIsInitialized(true);
      console.log('AdMob inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar AdMob:', error);
      toast({
        title: "Erro no AdMob",
        description: "Não foi possível inicializar os anúncios",
        variant: "destructive"
      });
    }
  };

  const showBanner = async () => {
    if (!isInitialized) {
      console.log('AdMob não inicializado ainda');
      return;
    }

    try {
      const options: BannerAdOptions = {
        adId: AD_IDS.banner,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      };

      await AdMob.showBanner(options);
      console.log('Banner exibido com sucesso');
    } catch (error) {
      console.error('Erro ao exibir banner:', error);
    }
  };

  const hideBanner = async () => {
    try {
      await AdMob.hideBanner();
      console.log('Banner ocultado');
    } catch (error) {
      console.error('Erro ao ocultar banner:', error);
    }
  };

  const removeBanner = async () => {
    try {
      await AdMob.removeBanner();
      console.log('Banner removido');
    } catch (error) {
      console.error('Erro ao remover banner:', error);
    }
  };

  const showInterstitial = async () => {
    if (!isInitialized) {
      console.log('AdMob não inicializado ainda');
      return;
    }

    try {
      await AdMob.prepareInterstitial({
        adId: AD_IDS.interstitial,
      });

      await AdMob.showInterstitial();
      console.log('Interstitial exibido com sucesso');
    } catch (error) {
      console.error('Erro ao exibir interstitial:', error);
    }
  };

  const showRewarded = async (onReward?: () => void) => {
    if (!isInitialized) {
      console.log('AdMob não inicializado ainda');
      return;
    }

    try {
      await AdMob.prepareRewardVideoAd({
        adId: AD_IDS.rewarded,
      });

      await AdMob.showRewardVideoAd();
      console.log('Anúncio de recompensa exibido');
      
      // Execute callback de recompensa
      if (onReward) {
        onReward();
      }
    } catch (error) {
      console.error('Erro ao exibir anúncio de recompensa:', error);
    }
  };

  return {
    isInitialized,
    showBanner,
    hideBanner,
    removeBanner,
    showInterstitial,
    showRewarded,
  };
};
