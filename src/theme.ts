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
                },
            },
        },
        semanticTokens: {
            colors: {
                "jungle-teal": { value: "{colors.nesso.teal}" },
                "turf-green": { value: "{colors.nesso.green}" },
                "turf-green-2": { value: "{colors.nesso.green2}" },
                "turf-green-3": { value: "{colors.nesso.green3}" },
                "nesso-white": { value: "{colors.nesso.white}" },
                "nesso-dark": { value: "{colors.nesso.dark}" },
                bg: {
                    canvas: {
                        value: { _light: "{colors.nesso.white}", _dark: "#040706" }
                    },
                    surface: {
                        value: { _light: "{colors.nesso.white}", _dark: "#080C0B" }
                    },
                    subtle: {
                        value: { _light: "gray.50", _dark: "whiteAlpha.50" }
                    }
                },
                border: {
                    subtle: {
                        value: { _light: "{colors.nesso.teal/10}", _dark: "{colors.nesso.teal/20}" }
                    }
                },
                brand: {
                    solid: { value: "{colors.nesso.teal}" },
                    fg: { value: "{colors.nesso.teal}" },
                    muted: { value: "{colors.nesso.teal/20}" },
                },
            },
        },
    },
})
