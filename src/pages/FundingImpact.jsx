import React from "react";

export default function FundingImpact() {
  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Funding &amp; Impact</h1>
      <p>
        Elevate for Humanity partners with public, philanthropic, and private investors to expand access to
        workforce training while tracking measurable outcomes.
      </p>
      <section style={{ marginTop: "2rem" }}>
        <h2>Community Investment Areas</h2>
        <ul>
          <li>Scholarships and wraparound services for learners</li>
          <li>On-ramps into high demand careers for underserved talent</li>
          <li>Longitudinal impact studies that demonstrate ROI for funders</li>
        </ul>
      </section>
      <section style={{ marginTop: "2rem" }}>
        <h2>Get Involved</h2>
        <p>
          Email <a href="mailto:funding@elevateforhumanity.org">funding@elevateforhumanity.org</a> to collaborate on
          pooled funds, place-based initiatives, or outcomes-based financing.
        </p>
      </section>
    </main>
  );
}