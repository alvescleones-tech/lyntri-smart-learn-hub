import { useEffect, useState } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { useToast } from '@/hooks/use-toast';

export const useAdMob = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // IDs de teste do AdMob - SUBSTITUA pelos seus IDs reais do AdMob
  const AD_IDS = {
    banner: 'ca-app-pub-3940256099942544/6300978111', // ID de teste
    interstitial: 'ca-app-pub-3940256099942544/1033173712', // ID de teste
    rewarded: 'ca-app-pub-3940256099942544/5224046917', // ID de teste
  };

  useEffect(() => {
    initializeAdMob();
  }, []);

  const initializeAdMob = async () => {
    try {
      await AdMob.initialize({
        testingDevices: ['DEVICE_ID_HERE'], // Adicione seus IDs de dispositivo de teste
        initializeForTesting: true, // Mude para false em produção
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
