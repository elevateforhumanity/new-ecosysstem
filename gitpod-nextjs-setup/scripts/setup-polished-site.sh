#!/usr/bin/env bash
set -euo pipefail

APP_DIR="web"
if [ ! -d "$APP_DIR" ]; then
  npm create next-app@latest $APP_DIR --yes --ts --eslint --src-dir --app --tailwind --import-alias "@/*"
fi
cd "$APP_DIR"

# deps (styling + UI)
npm i -D prettier prettier-plugin-tailwindcss
npm i clsx tailwind-merge framer-motion lucide-react @radix-ui/react-slot

# shadcn/ui
npx shadcn@latest init -d || true
npx shadcn@latest add button card badge input textarea navigation-menu separator sheet accordion avatar || true

# Tailwind config harden
cat > tailwind.config.ts <<'EOF'
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        brand: { DEFAULT: "#0ea5e9", dark:"#0284c7" },
        bg: "#0b1220"
      },
      fontFamily: { sans: ["Inter", ...fontFamily.sans] }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
EOF

# Global CSS
mkdir -p src/styles
cat > src/styles/globals.css <<'EOF'
@tailwind base; @tailwind components; @tailwind utilities;
:root{--radius:14px}
html,body,#__next{height:100%}
body{background:radial-gradient(1200px 800px at 10% -10%,rgba(14,165,233,.15),transparent 60%),#0b1220;color:#e5e7eb}
.gradient-text{background:linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
.section{padding:96px 0}
.card-glass{@apply rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur}
EOF

# Root layout & font
mkdir -p src/app
cat > src/app/layout.tsx <<'EOF'
import "./../styles/globals.css";
import { ReactNode } from "react";
export const metadata = { title: "EFH — Build. Learn. Elevate.", description: "Polished site scaffold" };
export default function RootLayout({ children }:{children:ReactNode}) {
  return (<html lang="en"><body>{children}</body></html>);
}
EOF

# Components: Navbar + Hero + Footer
mkdir -p src/components
cat > src/components/Navbar.tsx <<'EOF'
"use client";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
export default function Navbar(){
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bg/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <a className="text-lg font-semibold gradient-text" href="/">Elevate for Humanity</a>
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem><a className="px-3 py-2 hover:text-white/90" href="#programs">Programs</a></NavigationMenuItem>
            <NavigationMenuItem><a className="px-3 py-2 hover:text-white/90" href="#pricing">Pricing</a></NavigationMenuItem>
            <NavigationMenuItem><a className="px-3 py-2 hover:text-white/90" href="#contact">Contact</a></NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
EOF

cat > src/components/Hero.tsx <<'EOF'
"use client";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Hero(){
  return (
    <section className="section">
      <div className="container grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.6}}
            className="text-4xl md:text-6xl font-black leading-tight">
            Workforce, <span className="gradient-text">Apprenticeships</span>, & Real Outcomes
          </motion.h1>
          <p className="mt-5 text-white/70 max-w-2xl">
            Skill up, get hired, or start a venture—with a design-first platform.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg"><a href="#apply"><ArrowRight className="mr-2 h-5 w-5"/> Apply Free</a></Button>
            <Button variant="outline" asChild size="lg"><a href="#demo"><Play className="mr-2 h-5 w-5"/> Watch Demo</a></Button>
          </div>
          <p className="mt-4 text-xs text-white/50">ETPL provider • DOL apprenticeship sponsor</p>
        </div>
        <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:.6, delay:.1}}
          className="card-glass p-4">
          <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-brand/30 to-purple-500/20 grid place-items-center">
            <span className="text-white/70">Hero media (video/screenshot)</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
EOF

cat > src/components/Footer.tsx <<'EOF'
export default function Footer(){
  return (
    <footer id="contact" className="border-t border-white/10 py-10 mt-20">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm text-white/60">© {new Date().getFullYear()} Elevate for Humanity</span>
        <div className="text-sm text-white/60">careers@elevateforhumanity.org</div>
      </div>
    </footer>
  );
}
EOF

# Sections: Features, Pricing, CTA
cat > src/components/Features.tsx <<'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LineChart, ShieldCheck } from "lucide-react";
const items = [
  { icon: Sparkles, title:"Design-first UX", text:"Modern, fast, accessible."},
  { icon: LineChart, title:"Outcomes", text:"Credentials, jobs, ventures."},
  { icon: ShieldCheck, title:"Trust", text:"Compliant & secure."},
];
export default function Features(){
  return (
    <section id="programs" className="section">
      <div className="container">
        <Badge className="mb-4">Why EFH</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Built for learners, employers, and founders</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(({icon:Icon,title,text})=>(
            <Card key={title} className="card-glass">
              <CardContent className="p-6">
                <Icon className="mb-3 text-brand" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-white/70">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
EOF

cat > src/components/Pricing.tsx <<'EOF'
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function Pricing(){
  return (
    <section id="pricing" className="section">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[["Starter","$0","Apply free"],["Pro","$49/mo","Get Pro"],["Org","Contact","Talk to us"]].map(([name,price,cta])=>(
            <Card key={name} className="card-glass">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">{name}</h3>
                <div className="text-3xl font-bold">{price}</div>
                <ul className="text-white/70 text-sm list-disc list-inside">
                  <li>Design system</li><li>Credentials</li><li>Career support</li>
                </ul>
                <Button className="w-full" variant={name==="Pro"?"default":"outline"}>{cta}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
EOF

cat > src/components/CTA.tsx <<'EOF'
import { Button } from "@/components/ui/button";
export default function CTA(){
  return (
    <section id="apply" className="section">
      <div className="container text-center card-glass p-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to elevate?</h2>
        <p className="text-white/70 mb-6">Apply now. It's fast—and free.</p>
        <Button size="lg" asChild><a href="mailto:careers@elevateforhumanity.org">Apply Free</a></Button>
      </div>
    </section>
  );
}
EOF

# Home page
cat > src/app/page.tsx <<'EOF'
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Features/>
      <Pricing/>
      <CTA/>
      <Footer/>
    </>
  );
}
EOF

# Prettier (optional)
cat > .prettierrc <<'EOF'
{ "plugins": ["prettier-plugin-tailwindcss"] }
EOF

echo "✅ Polished site scaffolded. Running dev server…"
