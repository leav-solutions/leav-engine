// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import ThemeHandler from './ThemeHandler';

jest.mock('../AppHandler', () => {
    return function AppHandler() {
        return <div>AppHandler</div>;
    };
});

describe('ThemeHandler', () => {
    test('should call AppHandler', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ThemeHandler />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AppHandler')).toHaveLength(1);
    });
});
