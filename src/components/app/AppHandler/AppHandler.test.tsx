import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
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
    test('Should contain Router', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AppHandler />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Router)).toHaveLength(1);
    });
});
