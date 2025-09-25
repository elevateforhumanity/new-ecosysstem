#!/usr/bin/env node
/* Build Durable-compatible enterprise pages (no external deps) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const TPL = fs.readFileSync(path.join(ROOT, "templates/page.template.html"), "utf8");
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, "content/site.json"), "utf8"));
const INLINE = process.argv.includes("--inline");

/* ---------- helpers ---------- */
const css = `
:root{--bg:${SITE.brand.bg};--card:${SITE.brand.card};--line:${SITE.brand.line};
--text:${SITE.brand.text};--muted:${SITE.brand.muted};--brand:${SITE.brand.brand};--acc:${SITE.brand.accent}}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--text);
font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
a{color:var(--brand);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1140px;margin:0 auto;padding:20px}header{border-bottom:1px solid var(--line)}
.row{display:flex;flex-wrap:wrap;gap:22px;align-items:center}.col{flex:1 1 320px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}
.btn{display:inline-block;padding:12px 18px;border-radius:10px;background:var(--brand);color:white;font-weight:700;text-decoration:none;transition:all 0.3s}
.btn:hover{background:var(--acc);transform:translateY(-1px);text-decoration:none}
.btn.alt{background:var(--acc);color:white}.btn.out{background:transparent;border:1px solid var(--line);color:var(--text)}
.muted{color:var(--muted)}.footer{opacity:.85;font-size:12px;margin:40px 0 10px}
.hero{padding:40px 0;background:linear-gradient(135deg, var(--brand) 0%, var(--acc) 100%);color:white;border-radius:12px;margin:20px 0}
.hero h2{color:white;font-size:2.5rem;margin-bottom:1rem}
.hero .muted{color:rgba(255,255,255,0.9)}
.pill{display:inline-block;padding:6px 10px;border:1px solid var(--line);border-radius:999px;margin:4px 6px 0 0;background:var(--card);color:var(--text);font-size:12px}
img{max-width:100%;height:auto;border-radius:12px}
label{display:block;margin:8px 0 4px;font-weight:600}
select,input{width:100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);margin-bottom:8px}
.testimonial{background:var(--card);padding:20px;border-radius:12px;border:1px solid var(--line);text-align:center}
.testimonial-avatar{width:60px;height:60px;border-radius:50%;background:var(--brand);color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-weight:bold}
.carousel{position:relative;margin:20px 0;border-radius:12px;overflow:hidden}
.carousel-slide{display:none;height:300px;background:linear-gradient(45deg, var(--brand), var(--acc));color:white;display:flex;align-items:center;justify-content:center;font-size:1.2rem;text-align:center;padding:2rem}
.carousel-slide.active{display:flex}
.carousel-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.9);border:none;width:40px;height:40px;border-radius:50%;cursor:pointer;font-size:1.2rem}
.carousel-prev{left:10px}.carousel-next{right:10px}
.carousel-dots{text-align:center;margin-top:10px}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--line);margin:0 5px;cursor:pointer}
.dot.active{background:var(--brand)}
@media (max-width: 768px) {
  .row{flex-direction:column}.hero h2{font-size:2rem}.carousel-nav{display:none}
}
`;

const js = `
(function(){
  window.addEventListener("click",e=>{const t=e.target.closest("[data-track]");if(!t)return;
  console.log("track",t.getAttribute("data-track"));});
  
  // Carousel functionality
  let currentSlide = 0;
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  
  function showSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[n]) {
      slides[n].classList.add('active');
      if (dots[n]) dots[n].classList.add('active');
    }
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }
  
  // Auto-advance carousel
  if (slides.length > 0) {
    setInterval(nextSlide, 5000);
    showSlide(0);
  }
  
  // Navigation buttons
  document.addEventListener('click', e => {
    if (e.target.classList.contains('carousel-next')) nextSlide();
    if (e.target.classList.contains('carousel-prev')) prevSlide();
    if (e.target.classList.contains('dot')) {
      currentSlide = Array.from(dots).indexOf(e.target);
      showSlide(currentSlide);
    }
  });
})();

function routeWizard() {
  const r = document.getElementById("region").value;
  const g = document.getElementById("goal").value;
  if (!r||!g) { alert("Select region and goal"); return; }
  const map = ${JSON.stringify(SITE.regionRoutes)};
  const next = (map[r] && map[r][g]) || "${SITE.links.studentIntake}";
  window.open(next, "_blank","noopener");
}
`;

function dataUriFor(file) {
  if (!file || !fs.existsSync(path.join(ROOT, file))) return "";
  const buf = fs.readFileSync(path.join(ROOT, file));
  const ext = path.extname(file).slice(1) || "jpeg";
  const mime = ext === "jpg" ? "jpeg" : ext;
  return `data:image/${mime};base64,${buf.toString("base64")}`;
}

