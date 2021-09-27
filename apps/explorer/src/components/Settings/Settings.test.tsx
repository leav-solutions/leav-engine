// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {InMemoryCache} from '@apollo/client';
import {MockedProvider} from '@apollo/client/testing';
import {PageHeader, Select} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {ThemeSwitcherProvider} from 'react-css-theme-switcher';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {getAvailableLangs} from '../../graphQL/queries/cache/lang/getLangQuery';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Settings from './Settings';

describe('Setting', () => {
    const mockCache = new InMemoryCache();

    mockCache.writeQuery({
        query: getAvailableLangs,
        data: {
            availableLangs: ['fr', 'en'],
            lang: 'fr'
        }
    });

    test('should contain title', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ThemeSwitcherProvider
                        themeMap={{light: `${process.env.PUBLIC_URL}/dark-theme.css`}}
                        defaultTheme="light"
                    >
                        <Settings />
                    </ThemeSwitcherProvider>
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find(PageHeader)).toHaveLength(1);
    });

    test('should display available languages', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProvider cache={mockCache}>
                    <ThemeSwitcherProvider
                        themeMap={{light: `${process.env.PUBLIC_URL}/dark-theme.css`}}
                        defaultTheme="light"
                    >
                        <Settings />
                    </ThemeSwitcherProvider>
                </MockedProvider>
            );

            await wait();

            comp.update();
        });

        expect(comp.text()).toContain('settings.choose-lang');
        expect(comp.find(Select)).toHaveLength(1);
    });
});
