import fs from "fs";
fs.mkdirSync("dist", { recursive: true });
const html = `<!doctype html><html><head><meta charset="utf-8"><title>EFH</title></head>
<body>
<nav><!--SISTER_NAV--></nav>
<main>
  <h1>Elevate for Humanity</h1>
  <!--SISTER_SITES-->
  <!--COMPLIANCE_BLOCK-->
  <!--FUNDERS_BLOCK-->
  <!--NONPROFIT_BLOCK-->
  <!--ALL_PAGES_INDEX-->
  <video id="heroVideo" src="<!--HERO_VIDEO_URL-->" autoplay muted playsinline loop></video>
</main>
</body></html>`;
fs.writeFileSync("dist/index.html", html);
fs.mkdirSync("dist/programs", { recursive: true });
fs.writeFileSync("dist/programs/index.html", html.replace("Elevate for Humanity", "Programs"));
console.log("✅ Built basic site structure");
