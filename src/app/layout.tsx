import type { ReactNode } from "react";

export const metadata = { title: "Secure Next.js starter" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
