// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {isAllowedQuery} from 'graphQL/queries/permissions/isAllowedQuery';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {render, screen} from '_tests/testUtils';
import Settings from './Settings';

jest.mock('./ApplicationSettings', () => function ApplicationSettings() {
        return <div>ApplicationSettings</div>;
    });

jest.mock('./LibrariesSettings', () => function LibrariesSettings() {
        return <div>LibrariesSettings</div>;
    });

jest.mock('./TreesSettings', () => function TreesSettings() {
        return <div>TreesSettings</div>;
    });

describe('Settings', () => {
    const mocks = [
        {
            request: {
                query: isAllowedQuery,
                variables: {
                    type: PermissionTypes.admin,
                    actions: [PermissionsActions.admin_access_libraries, PermissionsActions.admin_access_trees]
                }
            },
            result: {
                data: {
                    isAllowed: [
                        {
                            name: PermissionsActions.admin_access_libraries,
                            allowed: true
                        },
                        {
                            name: PermissionsActions.admin_access_trees,
                            allowed: true
                        }
                    ]
                }
            }
        }
    ];
    test('Render tabs for each sections', async () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>,
            {apolloMocks: mocks}
        );

        expect(await screen.findByText('app_settings.application')).toBeInTheDocument();
        expect(screen.getByText('app_settings.libraries')).toBeInTheDocument();
        expect(screen.getByText('app_settings.trees')).toBeInTheDocument();

        expect(screen.getByText('ApplicationSettings')).toBeInTheDocument();

        userEvent.click(screen.getByText('app_settings.libraries'));
        expect(screen.getByText('LibrariesSettings')).toBeInTheDocument();

        userEvent.click(screen.getByText('app_settings.trees'));
        expect(screen.getByText('TreesSettings')).toBeInTheDocument();
    });

    test('Go to active tab passed in URL', async () => {
        render(
            <MemoryRouter initialEntries={['/settings/libraries']}>
                <Routes>
                    <Route path="/settings/:tabId?" element={<Settings />} />
                </Routes>
            </MemoryRouter>,
            {apolloMocks: mocks}
        );

        expect(await screen.findByText('app_settings.application')).toBeInTheDocument();
        expect(screen.getByText('app_settings.libraries')).toBeInTheDocument();
        expect(screen.getByText('app_settings.trees')).toBeInTheDocument();

        expect(screen.getByText('LibrariesSettings')).toBeInTheDocument();
    });
});
