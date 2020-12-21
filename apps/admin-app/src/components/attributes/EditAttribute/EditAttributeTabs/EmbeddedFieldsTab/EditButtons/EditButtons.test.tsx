// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {Mockify} from '../../../../../../_types/Mockify';
import {IFlatItem} from '../EmbeddedFieldsTab';
import EditButtons from './EditButtons';

describe('EmbeddedFieldsWrapper', () => {
    test('should display three Button', async () => {
        const mockFlatItem: Mockify<IFlatItem> = {
            displayForm: false
        };
        const mockFormat = 'extended';

        const comp = render(
            <EditButtons
                id={'test'}
                format={mockFormat}
                flatItem={mockFlatItem as IFlatItem}
                expend={jest.fn()}
                add={jest.fn()}
                remove={jest.fn()}
                t={jest.fn()}
                isRoot={false}
            />
        );

        expect(comp.find('button')).toHaveLength(3);
    });
});
