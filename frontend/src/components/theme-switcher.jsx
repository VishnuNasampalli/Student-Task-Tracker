import React, { useEffect, useState } from 'react';
import { Palette } from 'lucide-react'; // Icon for the button

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the available color themes
const colorThemes = [
    { name: 'Neutral', value: 'neutral' }, // This will use the default :root styles
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green' },
    { name: 'Red', value: 'red' },
];

const ThemeSwitcher = () => {
    // State to hold the currently active color theme
    // Initialize from localStorage or default to 'neutral'
    const [currentThemeColor, setCurrentThemeColor] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app-theme-color') || 'neutral';
        }
        return 'neutral';
    });

    // Effect to apply the data-theme-color attribute to the html element
    useEffect(() => {
        const htmlElement = document.documentElement;
        if (currentThemeColor === 'neutral') {
            // Remove the attribute if 'neutral' is selected, as it's the default
            htmlElement.removeAttribute('data-theme-color');
        } else {
            // Apply the selected theme color attribute
            htmlElement.setAttribute('data-theme-color', currentThemeColor);
        }
        // Save the preference to localStorage
        localStorage.setItem('app-theme-color', currentThemeColor);
    }, [currentThemeColor]); // Re-run effect when currentThemeColor changes

    // Function to handle theme selection
    const handleThemeChange = (themeValue) => {
        setCurrentThemeColor(themeValue);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full shadow-lg">
                        <Palette className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Toggle color theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {colorThemes.map((theme) => (
                        <DropdownMenuItem
                            key={theme.value}
                            onClick={() => handleThemeChange(theme.value)}
                            // Add a checkmark or highlight for the active theme
                            className={currentThemeColor === theme.value ? 'font-bold text-primary' : ''}
                        >
                            {theme.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ThemeSwitcher;
