import type { ReactNode } from "react";

export const metadata = {
  title: "On Time Taxi",
  description: "On-Time Taxi website",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b1020",
  appleWebApp: {
    capable: true,
    title: "On Time Taxi",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/ontimetaxi-logo.png",
    apple: "/ontimetaxi-logo.png",
  },
};

export default function RootLayout({ children }: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f7fb" }}>
        {children}
</body>
    </html>
  );
}
