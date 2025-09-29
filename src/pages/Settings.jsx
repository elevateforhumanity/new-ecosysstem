/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Routes, Route } from "react-router-dom";
import Community from "./pages/Community";
import Integrations from "./pages/Integrations";
import Branding from "./pages/Branding";
import MobileApp from "./pages/MobileApp";
import AccessibilitySettings from "./pages/AccessibilitySettings";
import Support from "./pages/Support";
import Ecommerce from "./pages/Ecommerce";
import CurriculumUpload from "./pages/CurriculumUpload";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <main style={{ padding: 32, maxWidth: 600, margin: "0 auto" }}>
      <h1>Account Settings</h1>
      <ul>
        <li>Change password</li>
        <li>Two-factor authentication</li>
        <li>Notification preferences</li>
      </ul>
