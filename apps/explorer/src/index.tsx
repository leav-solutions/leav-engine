// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import App from 'components/app';
import React from 'react';
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import ReactDOM from 'react-dom';
import './i18n';
import './index.less';
import * as serviceWorker from './serviceWorker';

const themes = {
    dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
    light: `${process.env.PUBLIC_URL}/light-theme.css`
};

ReactDOM.render(
    <ThemeSwitcherProvider themeMap={themes} defaultTheme="light">
        <App />
    </ThemeSwitcherProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
