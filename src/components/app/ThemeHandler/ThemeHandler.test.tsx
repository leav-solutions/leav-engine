import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Router from '../../Router';
import ThemeHandler from './ThemeHandler';

describe('ThemeHandler', () => {
    test('should call Router', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ThemeHandler />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Router)).toHaveLength(1);
    });
});
