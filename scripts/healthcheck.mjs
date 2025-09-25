#!/usr/bin/env node
import { setTimeout as wait } from "node:timers/promises";

const arg = (k, d=null) => {
  const v = process.argv.find(a => a.startsWith(`--${k}=`));
  return v ? v.split("=")[1] : d;
};

const BASE = arg("base", "http://localhost:8080");
const core = [
  "/", "/government", "/programs", "/lms", "/student",
  "/partners", "/about", "/connect", "/pay", "/donate"
];

const full = p => BASE.replace(/\/+$/,"") + p;

const fetchJSON = async (url) => {
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), 7000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    return { ok: res.ok, status: res.status };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, status: 0 };
  }
};

const main = async () => {
  let okCount = 0;
  for (const p of core) {
    const { ok, status } = await fetchJSON(full(p));
    if (ok) okCount++;
    console.log(`${p.padEnd(14)} → ${status}`);
    await wait(60);
  }
  const pass = okCount >= 6; // allow SSR/SPA warmup
  console.log(`Core OK: ${pass ? "YES" : "NO"} (${okCount}/${core.length})`);
  process.exit(pass ? 0 : 2);
};

main();