import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import DetailNavigation from './DetailNavigation';

describe('DetailNavigation', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <DetailNavigation />
                </MockedProviderWithFragments>
            );
        });

        expect(comp);
    });
});
