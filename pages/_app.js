import { useEffect, useState } from "react";
import ContextProvider from "src/utils/ContextProvider";
import GlobalStyles from "@assets/styles/GlobalStyles";
import { ThirdwebProvider } from "thirdweb/react";
import { CosmosKitProvider } from "@/components/cosmos-kit-provider";

const App = ({ Component, pageProps }) => {
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return (
    <CosmosKitProvider>
    <ThirdwebProvider>
    <ContextProvider>
      <GlobalStyles />
      <Component {...pageProps} />
    </ContextProvider>
  </ThirdwebProvider>
  </CosmosKitProvider>
  );
};

export default App;
