// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import React from 'react';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import FileSelector from './FileSelector';

jest.mock('components/shared/RecordSelector', () => {
    return function RecordSelector() {
        return <div>RecordSelector</div>;
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
                                icon: null,
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

    test('Display record selector after fetching libraries', async () => {
        render(<FileSelector onChange={jest.fn()} value={null} label="icon" />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('RecordSelector')).toBeInTheDocument();
    });
});
