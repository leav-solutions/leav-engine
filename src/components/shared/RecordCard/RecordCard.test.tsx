import {mount} from 'enzyme';
import 'jest-styled-components';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {RecordIdentity_whoAmI} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import RecordPreview from '../../LibraryItemsList/LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';
import RecordCard from './RecordCard';

describe('RecordCard', () => {
    const mockRecord: RecordIdentity_whoAmI = {
        id: '12345',
        library: {
            id: 'test_lib',
            label: {fr: 'Test Lib', en: 'test lib'}
        },
        label: 'Test Record'
    };

    test('Snapshot test', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <RecordCard record={mockRecord} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(RecordPreview)).toHaveLength(1);
        expect(comp.text()).toMatch('Test Record');
    });

    test('Create wrapper', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <RecordCard record={mockRecord} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Wrapper')).toHaveLength(1);
    });
});
