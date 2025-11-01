# 📱 Configuração do App Móvel com AdMob

## ✅ O que já está configurado

- ✅ Capacitor instalado e configurado
- ✅ Plugin AdMob instalado
- ✅ Hook personalizado `useAdMob` para gerenciar anúncios
- ✅ Componente `AdMobManager` para exibir banners automaticamente

## 🚀 Próximos passos para testar no celular

### 1️⃣ Transferir projeto para seu GitHub
1. Clique no botão **"Export to Github"** no Lovable
2. Faça `git pull` do projeto no seu computador

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Adicionar plataformas nativas
```bash
# Para Android
npx cap add android

# Para iOS (apenas em Mac)
npx cap add ios
```

### 4️⃣ Atualizar dependências nativas
```bash
# Para Android
npx cap update android

# Para iOS
npx cap update ios
```

### 5️⃣ Build do projeto
```bash
npm run build
```

### 6️⃣ Sincronizar com plataformas nativas
```bash
npx cap sync
```

### 7️⃣ Executar no dispositivo/emulador
```bash
# Para Android (precisa do Android Studio instalado)
npx cap run android

# Para iOS (precisa de Mac com Xcode)
npx cap run ios
```

## ✅ IDs do AdMob Configurados

**App ID:** `ca-app-pub-3733287743092429~4643555264`
**Unit ID (Edward):** `ca-app-pub-3733287743092429/4614693153`

Os IDs já estão configurados em:
- ✅ `src/hooks/useAdMob.tsx` - IDs de anúncio
- ✅ `android/app/src/main/AndroidManifest.xml` - App ID Android
- ✅ `ios/App/App/Info.plist` - App ID iOS
- ✅ Modo de produção ativado (`initializeForTesting: false`)

**Importante:** Se você criar mais unidades de anúncio no AdMob (banner separado, interstitial, rewarded), atualize os IDs específicos em `src/hooks/useAdMob.tsx`.

## 📲 Como usar os anúncios no seu app

### Banner (aparece na parte inferior)
```typescript
import AdMobManager from '@/components/AdMobManager';

function MinhaPage() {
  return (
    <AdMobManager showBannerAd={true}>
      {/* Seu conteúdo aqui */}
    </AdMobManager>
  );
}
```

### Anúncio Intersticial (tela cheia)
```typescript
import { useAdMob } from '@/hooks/useAdMob';

function MinhaPage() {
  const { showInterstitial } = useAdMob();
  
  const handleClick = () => {
    showInterstitial(); // Exibe anúncio de tela cheia
  };
  
  return <button onClick={handleClick}>Ver anúncio</button>;
}
```

### Anúncio com Recompensa
```typescript
import { useAdMob } from '@/hooks/useAdMob';

function MinhaPage() {
  const { showRewarded } = useAdMob();
  
  const handleRewardedAd = () => {
    showRewarded(() => {
      // Dê a recompensa ao usuário aqui
      console.log('Usuário ganhou a recompensa!');
    });
  };
  
  return <button onClick={handleRewardedAd}>Ganhar moedas</button>;
}
```

## 🔧 Configurações nativas adicionais

### Android (android/app/src/main/AndroidManifest.xml)
Adicione dentro de `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

### iOS (ios/App/App/Info.plist)
Adicione:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>cstr6suwn9.skadnetwork</string>
  </dict>
</array>
```

## 📚 Recursos úteis

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Plugin AdMob](https://github.com/capacitor-community/admob)
- [Google AdMob](https://admob.google.com/)
- [Guia Lovable + Capacitor](https://docs.lovable.dev)

## ⚠️ Observações importantes

1. **IDs de teste**: Os IDs atuais são de teste. Troque pelos seus IDs reais do AdMob
2. **Modo de teste**: Está ativado `initializeForTesting: true` - desative em produção
3. **Hot reload**: Funciona direto da sandbox do Lovable durante desenvolvimento
4. **Sync**: Sempre rode `npx cap sync` após fazer `git pull` de mudanças
5. **Publicação**: Para publicar nas lojas, você precisará de contas de desenvolvedor (Google Play e/ou Apple)

## 🎉 Pronto!

Seu app agora está configurado como aplicativo móvel nativo com suporte a AdMob. Siga os passos acima para testar no seu dispositivo!
