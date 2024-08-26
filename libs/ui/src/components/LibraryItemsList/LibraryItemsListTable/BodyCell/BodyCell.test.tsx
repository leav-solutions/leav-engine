// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeType} from '_ui/_gqlTypes';
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {initialSearchState} from '../../hooks/useSearchReducer/searchReducer';
import {ISearchState, SearchStateError} from '../../hooks/useSearchReducer/_types';
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
        render(
            <MockSearchContextProvider>
                <BodyCell cell={mockCell as any} selected={false} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('Cell')).toBeInTheDocument();
    });

    test('Should display error linked to this cell', async () => {
        const error: SearchStateError = {
            locations: [],
            path: [],
            message: 'error message',
            name: 'error',
            source: null,
            nodes: [],
            positions: [],
            originalError: null,
            toJSON: jest.fn(),
            [Symbol.toStringTag]: 'Error',
            extensions: {
                fields: {
                    [mockCell.column.id]: 'error message'
                },
                record: {
                    id: mockCell.row.original.record.id,
                    library: mockCell.row.original.record.library.id
                }
            }
        };

        const state: ISearchState = {
            ...initialSearchState,
            library: mockGetLibraryDetailExtendedElement,
            errors: [error]
        };

        render(
            <MockSearchContextProvider state={state}>
                <BodyCell cell={mockCell as any} selected={false} />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('error message')).toBeInTheDocument();
    });
});
