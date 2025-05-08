import "@mantine/core/styles.css";
import React from "react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications"; // Import Notifications
import "@mantine/notifications/styles.css"; // Import Notifications CSS
import { GlobalNav } from "../components/GlobalNav"; // Import GlobalNav

// If you have a custom theme, import it here
// import { theme } from "../theme";

export const metadata = {
  title: "POS Admin Panel",
  description: "Admin panel for the Restaurant POS system",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        {/* If using a custom theme, add theme={theme} */}
        <MantineProvider defaultColorScheme="auto">
          <Notifications position="top-right" />
          <GlobalNav>{children}</GlobalNav>
        </MantineProvider>
      </body>
    </html>
  );
}
