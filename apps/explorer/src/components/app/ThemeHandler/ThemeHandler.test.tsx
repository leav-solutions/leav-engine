// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import ThemeHandler from './ThemeHandler';

jest.mock('../AppHandler', () => {
    return function AppHandler() {
        return <div>AppHandler</div>;
    };
});

describe('ThemeHandler', () => {
    test('should call AppHandler', async () => {
        render(
            <MockedProviderWithFragments>
                <ThemeHandler />
            </MockedProviderWithFragments>
        );

        expect(screen.getByText('AppHandler')).toBeInTheDocument();
    });
});
