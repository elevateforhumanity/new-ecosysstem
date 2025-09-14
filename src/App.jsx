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

/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";

const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Quiz = lazy(() => import("./pages/Quiz"));
const MentorDirectory = lazy(() => import("./pages/sisters/MentorDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Home() {
  return (
    <div>
      <h1>Elevate</h1>
      <nav><Link to="/about">About</Link></nav>
    </div>
  );
}
function About() {
  return <h2>About</h2>;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/mentors" element={<MentorDirectory />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}

/*
# 0) Make the repair script executable and run it
chmod +x scripts/repair-terminal.sh
bash scripts/repair-terminal.sh
# Open a new terminal after this step

# 1) Ensure Node 18
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] || curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. "$NVM_DIR/nvm.sh"
nvm install 18.20.4
nvm use 18.20.4
node -v

# 2) Clean install and build
  rm -rf node_modules package-lock.json
  npm install
  npm run build

  3) Commit and push so Netlify picks it up
  git add -A
  git commit -m "chore: fix terminal init; add devcontainer; pin Node 18; scaffold Vite; Netlify config" --no-gpg-sign || true
  git push -u origin "$(git rev-parse --abbrev-ref HEAD)"

  4) Open Netlify to Clear cache and deploy
  "$BROWSER" https://app.netlify.com/
*/
