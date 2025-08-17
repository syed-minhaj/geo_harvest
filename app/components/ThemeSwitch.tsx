"use client";
import React, { useState, useEffect } from 'react';
import  '../style/themeToggle.css';

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
                localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
        localStorage.setItem('theme', theme);
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