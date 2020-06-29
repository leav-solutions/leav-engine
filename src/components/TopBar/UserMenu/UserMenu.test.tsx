import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Menu} from 'semantic-ui-react';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    test('should be an Menu Item', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <UserMenu />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Menu.Item)).toHaveLength(1);
    });
});
