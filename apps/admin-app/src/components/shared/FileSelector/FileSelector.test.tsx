// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import React from 'react';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/records';
import FileSelector from './FileSelector';

jest.mock('components/records/SelectRecordModal', () => {
    return function SelectRecordModal() {
        return <div>SelectRecordModal</div>;
    };
});

jest.mock('hooks/useLang');

describe('FileSelector', () => {
    const mocks = [
        {
            request: {
                query: getLibsQuery,
                variables: {
                    behavior: [LibraryBehavior.files]
                }
            },
            result: {
                data: {
                    libraries: {
                        totalCount: 1,
                        list: [
                            {
                                id: 'files',
                                system: true,
                                label: {
                                    en: 'Files',
                                    fr: 'Fichiers'
                                },
                                behavior: 'files',
                                gqlNames: {
                                    query: 'files',
                                    type: 'File',
                                    list: 'FileList',
                                    filter: 'FileFilter',
                                    searchableFields: 'FileSearchableFields',
                                    __typename: 'LibraryGraphqlNames'
                                },
                                __typename: 'Library'
                            }
                        ],
                        __typename: 'LibrariesList'
                    }
                }
            }
        }
    ];
    afterEach(() => jest.clearAllMocks());

    test('Can select a new file', async () => {
        await act(async () => {
            render(<FileSelector onChange={jest.fn()} value={null} label="icon" />, {apolloMocks: mocks});
        });

        const selectBtn = await screen.findByRole('button', {name: /select/});
        expect(selectBtn).toBeInTheDocument();

        userEvent.click(selectBtn);

        expect(screen.getByText('SelectRecordModal')).toBeInTheDocument();
    });

    test('Display and change existing file', async () => {
        await act(async () => {
            render(<FileSelector onChange={jest.fn()} value={mockRecord} label="icon" />, {apolloMocks: mocks});
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        userEvent.hover(recordLabel);

        const exchangeBtn = screen.getByRole('button', {name: /exchange/, hidden: true});
        userEvent.click(exchangeBtn);

        expect(screen.getByText('SelectRecordModal')).toBeInTheDocument();
    });

    test('Delete existing file', async () => {
        const mockOnChange = jest.fn();
        await act(async () => {
            render(<FileSelector onChange={mockOnChange} value={mockRecord} label="icon" />, {apolloMocks: mocks});
        });

        expect(screen.queryByRole('button', {name: /select/})).not.toBeInTheDocument();
        const recordLabel = screen.getByText(mockRecord.label);
        expect(recordLabel).toBeInTheDocument();

        userEvent.hover(recordLabel);

        const deleteBtn = screen.getByRole('button', {name: /delete/, hidden: true});
        userEvent.click(deleteBtn);
        userEvent.click(screen.getByRole('button', {name: /submit/}));

        expect(mockOnChange).toBeCalled();
    });
});
