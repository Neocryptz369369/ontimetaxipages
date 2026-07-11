import type { ReactNode } from "react";

export const metadata = {
  title: "On-Time Taxi",
  description: "On-Time Taxi website",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f7fb" }}>{children}<div style={{ position: "fixed", bottom: "16px", right: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "red", zIndex: 99999 }} /></body>
    </html>
  );
}