function page({ title, desc, body, canonical }) {
  let html = TPL
    .replaceAll("{{TITLE}}", title)
    .replaceAll("{{DESC}}", desc)
    .replaceAll("{{CANONICAL}}", canonical || SITE.siteUrl)
    .replaceAll("{{ORG}}", SITE.orgName)
    .replace("{{CSS}}", css)
    .replace("{{JS}}", js)
    .replace("{{BODY}}", body);
  return html;
}

function heroBlock() {
  const heroImg = INLINE ? dataUriFor(SITE.hero.image) : (SITE.hero.image || "");
  const imgTag = heroImg ? `<img alt="Hero" src="${heroImg}" />` : `
    <div class="carousel">
      <div class="carousel-slide active">Professional Development Training</div>
      <div class="carousel-slide">Digital Learning Platform</div>
      <div class="carousel-slide">Classroom Excellence</div>
      <button class="carousel-nav carousel-prev">‹</button>
      <button class="carousel-nav carousel-next">›</button>
    </div>
    <div class="carousel-dots">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;
  
  return `
  <section class="wrap hero">
    <div class="row">
      <div class="col">
        <h2>${SITE.hero.headline}</h2>
        <p class="muted">${SITE.hero.subhead}</p>
        <div style="margin-top:16px">
          <a class="btn" href="apply.html" data-track="cta-student">Fund Your Training</a>
          <a class="btn alt" href="programs.html" data-track="cta-programs" style="margin-left:8px">Browse Programs</a>
        </div>
      </div>
      <div class="col">${imgTag}</div>
    </div>
  </section>`;
}

function programsGrid() {
  const cards = SITE.programs.map(p=>{
    const img = INLINE ? dataUriFor(p.image) : (p.image || "");
    const imgTag = img ? `<img alt="${p.title}" src="${img}"/>` : "";
    const elig = (p.eligible||[]).map(e=>`<span class="pill">${e}</span>`).join(" ");
    return `<div class="card">
      ${imgTag}
      <h4>${p.title}</h4>
      <p class="muted">Code: ${p.code} • Tuition: $${(p.price||0).toLocaleString()} • Length: ${p.length||""}</p>
      <p>${elig}</p>
      <a class="btn" href="apply.html" data-track="enroll-${p.code}">Enroll</a>
    </div>`;
  }).join("");
  return `<section class="wrap"><h3>Invest in Tomorrow's Talent</h3><div class="grid">${cards}</div></section>`;
}

function testimonialsBlock() {
  const testimonials = [
    {
      name: "Jordan Lee",
      initials: "JL",
      quote: "The support from Elevate for Humanity has been transformative. Their funding allowed me to enroll in a high-quality apprenticeship program, setting me on a path to a fulfilling career. Their dedication to student success is unmatched."
    },
    {
      name: "Alex Morgan", 
      initials: "AM",
      quote: "Elevate for Humanity provided essential funding that opened doors to my dream apprenticeship. Their commitment to empowering individuals with career opportunities is truly inspiring, and their support has been pivotal in advancing my professional journey."
    },
    {
      name: "Taylor Rivers",
      initials: "TR", 
      quote: "Elevate for Humanity's funding was a game-changer for me. It enabled my participation in an incredible training program that propelled my career forward. Their unwavering support and commitment to individual growth are exceptional."
    }
  ];
  
  const cards = testimonials.map(t => `
    <div class="testimonial">
      <div class="testimonial-avatar">${t.initials}</div>
      <blockquote style="font-style:italic;margin-bottom:1rem">"${t.quote}"</blockquote>
      <cite style="font-weight:600">- ${t.name}</cite>
    </div>
  `).join("");
  
  return `
  <section class="wrap" style="margin-top:40px">
    <h3 style="text-align:center;margin-bottom:2rem">Partnering For Futures: Testimonials That Inspire</h3>
    <p style="text-align:center;color:var(--muted);margin-bottom:2rem">Transforming futures through hands-on learning and career pathways, Elevate for Humanity empowers every individual to thrive professionally.</p>
    <div class="grid">${cards}</div>
  </section>`;
}

function employersBlock() {
  return `
  <section class="wrap" style="margin-top:40px">
    <div class="card">
      <h3>Employers — Host Trainees (WEX/JRI/OJT/Apprenticeship)</h3>
      <p class="muted">Register to host trainees; we coordinate eligibility with WorkOne/EmployIndy.</p>
      <a class="btn alt" href="${SITE.links.employerSignup}" data-track="employer-signup">Employer Registration</a>
      <a class="btn out" style="margin-left:10px" href="${SITE.links.employerMouPdf}" data-track="employer-mou">Download MOU</a>
    </div>
  </section>`;
}

