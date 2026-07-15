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
<div style={{position:'fixed',bottom:'10px',right:'30px',width:'10px',height:'10px',background:'red',borderRadius:'50%'}}></div>
        
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center;"><img src="crypt.png" style="width: 100px; height: 100px;" /></div>
</body>
    </html>
  );
}
