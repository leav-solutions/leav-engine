import {render} from 'enzyme';
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

    test('Snapshot test', async () => {
        const comp = render(
            <HeaderTableCell
                cell={mockCell}
                stateItems={LibraryItemListInitialState}
                dispatchItems={jest.fn()}
                setOpenChangeColumns={jest.fn()}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
