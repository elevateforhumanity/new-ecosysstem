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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";

const Home = lazy(() => import("./pages/Home"));
const Programs = lazy(() => import("./pages/Programs"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Quiz = lazy(() => import("./pages/Quiz"));
const MentorDirectory = lazy(() => import("./pages/sisters/MentorDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AskWidget = lazy(() => import('./components/AskWidget'));

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/apprenticeships" element={<Programs />} />
              <Route path="/programs/*" element={<Programs />} />
              <Route path="/programs/etpl-course-directory" element={<Programs />} />
              <Route path="/academic-calendar" element={<StudentDashboard />} />
              <Route path="/blog" element={<Home />} />
              <Route path="/apply" element={<StudentDashboard />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/mentors" element={<MentorDirectory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AskWidget />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}
