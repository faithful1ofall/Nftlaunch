import { useEffect, useState } from "react";
import ContextProvider from "src/utils/ContextProvider";
import GlobalStyles from "@assets/styles/GlobalStyles";
import { CosmosKitProvider } from "src/lib/cosmos-kit-provider";
import { KeplrExtensionProvider, MetamaskExtensionProvider, KeplrMobileProvider, MetamaskMobileProvider, ShuttleProvider } from "@delphi-labs/shuttle-react"
import { INJECTIVE_MAINNET,  INJECTIVE_TESTNET } from 'src/lib/chains';

import { wallets } from "@cosmos-kit/keplr";
//import { wallets } from 'cosmos-kit';

const App = ({ Component, pageProps }) => {
  const [showChild, setShowChild] = useState(false);

  const extensionProviders = [
  new KeplrExtensionProvider({
    networks: [INJECTIVE_MAINNET,  INJECTIVE_TESTNET]
  }),
  new MetamaskExtensionProvider({
    networks: [INJECTIVE_MAINNET,  INJECTIVE_TESTNET]
  })
];

  const mobileProviders = [
  new KeplrMobileProvider({
    networks: [INJECTIVE_MAINNET, INJECTIVE_TESTNET],
    walletConnectProjectId: 'eab00b05bc608b9bccd13ed423d190c3'
  }),
  new MetamaskMobileProvider({
    networks: [INJECTIVE_MAINNET, INJECTIVE_TESTNET],
    walletConnectProjectId: 'eab00b05bc608b9bccd13ed423d190c3'
  })
];


  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return (
    <ShuttleProvider
      providers={extensionProviders}
      mobileProviders={mobileProviders}
      persistent
      >
    <ContextProvider>
      <GlobalStyles />
      <Component {...pageProps} />
    </ContextProvider>
  </ShuttleProvider>
  );
};

export default App;
