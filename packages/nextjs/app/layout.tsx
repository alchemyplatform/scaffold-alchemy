import { headers } from "next/headers";
import { Providers } from "../providers/providers";
import { cookieToInitialState } from "@account-kit/core";
import "@rainbow-me/rainbowkit/styles.css";
import { config } from "~~/config";
import "~~/styles/globals.css";

export const metadata = {
  title: "Hogwarts Tournament",
  description: "Your magical journey begins here",
  icons: {
    icon: "/sorting-hat.png", // favicon
  },
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  // This will allow us to persist state across page boundaries (read more here: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state)
  const initialState = cookieToInitialState(config, headers().get("cookie") ?? undefined);

  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/sorting-hat.png" />
        <link rel="apple-touch-icon" href="/sorting-hat.png" />
        <link rel="shortcut icon" href="/sorting-hat.png" />
      </head>
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
