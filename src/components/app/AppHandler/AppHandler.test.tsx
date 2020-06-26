import {mount} from 'enzyme';
import React from 'react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Router from '../../Router';
import AppHandler from './AppHandler';

jest.mock(
    '../../Router',
    () =>
        function Router() {
            return <div>Router</div>;
        }
);

describe('AppHandler', () => {
    test('Snapshot test', async () => {
        const comp = mount(
            <MockedProviderWithFragments>
                <AppHandler />
            </MockedProviderWithFragments>
        );

        expect(comp.find(Router)).toHaveLength(1);
    });
});
