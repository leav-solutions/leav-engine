import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Navigation from './Navigation';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'}))
}));

jest.mock(
    '../NavigationView',
    () =>
        function NavigationView() {
            return <div>NavigationView</div>;
        }
);

describe('Navigation', () => {
    test('should call NavigationView', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Navigation />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('NavigationView')).toHaveLength(1);
    });
});
