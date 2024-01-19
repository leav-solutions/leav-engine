// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeType} from '_ui/_gqlTypes';
import {act, render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import BodyCell from './BodyCell';

jest.mock(
    '../Cell',
    () =>
        function Cell() {
            return <div>Cell</div>;
        }
);

describe('BodyCell', () => {
    const mockCell = {
        getCellProps: jest.fn(),
        column: {
            id: 'columnId'
        },
        value: {value: 'valueCell', type: AttributeType.simple, id: 'idCell'},
        row: {
            original: {
                record: mockRecord
            }
        },
        render: jest.fn()
    };

    test('should call cell', async () => {
        await act(async () => {
            render(<BodyCell cell={mockCell as any} selected={false} />);
        });

        expect(screen.getByText('Cell')).toBeInTheDocument();
    });
});
