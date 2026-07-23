import {type MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {
    GetLibByIdDocument,
    LibraryBehavior,
    GetLibrariesDocument,
    GetViewsDocument,
    SaveLibraryDocument,
} from '../../../../../_gqlTypes';
import {fireEvent, render, screen, waitFor} from '../../../../../_tests/testUtils';
import {mockLibrary} from '../../../../../__mocks__/libraries';
import InfosTab from './InfosTab';

vi.mock('../../../../../hooks/useLang');

describe('InfosTab', () => {
    const variables = {
        libData: {
            id: 'products',
            label: {fr: 'My new label', en: 'Products'},
            icon: {libraryId: 'library-id', recordId: 'record-id'},
            behavior: LibraryBehavior.standard,
            mandatoryAttribute: null,
            defaultView: null,
            fullTextAttributes: [],
            recordIdentityConf: null,
        },
    };

    const commonMocks = [
        {
            // The lib ID uniqueness check (getLibById, no-cache) fires on every keystroke of the
            // auto-filled ID, so it queries intermediate IDs we can't enumerate. Match any variables
            // and return an empty list (ID available) for all of them.
            request: {
                query: GetLibByIdDocument,
            },
            variableMatcher: () => true,
            maxUsageCount: Number.POSITIVE_INFINITY,
            result: {
                data: {
                    libraries: {
                        list: [],
                    },
                },
            },
        },
        {
            request: {
                query: GetViewsDocument,
                variables: {
                    library: mockLibrary.id,
                },
            },
            result: {
                data: {
                    views: [],
                },
            },
        },
        {
            request: {
                query: GetLibrariesDocument,
                variables: {
                    behavior: [LibraryBehavior.files],
                },
            },
            result: {
                data: {
                    libraries: {
                        totalCount: 1,
                        list: [{...mockLibrary, id: 'files', behavior: LibraryBehavior.files}],
                    },
                },
            },
        },
    ];

    test('Display form, edit value and submit on blur', async () => {
        let saveCalled = false;
        const mocks = [
            ...commonMocks,
            {
                request: {
                    query: SaveLibraryDocument,
                    variables,
                },
                result: () => {
                    saveCalled = true;
                    return {
                        data: {
                            saveLibrary: {
                                ...mockLibrary,
                                __typename: 'Library',
                            },
                        },
                    };
                },
            },
        ];

        render(<InfosTab library={mockLibrary} readonly={false} />, {
            apolloMocks: mocks,
        });

        expect(screen.getByRole('textbox', {name: /id/})).toBeInTheDocument();
        expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
        expect(screen.getByRole('textbox', {name: /id/})).toHaveValue(mockLibrary.id);
        expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
        expect(screen.getAllByRole('textbox', {name: /label/})).toHaveLength(2);

        const firstLabeLInput = screen.getAllByRole('textbox', {name: /label/})[0];

        await userEvent.clear(firstLabeLInput);
        await userEvent.type(firstLabeLInput, 'My new label');
        fireEvent.blur(firstLabeLInput);

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Pass saving errors to form', async () => {
        const mocks = [
            ...commonMocks,
            {
                request: {
                    query: SaveLibraryDocument,
                    variables,
                },
                result: {
                    errors: [
                        {
                            message: 'Error',
                            extensions: {
                                code: 'VALIDATION_ERROR',
                                fields: {id: 'invalid id'},
                            },
                            locations: null,
                            path: null,
                            nodes: null,
                            source: null,
                            positions: null,
                            originalError: null,
                            name: 'Error',
                        },
                    ],
                },
            },
        ];

        render(<InfosTab library={mockLibrary} readonly={false} />, {
            apolloMocks: mocks as Array<MockedResponse<Record<string, any>>>,
        });

        const firstLabeLInput = screen.getAllByRole('textbox', {name: /label/})[0];

        await userEvent.clear(firstLabeLInput);
        await userEvent.type(firstLabeLInput, 'My new label');
        fireEvent.blur(firstLabeLInput);

        expect(await screen.findByText(/invalid id/)).toBeInTheDocument();
    });

    test('Render form for new library', async () => {
        render(<InfosTab library={null} readonly={false} />, {
            apolloMocks: commonMocks,
        });

        expect(screen.getByRole('textbox', {name: /id/})).not.toBeDisabled();
    });

    test('Autofill ID with label on new lib', async () => {
        render(<InfosTab library={null} readonly={false} />, {
            apolloMocks: commonMocks,
        });

        const labelFrInput = screen.getByRole('textbox', {name: 'label.fr'});

        await userEvent.type(labelFrInput, 'Mon libellé', {delay: 1});

        expect(screen.getByRole('textbox', {name: /id/})).toHaveValue('mon_libelle');
    });
});
