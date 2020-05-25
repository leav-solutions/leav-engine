import {mount} from 'enzyme';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Router from './Router';

describe('Router', () => {
    test('Snapshot test', async () => {
        const comp = mount(
            <MockedProviderWithFragments>
                <Router />
            </MockedProviderWithFragments>
        );

        expect(comp.find(BrowserRouter)).toBeTruthy();
    });
});
