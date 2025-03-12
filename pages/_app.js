import { useEffect, useState } from "react";
import ContextProvider from "src/utils/ContextProvider";
import GlobalStyles from "@assets/styles/GlobalStyles";
import { CosmosKitProvider } from "src/lib/cosmos-kit-provider";
import { ShuttleProvider } from "@delphi-labs/shuttle-react"
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


  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return (
    <ShuttleProvider
      extensionProviders={extensionProviders}
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
