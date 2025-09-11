/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { supabase } from "./supabaseClient";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import AppRouter from "./router.jsx";

// Lazy-loaded pages (ensure these files exist)
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Quiz = lazy(() => import("./pages/Quiz"));
const MentorDirectory = lazy(() => import("./pages/sisters/MentorDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Use your actual Supabase table name here
      const { data, error } = await supabase.from("students").select("*");
      if (error) setError(error.message);
      setData(data || []);
    }
    fetchData();
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
            <Helmet>
              {/* SEO & Verification Meta Tags */}
              <meta
                name="google-site-verification"
                content={import.meta.env.VITE_GOOGLE_VERIFICATION_CODE}
              />
              <meta
                name="msvalidate.01"
                content={import.meta.env.VITE_BING_VERIFICATION_CODE}
              />
              {/* Google Analytics */}
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`}
              ></script>
              <script>
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${import.meta.env.VITE_GA_MEASUREMENT_ID}');
                `}
              </script>
            </Helmet>
            <NavBar />
            <main>
              <AppRouter />
              {/* Show error if Supabase fails */}
              {error && (
                <div style={{ color: "red", margin: "20px 0" }}>
                  Error loading data: {error}
                </div>
              )}
              {/* Show data if present */}
              {data.length > 0 && (
                <div style={{ margin: "20px 0" }}>
                  <h2>Student Data</h2>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
              )}
            </main>
            <Footer />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}
