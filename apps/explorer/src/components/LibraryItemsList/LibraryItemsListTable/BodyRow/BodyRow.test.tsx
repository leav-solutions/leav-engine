// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {mockRecordWhoAmI} from '__mocks__/common/record';
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
                        record: mockRecordWhoAmI
                    }
                }
            }
        ],
        getRowProps: jest.fn()
    };
    test('should display n cells', async () => {
        render(
            <MockStore>
                <BodyRow row={mockRow as any} />
            </MockStore>
        );

        expect(screen.getByText('BodyCell')).toBeInTheDocument();
    });
});
