import { headers } from "next/headers";
import { Providers } from "./providers";
import { cookieToInitialState } from "@account-kit/core";
import { config } from "~~/account.config";
import scaffoldConfig from "~~/scaffold.config";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-alchemy/getMetadata";

export const metadata = getMetadata({
  title: "Scaffold-Alchemy App",
  description: "Built with 🏗 Scaffold-Alchemy",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  // This will allow us to persist state across page boundaries (read more here: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state)
  const targetNetwork = scaffoldConfig.targetNetworks[0];
  let initialState = cookieToInitialState(config, headers().get("cookie") ?? undefined);
  if (initialState?.alchemy.chain.id !== targetNetwork.id) {
    initialState = cookieToInitialState(config);
  }

  return (
    <html suppressHydrationWarning>
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
