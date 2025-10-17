/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // EFH Brand colors from brand.css
        brand: {
          primary: "var(--brand-primary)",
          "primary-hover": "var(--brand-primary-hover)",
          "primary-active": "var(--brand-primary-active)",
          secondary: "var(--brand-secondary)",
          "secondary-hover": "var(--brand-secondary-hover)",
          success: "var(--brand-success)",
          "success-hover": "var(--brand-success-hover)",
          info: "var(--brand-info)",
          "info-hover": "var(--brand-info-hover)",
          danger: "var(--brand-danger)",
          "danger-hover": "var(--brand-danger-hover)",
          warning: "var(--brand-warning)",
          "warning-hover": "var(--brand-warning-hover)",
          text: "var(--brand-text)",
          "text-muted": "var(--brand-text-muted)",
          "text-light": "var(--brand-text-light)",
          bg: "var(--brand-bg)",
          "bg-surface": "var(--brand-bg-surface)",
          "bg-hover": "var(--brand-bg-hover)",
          border: "var(--brand-border)",
          "border-light": "var(--brand-border-light)",
          focus: "var(--brand-focus)",
        },
      },
      fontFamily: {
        brand: "var(--brand-font-family)",
      },
      fontWeight: {
        "brand-normal": "var(--brand-font-weight-normal)",
        "brand-medium": "var(--brand-font-weight-medium)",
        "brand-semibold": "var(--brand-font-weight-semibold)",
        "brand-bold": "var(--brand-font-weight-bold)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        brand: "var(--brand-radius)",
        "brand-lg": "var(--brand-radius-lg)",
        "brand-full": "var(--brand-radius-full)",
      },
      boxShadow: {
        "brand-sm": "var(--brand-shadow-sm)",
        "brand-md": "var(--brand-shadow-md)",
        "brand-lg": "var(--brand-shadow-lg)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { 
            opacity: "0",
            transform: "translateY(20px)"
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "fade-in-down": {
          from: { 
            opacity: "0",
            transform: "translateY(-20px)"
          },
          to: { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        "slide-in-left": {
          from: { 
            opacity: "0",
            transform: "translateX(-20px)"
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)"
          },
        },
        "slide-in-right": {
          from: { 
            opacity: "0",
            transform: "translateX(20px)"
          },
          to: { 
            opacity: "1",
            transform: "translateX(0)"
          },
        },
        "scale-in": {
          from: { 
            opacity: "0",
            transform: "scale(0.9)"
          },
          to: { 
            opacity: "1",
            transform: "scale(1)"
          },
        },
        "bounce-in": {
          "0%": { 
            opacity: "0",
            transform: "scale(0.3)"
          },
          "50%": { 
            transform: "scale(1.05)"
          },
          "70%": { 
            transform: "scale(0.9)"
          },
          "100%": { 
            opacity: "1",
            transform: "scale(1)"
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "shimmer": "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
