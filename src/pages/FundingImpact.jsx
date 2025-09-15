import React from "react";

export default function FundingImpact() {
  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", lineHeight: 1.6 }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Funding & Impact</h1>
        <p style={{ marginTop: ".5rem", color: "#555" }}>
          Elevate for Humanity (training institute) and Selfish Inc. (501c3) align workforce training with public and
          philanthropic funding to scale impact and outcomes.
        </p>
      </header>

      <section>
        <h2>Approved & Eligible</h2>
        <ul>
          <li>State Workforce ETPL Provider</li>
          <li>Eligible for WIOA, WRG, JRI, WEX, OJT programs</li>
          <li>Nonprofit arm: Selfish Inc. (501c3) for grants and donations</li>
        </ul>
      </section>

      <section>
        <h2>Programs</h2>
        <ul>
          <li>CNA / HHA, CDL, OSHA</li>
          <li>Business Startup & Entrepreneurship</li>
          <li>Apprenticeships and employer-aligned upskilling</li>
        </ul>
      </section>

      <section>
        <h2>Partnerships</h2>
        <ul>
          <li>Alina’s Choice, Felice (TN), Ivy Tech, WorkOne, and others</li>
        </ul>
      </section>

      <section>
        <h2>Multi-Entity Ecosystem</h2>
        <ul>
          <li>Elevate (training institute)</li>
          <li>Selfish Inc. (nonprofit)</li>
          <li>Curvature (wellness), Meri-Go-Round (products), Serene Comfort Care (home health)</li>
        </ul>
      </section>

      <section>
        <h2>Ways to Fund</h2>
        <ul>
          <li>Workforce grants via DWD/WorkOne (WIOA, WRG, JRI, WEX, OJT)</li>
          <li>Foundation grants via Selfish Inc. (United Way, Lilly, local health & education funders)</li>
          <li>Employer reimbursements and apprenticeships (OJT incentives per hire)</li>
          <li>Individual and corporate donations</li>
        </ul>
      </section>

      <section>
        <h2>For Employers</h2>
        <p>
          Hire through Elevate and access OJT reimbursements and apprenticeship incentives. We handle enrollment and
          compliance. Contact us to start an MOU.
        </p>
      </section>

      <section>
        <h2>Contact & Next Steps</h2>
        <ul>
          <li>Grants & Partnerships: <a href="mailto:grants@elevate.example">grants@elevate.example</a></li>
          <li>Donations (Selfish Inc. 501c3): <a href="https://donate.example" target="_blank" rel="noreferrer">Donate</a></li>
          <li>SAM.gov / Grants.gov: registered or in process</li>
        </ul>
      </section>
    </main>
  );
}