/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Helmet } from "react-helmet";
import MentorDirectory from "./sisters/MentorDirectory";

export default function ThankYou() {
  return (
    <main style={{ padding: 32, maxWidth: 700, margin: "0 auto" }}>
      <Helmet>
        <title>Thank You | Elevate for Humanity</title>
        <meta
          name="description"
          content="Thank you for your purchase! Your order has been received. Check your email for next steps and setup instructions."
        />
      </Helmet>
      <h1>Thank You for Your Purchase!</h1>
      <p>
        Your order has been received. Check your email for next steps and setup instructions.<br />
        Need help? Email <a href="mailto:support@elevateforhumanity.org">support@elevateforhumanity.org</a>
      </p>
