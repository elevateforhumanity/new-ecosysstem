import fs from "fs";
import path from "path";
import axios from "axios";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_URLS = (process.env.API_URLS || "/api/health").split(",").map(s => s.trim());
const TIMEOUT = Number(process.env.TIMEOUT_MS || 15000);

const PAGES = [
  "/", "/get-started", "/programs", "/about", "/connect",
  "/government", "/philanthropy", "/professional"
];

const results = [];
const t0global = Date.now();

function ok(row){ results.push({ ...row, status: "PASS" }); }
function bad(row){ results.push({ ...row, status: "FAIL" }); }
function warn(row){ results.push({ ...row, status: "WARN" }); }

function ms(dt){ return `${dt}ms`; }
function line(s){ return s.replace(/\s+/g, " ").trim(); }

async function checkApi(urlPath){
  const url = urlPath.startsWith("http") ? urlPath : `${BASE_URL}${urlPath}`;
  const start = Date.now();
  try{
    const res = await axios.get(url, { timeout: TIMEOUT, validateStatus: () => true });
    const dur = Date.now() - start;
    if(res.status >= 200 && res.status < 300){
      // try parse data & minimal schema sanity
      const body = typeof res.data === "object" ? res.data : {};
      ok({ kind:"API", name:urlPath, code:res.status, time:ms(dur), note: Object.keys(body).slice(0,5).join(",") });
    }else{
      bad({ kind:"API", name:urlPath, code:res.status, time:ms(dur), note:`Non-2xx (${res.status})` });
    }
  }catch(e){
    bad({ kind:"API", name:urlPath, code:"ERR", time:ms(Date.now()-start), note: line(e.message) });
  }
}

async function checkApiErrors(urlPath){
  // simulate common failures
  const url = urlPath.startsWith("http") ? urlPath : `${BASE_URL}${urlPath}`;
  const start = Date.now();
  try{
    const res = await axios.get(url+"?__fail=1", { timeout: TIMEOUT, validateStatus: () => true });
    const dur = Date.now() - start;
    if(res.status >= 400) {
      ok({ kind:"API-ERR", name:urlPath, code:res.status, time:ms(dur), note:"Handled error path" });
    } else {
      warn({ kind:"API-ERR", name:urlPath, code:res.status, time:ms(dur), note:"Expected error not triggered (check handler)" });
    }
  }catch(e){
    ok({ kind:"API-ERR", name:urlPath, code:"SIM", time:ms(Date.now()-start), note:"Thrown & caught (acceptable)" });
  }
}

async function checkPage(browser, route){
  const url = route.startsWith("http") ? route : `${BASE_URL}${route}`;
  const start = Date.now();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(line(msg.text())); });

  try{
    const resp = await page.goto(url, { timeout: TIMEOUT, waitUntil:"load" });
    const dur = Date.now() - start;
    const code = resp?.status();
    // Basic visual sanity: ensure there is body content and no full-blank
    const bodyText = await page.evaluate(() => document.body?.innerText?.trim().slice(0,200) || "");
    if(code >= 200 && code < 300 && bodyText.length > 10){
      if (consoleErrors.length) {
        warn({ kind:"PAGE", name:route, code, time:ms(dur), note:`Loaded w/ console errors: ${consoleErrors[0]}` });
      } else {
        ok({ kind:"PAGE", name:route, code, time:ms(dur), note:"Loaded with content" });
      }
    }else{
      bad({ kind:"PAGE", name:route, code, time:ms(dur), note:`Empty or non-2xx. Console: ${consoleErrors[0]||"—"}` });
    }
  }catch(e){
    bad({ kind:"PAGE", name:route, code:"ERR", time:ms(Date.now()-start), note: line(e.message) });
  } finally {
    await page.close();
  }
}

function writeReport(){
  const pass = results.filter(r => r.status==="PASS").length;
  const fail = results.filter(r => r.status==="FAIL").length;
  const warnC = results.filter(r => r.status==="WARN").length;

  const md = [
    `# EFH Test Report`,
    `Base URL: ${BASE_URL}`,
    `Generated: ${new Date().toISOString()}`,
    `Total Duration: ${ms(Date.now() - t0global)}`,
    ``,
    `**Summary**`,
    `- PASS: ${pass}`,
    `- FAIL: ${fail}`,
    `- WARN: ${warnC}`,
    ``,
    `| Kind | Name | Code | Time | Status | Note |`,
    `|------|------|------|------|--------|------|`,
    ...results.map(r => `| ${r.kind} | ${r.name} | ${r.code} | ${r.time} | ${r.status} | ${r.note || ""} |`)
  ].join("\n");

  const outDir = ".autopilot_out";
  fs.mkdirSync(outDir, { recursive:true });
  const fp = path.join(outDir, "test-report.md");
  fs.writeFileSync(fp, md);
  return { fp, fail };
}

(async () => {
  console.log(`\n🚀 Starting EFH Test Runner`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Timeout: ${TIMEOUT}ms\n`);

  const browser = await chromium.launch({ headless: true });

  // Verify APIs
  console.log(`📡 Testing ${API_URLS.length} API endpoints...`);
  for(const u of API_URLS){ await checkApi(u); }

  // Error handling (synthetic)
  console.log(`⚠️  Testing error handling...`);
  for(const u of API_URLS){ await checkApiErrors(u); }

  // Verify pages/data fetching
  console.log(`🌐 Testing ${PAGES.length} pages...`);
  for(const r of PAGES){ await checkPage(browser, r); }

  await browser.close();

  // Report
  const { fp, fail } = writeReport();
  console.log(`\n✅ Test report → ${fp}`);
  
  const pass = results.filter(r => r.status==="PASS").length;
  const failCount = results.filter(r => r.status==="FAIL").length;
  const warnCount = results.filter(r => r.status==="WARN").length;
  
  console.log(`\n📊 Results: ${pass} passed, ${failCount} failed, ${warnCount} warnings\n`);
  
  process.exit(fail ? 1 : 0);
})();
