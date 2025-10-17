import fs from 'fs';

type Brand = {
  colors: Record<string, string>;
  contrast: { minAA: number; minAAA: number };
};

function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const n = (i: number) => parseInt(c.slice(i, i + 2), 16) / 255;
  const [r, g, b] = [n(0), n(2), n(4)].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const L1 = luminance(a);
  const L2 = luminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const brandFile = 'autopilot-brand.json';
if (!fs.existsSync(brandFile)) {
  console.warn('⚠️  brand-guard: autopilot-brand.json not found; skipping.');
  process.exit(0);
}

const brand = JSON.parse(fs.readFileSync(brandFile, 'utf8')) as Brand;
const minAA = brand.contrast?.minAA || 4.5;
const minAAA = brand.contrast?.minAAA || 7.0;

// Define critical color pairs to check
const pairs = [
  { bg: 'background', text: 'text', name: 'Body text on background' },
  { bg: 'surface', text: 'text', name: 'Text on surface' },
  { bg: 'primary', text: 'onPrimary', name: 'Text on primary buttons' },
  { bg: 'secondary', text: 'onSecondary', name: 'Text on secondary buttons' },
  { bg: 'success', text: 'onSuccess', name: 'Text on success elements' },
  { bg: 'info', text: 'onInfo', name: 'Text on info elements' },
  { bg: 'warning', text: 'onWarning', name: 'Text on warning elements' },
  { bg: 'danger', text: 'onDanger', name: 'Text on danger elements' },
];

let failures = 0;
let warnings = 0;

console.log('\n🎨 Brand Contrast Guard\n');
console.log('Checking WCAG compliance for brand color pairs...\n');

for (const pair of pairs) {
  const bgHex = brand.colors[pair.bg];
  const txHex = brand.colors[pair.text];

  if (!bgHex || !txHex) {
    console.warn(`⚠️  Missing color: ${pair.bg} or ${pair.text}`);
    continue;
  }

  if (!bgHex.startsWith('#') || !txHex.startsWith('#')) {
    console.warn(`⚠️  Invalid hex format: ${bgHex} or ${txHex}`);
    continue;
  }

  const ratio = contrast(bgHex, txHex);

  if (ratio < minAA) {
    console.error(
      `❌ ${pair.name}: ${ratio.toFixed(2)}:1 (FAIL - below AA ${minAA}:1)`
    );
    console.error(`   ${txHex} on ${bgHex}`);
    failures++;
  } else if (ratio < minAAA) {
    console.warn(`⚠️  ${pair.name}: ${ratio.toFixed(2)}:1 (AA pass, AAA fail)`);
    console.warn(`   ${txHex} on ${bgHex}`);
    warnings++;
  } else {
    console.log(`✅ ${pair.name}: ${ratio.toFixed(2)}:1 (AAA compliant)`);
  }
}

console.log('');

if (failures > 0) {
  console.error(
    `\n❌ Brand guard FAILED: ${failures} pairs below WCAG AA (${minAA}:1)`
  );
  console.error('Fix these contrast issues before deploying.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n✅ Brand guard PASSED (AA compliant)`);
  console.log(
    `⚠️  ${warnings} pairs below AAA (${minAAA}:1) - consider improving\n`
  );
  process.exit(0);
} else {
  console.log(`\n✅ Brand guard PASSED - All pairs AAA compliant!\n`);
  process.exit(0);
}
