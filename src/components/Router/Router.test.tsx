import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {BrowserRouter} from 'react-router-dom';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Router from './Router';

describe('Router', () => {
    test('Snapshot test', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Router />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(BrowserRouter)).toBeTruthy();
    });
});
