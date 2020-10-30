import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {PreviewSize, RecordIdentity_whoAmI} from '../../../../../_types/types';
import CellRecordCard from './CellRecordCard';

describe('CellRecordCard', () => {
    const mockRecord: RecordIdentity_whoAmI = {
        id: 'id'
    };
    test('should contain RecordCard', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<CellRecordCard record={mockRecord} size={PreviewSize.small} />);
        });

        expect(comp.find('RecordCard')).toHaveLength(1);
    });
});
