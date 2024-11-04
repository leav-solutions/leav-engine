// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import BodyRow from './BodyRow';

jest.mock(
    '../BodyCell',
    () =>
        function BodyCell() {
            return <div>BodyCell</div>;
        }
);

jest.mock(
    '../BodyCell',
    () =>
        function BodyCell() {
            return <div>BodyCell</div>;
        }
);

describe('BodyRow', () => {
    const mockRow = {
        cells: [
            {
                getCellProps: () => ({
                    key: 1
                }),
                column: {
                    id: 'test'
                },
                row: {
                    original: {
                        record: mockRecord
                    }
                }
            }
        ],
        getRowProps: jest.fn()
    };
    test('should display n cells', async () => {
        render(<BodyRow row={mockRow as any} />);

        expect(screen.getByText('BodyCell')).toBeInTheDocument();
    });
});
