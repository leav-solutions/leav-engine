// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
