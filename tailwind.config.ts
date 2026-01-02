import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-roboto)", "sans-serif"],
            },
            colors: {
                // MD3 System Colors
                "md-sys-color-primary": "hsl(var(--md-sys-color-primary))",
                "md-sys-color-on-primary": "hsl(var(--md-sys-color-on-primary))",
                "md-sys-color-primary-container": "hsl(var(--md-sys-color-primary-container))",
                "md-sys-color-on-primary-container": "hsl(var(--md-sys-color-on-primary-container))",

                "md-sys-color-secondary": "hsl(var(--md-sys-color-secondary))",
                "md-sys-color-on-secondary": "hsl(var(--md-sys-color-on-secondary))",
                "md-sys-color-secondary-container": "hsl(var(--md-sys-color-secondary-container))",
                "md-sys-color-on-secondary-container": "hsl(var(--md-sys-color-on-secondary-container))",

                "md-sys-color-surface": "hsl(var(--md-sys-color-surface))",
                "md-sys-color-on-surface": "hsl(var(--md-sys-color-on-surface))",
                "md-sys-color-surface-variant": "hsl(var(--md-sys-color-surface-variant))",
                "md-sys-color-on-surface-variant": "hsl(var(--md-sys-color-on-surface-variant))",
                "md-sys-color-outline": "hsl(var(--md-sys-color-outline))",
                "md-sys-color-outline-variant": "hsl(var(--md-sys-color-outline-variant))",

                // Shadcn / Compatibility mappings
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                'xl': '28px', // MD3 Standard
                '2xl': '32px',
                '3xl': '48px',
            },
        },
    },
    plugins: [],
};
export default config;
