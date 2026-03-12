'use client'

import { IconButton, type IconButtonProps, ClientOnly, Skeleton } from '@chakra-ui/react'
import { ThemeProvider, useTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'
import { LuMoon, LuSun } from 'react-icons/lu'

export interface ColorModeProviderProps extends ThemeProviderProps { }

export function ColorModeProvider(props: ColorModeProviderProps) {
    return (
        <ThemeProvider attribute='class' disableTransitionOnChange {...props} />
    )
}

export function useColorMode() {
    const { resolvedTheme, theme, setTheme } = useTheme()
    const toggleColorMode = () => {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
    }
    return {
        colorMode: resolvedTheme || theme || 'light',
        setColorMode: setTheme,
        toggleColorMode,
    }
}

export function useColorModeValue<T>(light: T, dark: T) {
    const { colorMode } = useColorMode()
    return colorMode === 'dark' ? dark : light
}

export function ColorModeButton(props: IconButtonProps) {
    const { toggleColorMode } = useColorMode()
    return (
        <ClientOnly fallback={<Skeleton boxSize='8' />}>
            <IconButton
                onClick={toggleColorMode}
                variant='ghost'
                aria-label='Toggle color mode'
                size='sm'
                {...props}
            >
                <ColorModeIcon />
            </IconButton>
        </ClientOnly>
    )
}

export function ColorModeIcon() {
    const { colorMode } = useColorMode()
    return colorMode === 'light' ? <LuSun /> : <LuMoon />
}
