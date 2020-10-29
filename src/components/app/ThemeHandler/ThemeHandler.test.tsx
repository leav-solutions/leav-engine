import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import AppHandler from '../AppHandler';
import ThemeHandler from './ThemeHandler';

jest.mock(
    '../AppHandler',
    () =>
        function AppHandler() {
            return <div>AppHandler</div>;
        }
);

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

        expect(comp.find(AppHandler)).toHaveLength(1);
    });
});
