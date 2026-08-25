import type { ReactNode } from "react";
import LangBar from "../components/LangBar";

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

const footerLink = {
  color: "#5b6478",
  textDecoration: "none",
  fontSize: 12,
  padding: "2px 6px",
} as const;

export default function RootLayout({ children }: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f7fb" }}>
        {children}
        <footer style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          padding: "14px 10px 64px",
          borderTop: "1px solid #e3e7ef",
          background: "#ffffff",
        }}>
          <a href="/privacy" style={footerLink}>Privacy Policy</a>
          <span style={{ color: "#c7ccd8", fontSize: 12 }}>|</span>
          <a href="/terms" style={footerLink}>Terms of Service</a>
          <span style={{ color: "#c7ccd8", fontSize: 12 }}>|</span>
          <a href="/support" style={footerLink}>Support</a>
          <span style={{ color: "#c7ccd8", fontSize: 12 }}>|</span>
          <a href="/delete-account" style={footerLink}>Delete Account</a>
          <span style={{ color: "#c7ccd8", fontSize: 12 }}>|</span>
          <a href="tel:9302164166" style={footerLink}>930-216-4166</a>
        </footer>
        <LangBar />
      </body>
    </html>
  );
}
