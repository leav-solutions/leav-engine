import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Modal} from 'semantic-ui-react';
import {IItem} from '../../../../../_types/types';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsModal from './LibraryItemsModal';

describe('LibraryItemsModal', () => {
    test('Snapshot test', async () => {
        const items: IItem = {
            id: 'test',
            label: 'label-test'
        };

        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <LibraryItemsModal
                        showModal={false}
                        setShowModal={jest.fn()}
                        values={items}
                        setValues={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Modal)).toHaveLength(1);
    });
});
