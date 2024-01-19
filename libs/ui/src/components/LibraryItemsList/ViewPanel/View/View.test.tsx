// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IView} from '_ui/types/views';
import {SortOrder, ViewSizes, ViewTypes} from '_ui/_gqlTypes';
import {act, render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import View from './View';

describe('View', () => {
    const mockView: IView = {
        id: '0',
        label: {en: 'My view 1', fr: 'My view 1'},
        display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
        color: '#50F0C4',
        shared: false,
        filters: [],
        owner: true,
        sort: {
            field: 'id',
            order: SortOrder.asc
        }
    };

    test('should show view label', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <View view={mockView} onEdit={jest.fn()} />
                </MockSearchContextProvider>
            );
        });

        expect(screen.getByTestId('view-title')).toBeInTheDocument();
    });
});
