// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ThemeConfig} from 'antd/lib/config-provider/context';

export * from './types';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const baseTextColor = '#000000';
export const themeVars = {
    primaryColor: '#0f97e4',
    defaultBg: '#ffffff',
    invertedDefaultBg: '#000000',
    defaultTextColor: baseTextColor,
    invertedDefaultTextColor: '#ffffff',
    secondaryTextColor: baseTextColor + '80',
    activeColor: '#def4ff',
    errorColor: '#e02020',
    secondaryBg: '#f0f0f0',
    lightBg: '#fafafa',
    headerBg: '#f4f4f4',
    borderColor: '#d9d9d9',
    borderLightColor: 'rgb(240, 240, 240)',
    headerHeight: '3rem',
    navigationColumnWidth: '20rem',
    inheritedValuesVersionColor: '#FFBA00',
    checkerBoard: 'repeating-conic-gradient(rgb(220,220,220) 0% 25%, rgb(240,240,240) 0% 50%) 50% / 20px 20px',
    imageDefaultBackground: 'rgb(245, 245, 245)'
};

export const customTheme: ThemeConfig = {
    token: {
        colorPrimary: themeVars.primaryColor,
        colorError: themeVars.errorColor,
        colorBgBase: themeVars.defaultBg,
        colorTextBase: themeVars.defaultTextColor,
        colorBorder: themeVars.borderColor,
        colorBorderSecondary: themeVars.borderLightColor,
        colorSplit: themeVars.borderColor,
        wireframe: false
    },
    components: {
        Layout: {
            colorBgHeader: themeVars.secondaryBg,
            controlHeight: 24 // Used by antd to compute the height of the header (2 * controlHeight)
        },
        Dropdown: {
            controlItemBgHover: themeVars.activeColor,
            colorSplit: themeVars.borderLightColor
        },
        Menu: {
            colorActiveBarBorderSize: 0
        },
        Table: {
            colorBgContainer: 'transparent', // To avoid issues with border-radius on footer
            colorFillAlter: themeVars.lightBg
        }
    }
};
