// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {deleteVersionProfileMutation} from 'queries/versionProfiles/deleteVersionProfileMutation';
import {getVersionProfilesQuery} from 'queries/versionProfiles/getVersionProfilesQuery';
import React from 'react';
import {render, screen, waitFor} from '_tests/testUtils';
import {mockVersionProfile} from '__mocks__/common/versionProfiles';
import VersionProfiles from './VersionProfiles';

const mockHistoryPush = jest.fn();
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}));

describe('VersionProfiles', () => {
    const mocks = [
        {
            request: {
                query: getVersionProfilesQuery,
                variables: {filters: {}}
            },
            result: {
                data: {
                    versionProfiles: {
                        list: [
                            {...mockVersionProfile, id: 'vpA'},
                            {...mockVersionProfile, id: 'vpB'}
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getVersionProfilesQuery,
                variables: {filters: {id: '%B%'}}
            },
            result: {
                data: {
                    versionProfiles: {
                        list: [{...mockVersionProfile, id: 'vpB'}]
                    }
                }
            }
        }
    ];
    test('Render test', async () => {
        render(<VersionProfiles />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('vpA')).toBeInTheDocument();
        expect(await screen.findByText('vpB')).toBeInTheDocument();

        // Filter list
        userEvent.type(screen.getByRole('textbox', {name: /id/}), 'B');

        expect(screen.getByText(/loading/)).toBeInTheDocument();
        expect(await screen.findByText('vpB')).toBeInTheDocument();
        expect(screen.queryByText('vpA')).not.toBeInTheDocument();

        userEvent.click(screen.getByText('vpB'));
        expect(mockHistoryPush).toHaveBeenCalledWith('/version_profiles/edit/vpB');
    });

    test('Can delete a profile', async () => {
        let deleteCalled = false;
        const mocksWithDelete = [
            ...mocks,
            {
                request: {
                    query: deleteVersionProfileMutation,
                    variables: {id: 'vpA'}
                },
                result: () => {
                    deleteCalled = true;
                    return {
                        data: {
                            deleteVersionProfile: {
                                id: 'vpA'
                            }
                        }
                    };
                }
            }
        ];

        render(<VersionProfiles />, {apolloMocks: mocksWithDelete});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        userEvent.click((await screen.findAllByRole('button', {name: /delete/}))[0]);
        userEvent.click(await screen.findByText('OK'));

        await waitFor(() => expect(deleteCalled).toBe(true));
    });
});
