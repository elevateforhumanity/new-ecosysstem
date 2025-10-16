import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DonatePage from "./pages/DonatePage";
import Government from "./pages/Government";
import Philanthropy from "./pages/Philanthropy";
import StudentHub from "./pages/StudentHub";
import BusinessHub from "./pages/BusinessHub";
import CommunityHub from "./pages/CommunityHub";
import EducatorHub from "./pages/EducatorHub";
import NotFound from "./pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/donate.html" element={<DonatePage />} />
      <Route path="/government" element={<Government />} />
      <Route path="/philanthropy" element={<Philanthropy />} />
      <Route path="/student-hub" element={<StudentHub />} />
      <Route path="/business-hub" element={<BusinessHub />} />
      <Route path="/community-hub" element={<CommunityHub />} />
      <Route path="/educator-hub" element={<EducatorHub />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}