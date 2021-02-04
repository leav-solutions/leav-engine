// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {StateItemsContext} from '../../../../Context/StateItemsContext';
import {AttributeFormat, AttributeType, IAttribute} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';

jest.mock(
    '../../../ListAttributes',
    () =>
        function ListAttributes() {
            return <div>ListAttributes</div>;
        }
);

describe('ChooseTableColumns', () => {
    test('should render attributes', async () => {
        const attributesMock: IAttribute[] = [
            {
                id: 'test',
                library: 'test_library',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {
                    fr: 'test',
                    en: 'test'
                },
                isLink: false,
                isMultiple: false
            }
        ];

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <StateItemsContext.Provider
                        value={{
                            stateItems: {...LibraryItemListInitialState, attributes: attributesMock},
                            dispatchItems: jest.fn()
                        }}
                    >
                        <ChooseTableColumns openChangeColumns setOpenChangeColumns={jest.fn()} />
                    </StateItemsContext.Provider>
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find('ListAttributes')).toHaveLength(1);
    });
});
