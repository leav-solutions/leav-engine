// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockLibrary} from '__mocks__/libraries';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import {getLibByIdQuery} from 'queries/libraries/getLibraryById';
import React from 'react';
import EditLibrary from './EditLibrary';

jest.mock('./EditLibraryTabs', () => function EditLibraryTabs() {
        return <div>EditLibraryTabs</div>;
    });

describe('EditLibrary', () => {
    test('Render tabs when editing library', async () => {
        const mocks = [
            {
                request: {
                    query: getLibByIdQuery,
                    variables: {
                        id: ['test']
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibrary
                                }
                            ]
                        }
                    }
                }
            }
        ];
        const mockMatch: any = {params: {id: 'test'}};
        render(<EditLibrary match={mockMatch} />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('EditLibraryTabs')).toBeInTheDocument();
    });

    test('Render tabs when creating library', async () => {
        const mockMatch: any = {params: {}};
        render(<EditLibrary match={mockMatch} />);

        expect(screen.getByText('EditLibraryTabs')).toBeInTheDocument();
    });

    test('Display error if not allowed to create', async () => {
        const mockMatch: any = {params: {}};
        render(<EditLibrary match={mockMatch} />, {
            userPermissions: {[PermissionsActions.admin_create_library]: false}
        });

        expect(screen.getByText('errors.access_denied')).toBeInTheDocument();
    });

    test('Display error if unknown library', async () => {
        const mocks = [
            {
                request: {
                    query: getLibByIdQuery,
                    variables: {
                        id: ['test']
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: []
                        }
                    }
                }
            }
        ];
        const mockMatch: any = {params: {id: 'test'}};
        render(<EditLibrary match={mockMatch} />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText(/unknown_library/)).toBeInTheDocument();
    });
});
