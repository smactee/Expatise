'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(
    undefined
);

const THEME_STORAGE_KEY = 'THEME_STORAGE_KEY';

export function ThemeProvider ({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>('dark');

    //Hydrate theme from localStorage / system preference
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = window.localStorage.getItem('THEME_STORAGE_KEY') as Theme | null;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

        const initial: Theme = saved || (prefersDark ? 'dark' : 'light');
        
        setThemeState(initial);
        document.documentElement.dataset.theme = initial;
    }, []);

    const applyTheme = (next: Theme) => {
        setThemeState(next);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('THEME_STORAGE_KEY', next);
        }
        if (typeof document !== 'undefined') {
            document.documentElement.dataset.theme = next;
        }
    };

    const setTheme = (next: Theme) => {
        applyTheme(next);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const value: ThemeContextValue = {
        theme,
        toggleTheme,
        setTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
}
