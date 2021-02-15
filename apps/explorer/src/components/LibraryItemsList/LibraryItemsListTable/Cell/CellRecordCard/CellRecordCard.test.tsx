// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IRecordIdentityWhoAmI, PreviewSize} from '../../../../../_types/types';
import CellRecordCard from './CellRecordCard';

describe('CellRecordCard', () => {
    const mockRecord: IRecordIdentityWhoAmI = {
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
