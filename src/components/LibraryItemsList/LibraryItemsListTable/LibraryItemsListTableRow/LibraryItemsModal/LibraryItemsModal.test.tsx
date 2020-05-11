import {render} from 'enzyme';
import React from 'react';
import {IItem} from '../../../../../_types/types';
import LibraryItemsModal from './LibraryItemsModal';

describe('LibraryItemsModal', () => {
    test('Snapshot test', async () => {
        const items: IItem = {
            id: 'test',
            label: 'label-test'
        };

        const comp = render(
            <LibraryItemsModal showModal={false} setShowModal={jest.fn()} values={items} setValues={jest.fn()} />
        );

        expect(comp.find('Modal')).toHaveLength(0);
    });
});
