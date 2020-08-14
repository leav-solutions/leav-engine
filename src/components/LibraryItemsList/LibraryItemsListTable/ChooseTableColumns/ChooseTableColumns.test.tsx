import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {AttributeFormat, AttributeType, IAttribute} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../../LibraryItemsListReducer';
import ChooseTableColumns from './ChooseTableColumns';

jest.mock(
    '../../../ListAttributes',
    () =>
        function ListAttributes() {
            return <div>ListAttributes</div>;
        }
);

describe('ChooseTableColumns', () => {
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

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
        const stateMock = {...LibraryItemListInitialState, attributes: attributesMock};

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ChooseTableColumns
                        stateItems={stateMock}
                        dispatchItems={dispatchItems}
                        openChangeColumns={true}
                        setOpenChangeColumns={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );

            await wait();

            comp.update();
        });

        expect(comp.find('ListAttributes')).toHaveLength(1);
    });
});
