// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {IItem} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsModal from './LibraryItemsModal';

describe('LibraryItemsModal', () => {
    test('should have modal', async () => {
        const items: IItem = {
            fields: {},
            whoAmI: {
                ...mockRecordWhoAmI,
                id: 'testId',
                library: {
                    ...mockRecordWhoAmI.library,
                    id: 'testLibId',
                    label: {fr: 'testLibLabelFr', en: 'testLibLabelEn'}
                },
                label: 'label-test'
            },
            index: 0
        };

        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <LibraryItemsModal
                        showModal={false}
                        closeModal={jest.fn()}
                        values={items}
                        updateValues={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Modal)).toHaveLength(1);
    });
});
