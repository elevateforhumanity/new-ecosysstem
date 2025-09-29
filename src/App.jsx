/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import AccessibilitySettings from "./components/AccessibilitySettings";
import "./styles/accessibility.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const Government = lazy(() => import("./pages/Government"));
const Philanthropy = lazy(() => import("./pages/Philanthropy"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const DurableLanding = lazy(() => import("./pages/DurableLanding"));
const MainLanding = lazy(() => import("./pages/MainLanding"));
const DurableAI = lazy(() => import("./pages/DurableAI"));
const DurableTemplates = lazy(() => import("./pages/DurableTemplates"));
const DurableFeatures = lazy(() => import("./pages/DurableFeatures"));
const DurablePricing = lazy(() => import("./pages/DurablePricing"));
const Programs = lazy(() => import("./pages/Programs"));
const Student = lazy(() => import("./pages/Student"));
const LMS = lazy(() => import("./pages/LMS"));
const Partners = lazy(() => import("./pages/Partners"));
const Donate = lazy(() => import("./pages/Donate"));
const Pay = lazy(() => import("./pages/Pay"));
const About = lazy(() => import("./pages/About"));
const Hub = lazy(() => import("./pages/Hub"));
const Account = lazy(() => import("./pages/Account"));
const Connect = lazy(() => import("./pages/Connect"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AskWidget = lazy(() => import('./components/AskWidget'));
const NavBar = lazy(() => import('./components/NavBar'));

export default function App() {
  return (
    <HelmetProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
              <NavBar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/government" element={<Government />} />
                <Route path="/philanthropy" element={<Philanthropy />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/accessibility" element={<Accessibility />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/student" element={<Student />} />
                <Route path="/lms" element={<LMS />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/pay" element={<Pay />} />
                <Route path="/about" element={<About />} />
                <Route path="/hub" element={<Hub />} />
                <Route path="/account" element={<Account />} />
                <Route path="/connect" element={<Connect />} />
                <Route path="/durable" element={<DurableLanding />} />
                <Route path="/main-landing" element={<MainLanding />} />
                <Route path="/durable-ai" element={<DurableAI />} />
                <Route path="/durable-templates" element={<DurableTemplates />} />
                <Route path="/durable-features" element={<DurableFeatures />} />
                <Route path="/durable-pricing" element={<DurablePricing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AskWidget />
              <AccessibilitySettings />
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AccessibilityProvider>
    </HelmetProvider>
  );
}
