// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_ui/_tests/testUtils';
import Table from './Table';

jest.mock(
    './ChooseTableColumns',
    () =>
        function ChooseTableColumns() {
            return <div>ChooseTableColumns</div>;
        }
);

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
        }
);

jest.mock(
    './Header',
    () =>
        function Header() {
            return <div>Header</div>;
        }
);

describe('Table', () => {
    test('check child exist', async () => {
        await act(async () => {
            render(<Table />);
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
    });
});
