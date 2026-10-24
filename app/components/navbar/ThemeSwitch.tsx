"use client";
import '../../style/themeToggle.css';
import { useTheme } from 'next-themes';

const ThemeSwitcher = () => {
    const { setTheme } = useTheme();

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <label
            className="container"
            title="Toggle theme"
            aria-label="Toggle theme"
        >
            <input
                type="checkbox"
                aria-hidden="true"
                tabIndex={-1}
                onChange={toggleTheme}
            />
            <div />
        </label>
    );
};

export default ThemeSwitcher;
