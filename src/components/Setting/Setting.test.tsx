import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Setting from './Setting';

describe('Setting', () => {
    test('should have header', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Setting />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('h1')).toHaveLength(1);
        expect(comp.find('h1').text()).toContain('settings.header');
    });
});
