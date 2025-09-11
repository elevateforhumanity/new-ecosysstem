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

import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { supabase } from "./supabaseClient";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";

const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Quiz = lazy(() => import("./pages/Quiz"));
const MentorDirectory = lazy(() => import("./pages/sisters/MentorDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from("your_table").select("*");
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
            <NavBar />
            <Routes>
              <Route path="/" element={<StudentDashboard />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/mentors" element={<MentorDirectory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}

VITE_SUPABASE_KEY=your_supabase_anon_key
