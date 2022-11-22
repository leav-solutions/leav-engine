// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {AttributeType} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import {mockRecordWhoAmI} from '__mocks__/common/record';
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
                record: mockRecordWhoAmI
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
