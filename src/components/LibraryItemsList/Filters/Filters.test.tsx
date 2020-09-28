import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import Filters from './Filters';

jest.mock(
    './FilterSeparator',
    () =>
        function FilterSeparator() {
            return <div>FilterSeparator</div>;
        }
);

jest.mock(
    './FilterItem',
    () =>
        function FilterItem() {
            return <div>FilterItem</div>;
        }
);

jest.mock(
    './AddFilter',
    () =>
        function AddFilter() {
            return <div>AddFilter</div>;
        }
);

describe('Filters', () => {
    const stateItems = LibraryItemListInitialState;
    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('check child', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Filters stateItems={stateItems} dispatchItems={dispatchItems} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AddFilter')).toHaveLength(1);
    });
});
