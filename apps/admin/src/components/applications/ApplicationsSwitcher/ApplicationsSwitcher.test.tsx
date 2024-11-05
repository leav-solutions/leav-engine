// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockApplication} from '__mocks__/common/applications';
import ApplicationsSwitcher from './ApplicationsSwitcher';

describe('ApplicationSwitcher', () => {
    test('Display list of available apps. Click on app to open it', async () => {
        const mocks = [
            {
                request: {
                    query: getApplicationsQuery,
                    variables: {}
                },
                result: {
                    data: {
                        applications: {
                            list: [
                                {
                                    ...mockApplication,
                                    label: {
                                        en: 'My first app'
                                    },
                                    description: {
                                        en: 'My first description'
                                    }
                                },
                                {
                                    ...mockApplication,
                                    id: 'my-other-app',
                                    label: {
                                        en: 'My second app'
                                    },
                                    description: {
                                        en: 'My second description'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];
        render(<ApplicationsSwitcher />, {apolloMocks: mocks});

        userEvent.click(screen.getByRole('button', {name: /applications/}));

        await screen.findByText('My second app');

        expect(screen.getAllByRole('link')).toHaveLength(1);

        expect(screen.getByText('My second app')).toBeInTheDocument();
        expect(screen.getByText('My second description')).toBeInTheDocument();
        expect(screen.getAllByRole('link', {name: /My second app/}).length).toBeGreaterThanOrEqual(1);

        expect(screen.queryByText('My first app')).not.toBeInTheDocument(); // => current app, not in the list

        userEvent.click(screen.getByText('My second app'));
    });
});
