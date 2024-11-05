// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import DisplayTypeSelector from './DisplayTypeSelector';

jest.mock(
    '../TileDisplay',
    () =>
        function ItemsTitleDisplay() {
            return <div>ItemsTitleDisplay</div>;
        }
);

jest.mock(
    '../LibraryItemsListTable',
    () =>
        function LibraryItemsListTable() {
            return <div>LibraryItemsListTable</div>;
        }
);

describe('DisplayTypeSelector', () => {
    test('Should call LibraryItemsListTable', async () => {
        render(<DisplayTypeSelector />);

        expect(screen.getByText('LibraryItemsListTable')).toBeInTheDocument();
    });
});
