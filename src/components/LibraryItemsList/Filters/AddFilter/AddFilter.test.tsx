import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import AddFilter from './AddFilter';

jest.mock(
    '../../../ListAttributes',
    () =>
        function ListAttributes() {
            return <div>ListAttributes</div>;
        }
);

describe('AttributeList', () => {
    test('should have a List', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AddFilter
                        stateItems={LibraryItemListInitialState}
                        setFilters={jest.fn()}
                        showAttr={true}
                        setShowAttr={jest.fn()}
                        updateFilters={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('ListAttributes')).toHaveLength(1);
    });
});
