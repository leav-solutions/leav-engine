import {render} from 'enzyme';
import React from 'react';
import useLang from '../../../../hooks/useLang';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

jest.mock('../../../../hooks/useLang');

describe('LibraryItemsListTableRow', () => {
    useLang;
    test('Snapshot test', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };
        const comp = render(
            <LibraryItemsListTableRow item={itemMock} modeSelection={false} setModeSelection={jest.fn()} />
        );

        expect(comp).toMatchSnapshot();
    });
});
