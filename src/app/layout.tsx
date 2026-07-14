import type { ReactNode } from "react";

export const metadata = {
  title: "On-Time Taxi",
  description: "On-Time Taxi website",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f7fb" }}>
        {children}
        <div style={{position:'fixed',bottom:'10px',right:'10px',width:'10px',height:'10px',background:'red',borderRadius:'50%'}}></div>
        
      </body>
    </html>
  );
}
