import type { ReactNode } from "react";

export const metadata = {
  title: "On-Time Taxi",
  description: "On-Time Taxi website",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f7fb" }}>{children}<div style={{ position: "fixed", bottom: "16px", right: "16px", width: "40px", height: "40px", borderRadius: "50%", background: "red", zIndex: 99999 }} /><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '260px', height: '260px', zIndex: 9999 }}><CloudflareBrowserRendering /></div>
<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '260px', height: '260px', zIndex: 9999 }}><iframe src='https://example.com' frameBorder='0' width='260' height='260'></iframe></div>
</body>
    </html>
  );
}
