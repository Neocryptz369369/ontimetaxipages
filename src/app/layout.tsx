import type { ReactNode } from "react";
import React, { useState } from 'react';

export const metadata = {
  title: "On-Time Taxi",
  description: "On-Time Taxi website",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const options = ['Option 1', 'Option 2', 'Option 3'];

  const handleCheckboxChange = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f7fb" }}>{children}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '260px', height: '260px', zIndex: 9999 }}>
          {options.map((option) => (
            <div key={option} style={{ marginBottom: '10px' }}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => handleCheckboxChange(option)}
              />
              <span style={{ marginLeft: '10px' }}>{option}</span>
            </div>
          ))}
        </div>
      </body>
    </html>
  );
)