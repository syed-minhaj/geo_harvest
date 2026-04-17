"use client";
import  '../../style/themeToggle.css';
import { useTheme } from 'next-themes';

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <label
            className="container"
            title={theme == "dark" ? "Activate light mode" : "Activate dark mode"}
            aria-label={theme == "dark" ? "Activate light mode" : "Activate dark mode"}
        >
            <input
                type="checkbox"
                defaultChecked={theme == 'dark'}
                onChange={toggleTheme}
            />
            <div />
        </label>
    );
};

export default ThemeSwitcher;