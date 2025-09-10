/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./global.css";

const rootEl = document.getElementById("root");
try {
  createRoot(rootEl).render(<App />);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Failed to mount React app:", err);
  if (rootEl) {
    rootEl.innerHTML = '<div style="padding:24px;font-family:system-ui,Arial,sans-serif"><h2>App failed to load</h2><pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:8px">' + String(err) + '</pre></div>';
  }
}