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
            />
        );

        expect(comp.find('button')).toHaveLength(3);
    });
});
