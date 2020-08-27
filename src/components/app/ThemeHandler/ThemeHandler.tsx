import React from 'react';
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import AppHandler from '../AppHandler';

const themes = {
    dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
    light: `${process.env.PUBLIC_URL}/light-theme.css`
};

function ThemeHandler(): JSX.Element {
    return (
        <ThemeSwitcherProvider themeMap={themes} defaultTheme="light">
            <AppHandler />
        </ThemeSwitcherProvider>
    );
}

export default ThemeHandler;
