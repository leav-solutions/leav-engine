import {mount} from 'enzyme';
import React from 'react';
import {AttributeType} from '../../../../_types/types';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import HeaderTableCell from './HeaderTableCell';

describe('HeaderTableCell', () => {
    const mockCell = {
        name: 'mockCell',
        display: 'mock-cell',
        type: AttributeType.simple
    };

    test('should contain cell display', async () => {
        const comp = mount(
            <HeaderTableCell
                cell={mockCell}
                stateItems={LibraryItemListInitialState}
                dispatchItems={jest.fn()}
                setOpenChangeColumns={jest.fn()}
            />
        );

        expect(comp.text()).toContain(mockCell.display);
    });
});