function applyPageBody() {
  const regions = Object.keys(SITE.regionRoutes).map(r=>`<option>${r}</option>`).join("");
  return `
  <section class="wrap">
    <div class="card">
      <h3>Find Your Funding/Placement Path</h3>
      <label>Region</label>
      <select id="region"><option value="">Select…</option>${regions}</select>
      <label style="margin-top:8px">Goal</label>
      <select id="goal">
        <option value="">Select…</option>
        <option value="voucher">Voucher (WRG/WIOA)</option>
        <option value="paid-experience">Paid Work Experience (WEX/JRI)</option>
        <option value="apprenticeship">Apprenticeship</option>
        <option value="ojt">OJT</option>
      </select>
      <div style="margin-top:14px">
        <button class="btn" onclick="routeWizard()" data-track="wizard-route">Get Next Step</button>
        <a class="btn out" style="margin-left:10px" href="${SITE.links.studentIntake}">Skip to Student Intake</a>
      </div>
    </div>
  </section>`;
}

/* ---------- build ---------- */
fs.rmSync(DIST, { recursive:true, force:true });
fs.mkdirSync(DIST, { recursive:true });

const home = heroBlock() + programsGrid() + testimonialsBlock() + employersBlock();
fs.writeFileSync(path.join(DIST, "index.html"), page({
  title: `${SITE.orgName} — Workforce Development`,
  desc: "ETPL-approved training with WRG/WIOA vouchers, WEX/JRI/OJT placements, and apprenticeship pathways.",
  canonical: SITE.siteUrl,
  body: home
}), "utf8");

fs.writeFileSync(path.join(DIST, "programs.html"), page({
  title: "Programs — ETPL Catalog",
  desc: "Voucher-eligible programs with employer pathways.",
  canonical: SITE.siteUrl + "/programs.html",
  body: programsGrid()
}), "utf8");

fs.writeFileSync(path.join(DIST, "employers.html"), page({
  title: "Employers — Host Trainees",
  desc: "WEX/JRI/OJT and apprenticeship partnerships.",
  canonical: SITE.siteUrl + "/employers.html",
  body: employersBlock()
}), "utf8");

fs.writeFileSync(path.join(DIST, "apply.html"), page({
  title: "Apply — Students & Jobseekers",
  desc: "Find your WRG/WIOA voucher or WEX/JRI/OJT next step.",
  canonical: SITE.siteUrl + "/apply.html",
  body: applyPageBody()
}), "utf8");

fs.writeFileSync(path.join(DIST, "policies.html"), page({
  title: "Policies & Notices",
  desc: "Equal Opportunity statements and accessibility.",
  canonical: SITE.siteUrl + "/policies.html",
  body: `<section class="wrap"><div class="card">
  <h3>Compliance & Notices</h3>
  <p class="muted">Equal Opportunity Is the Law. Veterans' Priority of Service. Auxiliary aids/services available upon request to individuals with disabilities. TTY Relay 711. Language assistance services available free of charge.</p>
  <p class="muted">Contact: ${SITE.email} • ${SITE.phone}</p>
</div></section>`
}), "utf8");

/* robots + sitemap */
fs.writeFileSync(path.join(DIST, "robots.txt"),
`User-agent: *
Allow: /
Sitemap: ${SITE.siteUrl}/sitemap.xml
`, "utf8");

const urls = ["","/programs.html","/employers.html","/apply.html","/policies.html"]
  .map(p=>`<url><loc>${SITE.siteUrl}${p}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`).join("");
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, "utf8");

/* one-file inline variant for Durable "Custom HTML" paste */
if (INLINE) {
  const one = fs.readFileSync(path.join(DIST,"index.html"),"utf8");
  const onePath = path.join(DIST,"onepage-inline.html");
  fs.writeFileSync(onePath, one, "utf8");
}

/* zip */
import { execSync } from "node:child_process";
try {
  execSync(`cd ${DIST} && zip -qr durable-site.zip .` , { stdio:"inherit" });
} catch (e) {
  console.log("Note: zip not available, but files are ready in dist/");
}

console.log("✅ Built pages in dist/");
console.log("📋 Copy dist/onepage-inline.html into Durable Custom HTML");
console.log("📁 Or upload the whole dist/ folder to hosting");
console.log("🔗 Links point to your existing pages (apply.html, employer-dashboard.html, etc.)");