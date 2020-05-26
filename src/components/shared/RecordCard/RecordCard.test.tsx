import {mount} from 'enzyme';
import 'jest-styled-components';
import React from 'react';
import {RecordIdentity_whoAmI} from '../../../_types/types';
import RecordPreview from '../../LibraryItemsList/LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';
import RecordCard from './RecordCard';

jest.mock('../../../hooks/useLang');

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
        const comp = mount(<RecordCard record={mockRecord} />);

        expect(comp.find(RecordPreview)).toHaveLength(1);
        expect(comp.text()).toMatch('Test Record');
    });

    test('Create wrapper', async () => {
        const comp = mount(<RecordCard record={mockRecord} />);

        expect(comp.find('Wrapper')).toHaveLength(1);
    });
});
