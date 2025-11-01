import { useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';

interface AdMobManagerProps {
  showBannerAd?: boolean;
  children?: React.ReactNode;
}

const AdMobManager = ({ showBannerAd = true, children }: AdMobManagerProps) => {
  const { isInitialized, showBanner, removeBanner } = useAdMob();

  useEffect(() => {
    if (isInitialized && showBannerAd) {
      showBanner();
    }

    return () => {
      if (isInitialized) {
        removeBanner();
      }
    };
  }, [isInitialized, showBannerAd]);

  return <>{children}</>;
};

export default AdMobManager;
