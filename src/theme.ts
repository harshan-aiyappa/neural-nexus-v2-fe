import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                nesso: {
                    teal: { value: "#518E6D" },
                    green: { value: "#107B41" },
                    green2: { value: "#12753D" },
                    green3: { value: "#216D44" },
                    white: { value: "#FFFFFF" },
                    dark: { value: "#0A0F0D" },
                    emerald: {
                        50: { value: "#ECFDF5" },
                        100: { value: "#D1FAE5" },
                        200: { value: "#A7F3D0" },
                        300: { value: "#6EE7B7" },
                        400: { value: "#34D399" },
                        500: { value: "#10B981" },
                        600: { value: "#059669" },
                        700: { value: "#047857" },
                        800: { value: "#065F46" },
                        900: { value: "#064E3B" },
                    },
                    gray: {
                        50: { value: "#F8FAFC" },
                        100: { value: "#F1F5F9" },
                        200: { value: "#E2E8F0" },
                        300: { value: "#CBD5E1" },
                        400: { value: "#94A3B8" },
                        500: { value: "#64748B" },
                        600: { value: "#475569" },
                        700: { value: "#334155" },
                        800: { value: "#1E293B" },
                        900: { value: "#0F172A" },
                    }
                },
            },
            fonts: {
                heading: { value: "'Outfit', sans-serif" },
                body: { value: "'Inter', sans-serif" },
                mono: { value: "'JetBrains Mono', monospace" }
            }
        },
        semanticTokens: {
            colors: {
                "jungle-teal": { value: "{colors.nesso.teal}" },
                "turf-green": { value: "{colors.nesso.green}" },
                "turf-green-light": { value: "#518E6D" }, // Jungle Teal acts as a lighter companion
                "turf-green-dark": { value: "{colors.nesso.green3}" },
                
                brand: {
                    solid: { value: "{colors.nesso.green}" },
                    fg: { value: "{colors.nesso.green}" },
                    muted: { value: "{colors.nesso.teal/15}" },
                    subtle: { value: "{colors.nesso.teal/5}" },
                    accent: { value: "{colors.nesso.teal}" }
                },

                fg: {
                    DEFAULT: { value: { _light: "{colors.nesso.gray.900}", _dark: "{colors.nesso.white}" } },
                    muted: { value: { _light: "{colors.nesso.gray.800}", _dark: "{colors.nesso.gray.400}" } }, // Darkened from 700 to 800
                    subtle: { value: { _light: "{colors.nesso.gray.700}", _dark: "{colors.nesso.gray.500}" } }, // Darkened from 600 to 700
                    on: {
                        brand: { value: "{colors.nesso.white}" }
                    }
                },

                bg: {
                    canvas: {
                        value: { _light: "#F9FAFB", _dark: "#020403" }
                    },
                    surface: {
                        value: { _light: "#FFFFFF", _dark: "#080C0B" }
                    },
                    subtle: {
                        value: { _light: "{colors.nesso.gray.50}", _dark: "#0C110F" }
                    },
                    muted: {
                        value: { _light: "{colors.nesso.gray.100}", _dark: "{colors.nesso.gray.800}" }
                    },
                    glass: {
                        value: { 
                            _light: "rgba(255, 255, 255, 0.6)", 
                            _dark: "rgba(8, 12, 11, 0.6)" 
                        }
                    }
                },

                border: {
                    DEFAULT: { value: { _light: "{colors.nesso.gray.400}", _dark: "{colors.nesso.gray.800}" } }, // From 300 to 400
                    subtle: {
                        value: { _light: "{colors.nesso.teal/35}", _dark: "{colors.nesso.teal/25}" } // Strengthened from 20 to 35/25
                    },
                    focus: {
                        value: { _light: "{colors.nesso.green}", _dark: "{colors.nesso.teal}" }
                    }
                }
            },
            shadows: {
                premium: { 
                    value: {
                        _light: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
                        _dark: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
                    }
                },
                glow: { value: "0 0 20px rgba(16, 123, 65, 0.25)" },
                "glow-teal": { value: "0 0 20px rgba(81, 142, 109, 0.2)" }
            }
        },
    },
})
