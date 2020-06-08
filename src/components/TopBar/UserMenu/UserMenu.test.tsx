import {mount, render} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Dropdown} from 'semantic-ui-react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <MockedProviderWithFragments>
                <UserMenu />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });

    test('should have a Dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <UserMenu />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Dropdown)).toHaveLength(1);
    });
});
