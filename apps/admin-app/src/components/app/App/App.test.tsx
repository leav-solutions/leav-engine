// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {isAllowedQuery} from 'queries/permissions/isAllowedQuery';
import React from 'react';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {act, render, screen, waitFor} from '_tests/testUtils';
import App from '.';

jest.mock('../Home', () => {
    return function Home() {
        return <div>Home</div>;
    };
});

jest.mock('../MessagesDisplay', () => {
    return function MessagesDisplay() {
        return <div>MessagesDisplay</div>;
    };
});

test('Renders app', async () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: isAllowedQuery,
                variables: {
                    type: PermissionTypes.app,
                    actions: Object.values(PermissionsActions).filter(a => !!a.match(/^app_/))
                }
            },
            result: {
                data: {
                    isAllowed: Object.values(PermissionsActions)
                        .filter(a => !!a.match(/^app_/))
                        .map(action => ({name: action, allowed: true}))
                }
            }
        }
    ];

    await act(async () => {
        render(<App />, {apolloMocks: mocks});
    });

    expect(await waitFor(() => screen.findByText('Home'))).toBeInTheDocument();
});
