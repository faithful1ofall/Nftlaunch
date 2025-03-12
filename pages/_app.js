import { useEffect, useState } from "react";
import ContextProvider from "src/utils/ContextProvider";
import GlobalStyles from "@assets/styles/GlobalStyles";
import { CosmosKitProvider } from "src/lib/cosmos-kit-provider";
import { ShuttleProvider } from "@delphi-labs/shuttle-react"

const App = ({ Component, pageProps }) => {
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return (
    <ShuttleProvider>
    <ContextProvider>
      <GlobalStyles />
      <Component {...pageProps} />
    </ContextProvider>
  </ShuttleProvider>
  );
};

export default App;
