import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Provides theme context to the entire application using next-themes.
 * This component wraps the NextThemesProvider and allows for easy theme switching.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the theme provider.
 * @param {string} [props.defaultTheme="system"] - The default theme to use. Can be "light", "dark", or "system".
 * @param {string} [props.storageKey="vite-ui-theme"] - The key used to store the theme preference in local storage.
 * @param {boolean} [props.disableTransitionOnChange=false] - If true, disables CSS transitions when the theme changes.
 * @returns {JSX.Element} The ThemeProvider component.
 */
export function ThemeProvider({ children, ...props }) {
    return (
        <NextThemesProvider
            attribute="class" // <--- THIS IS THE CRUCIAL CHANGE
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
