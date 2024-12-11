"use client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const cache = createCache({ key: "css", prepend: true });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CacheProvider value={cache}>{children}</CacheProvider>
      </body>
    </html>
  );
}
