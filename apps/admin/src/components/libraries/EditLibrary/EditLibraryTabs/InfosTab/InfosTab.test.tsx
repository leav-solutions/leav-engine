// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import {getViewsQuery} from 'queries/views/getViewsQuery';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {act, fireEvent, render, screen, waitFor} from '_tests/testUtils';
import {saveLibQuery} from '../../../../../queries/libraries/saveLibMutation';
import {mockLibrary} from '../../../../../__mocks__/libraries';
import InfosTab from './InfosTab';

jest.mock('../../../../../hooks/useLang');

describe('InfosTab', () => {
    const variables = {
        libData: {
            id: 'products',
            label: {fr: 'My new label', en: 'Products'},
            icon: {libraryId: 'library-id', recordId: 'record-id'},
            behavior: 'standard',
            defaultView: null,
            fullTextAttributes: [],
            recordIdentityConf: null
        }
    };

    const commonMocks = [
        {
            request: {
                query: getViewsQuery,
                variables: {
                    library: mockLibrary.id
                }
            },
            result: {
                data: {
                    views: []
                }
            }
        },
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
                        list: [{...mockLibrary, id: 'files', behavior: LibraryBehavior.files}]
                    }
                }
            }
        }
    ];

    test('Display form, edit value and submit on blur', async () => {
        let saveCalled = false;
        const mocks = [
            ...commonMocks,
            {
                request: {
                    query: saveLibQuery,
                    variables
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveLibrary: {
                                ...mockLibrary,
                                __typename: 'Library'
                            }
                        }
                    };
                }
            }
        ];

        await act(async () => {
            render(<InfosTab library={mockLibrary} readonly={false} />, {
                apolloMocks: mocks
            });
        });

        expect(screen.getByRole('textbox', {name: /id/})).toBeInTheDocument();
        expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
        expect(screen.getByRole('textbox', {name: /id/})).toHaveValue(mockLibrary.id);
        expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
        expect(screen.getAllByRole('textbox', {name: /label/})).toHaveLength(2);

        const firstLabeLInput = screen.getAllByRole('textbox', {name: /label/})[0];

        userEvent.clear(firstLabeLInput);
        userEvent.type(firstLabeLInput, 'My new label');
        await act(async () => {
            fireEvent.blur(firstLabeLInput);
        });

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Pass saving errors to form', async () => {
        const mocks = [
            ...commonMocks,
            {
                request: {
                    query: saveLibQuery,
                    variables
                },
                result: {
                    errors: [
                        {
                            message: 'Error',
                            extensions: {
                                code: 'VALIDATION_ERROR',
                                fields: {id: 'invalid id'}
                            },
                            locations: null,
                            path: null,
                            nodes: null,
                            source: null,
                            positions: null,
                            originalError: null,
                            name: 'Error'
                        }
                    ]
                }
            }
        ];

        await act(async () => {
            render(<InfosTab library={mockLibrary} readonly={false} />, {
                apolloMocks: mocks as Array<MockedResponse<Record<string, any>>>
            });
        });

        const firstLabeLInput = screen.getAllByRole('textbox', {name: /label/})[0];

        userEvent.clear(firstLabeLInput);
        userEvent.type(firstLabeLInput, 'My new label');
        await act(async () => {
            fireEvent.blur(firstLabeLInput);
        });

        expect(await screen.findByText(/invalid id/)).toBeInTheDocument();
    });

    test('Render form for new library', async () => {
        await act(async () => {
            render(<InfosTab library={null} readonly={false} />, {
                apolloMocks: commonMocks
            });
        });

        expect(screen.getByRole('textbox', {name: /id/})).not.toBeDisabled();
    });

    test('Autofill ID with label on new lib', async () => {
        await act(async () => {
            render(<InfosTab library={null} readonly={false} />, {
                apolloMocks: commonMocks
            });
        });

        const labelFrInput = screen.getByRole('textbox', {name: 'label.fr'});

        await act(async () => {
            await userEvent.type(labelFrInput, 'Mon libellé', {delay: 1});
        });

        expect(screen.getByRole('textbox', {name: /id/})).toHaveValue('mon_libelle');
    });
});
