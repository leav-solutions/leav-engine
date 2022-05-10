// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import {getUserDataQuery} from 'queries/userData/getUserData';
import React from 'react';
import {mockApplication} from '_tests/mocks/applications';
import {render, screen, within} from '_tests/testUtils';
import Applications from './Applications';
import {CONSULTED_APPS_KEY, FAVORITES_APPS_KEY} from './_constants';

jest.mock('hooks/useLang');

describe('Applications', () => {
    const {location} = window;
    beforeAll(() => {
        delete window.location;
        window.location = {...location, assign: jest.fn(), search: ''};
        Object.defineProperty(window.location, 'replace', jest.fn());
    });

    afterAll(() => {
        window.location = location;
    });

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
                            },
                            {
                                ...mockApplication,
                                id: 'my-third-app',
                                label: {
                                    en: 'My third app'
                                },
                                description: {
                                    en: 'My third description'
                                }
                            },
                            {
                                ...mockApplication,
                                id: 'my-fourth-app',
                                label: {
                                    en: 'My fourth app'
                                },
                                description: {
                                    en: 'My fourth description'
                                }
                            }
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getUserDataQuery,
                variables: {
                    keys: [FAVORITES_APPS_KEY, CONSULTED_APPS_KEY]
                }
            },
            result: {
                data: {
                    userData: {
                        global: false,
                        data: {
                            applications_consultation: ['my-other-app'],
                            favorites_applications_ids: ['my-third-app', 'my-fourth-app']
                        },
                        __typename: 'UserData'
                    }
                }
            }
        }
    ];

    test('Display list of applications, open app on click', async () => {
        render(
            <MockedProvider mocks={mocks}>
                <Applications />
            </MockedProvider>
        );

        await screen.findByText('My first app');

        expect(screen.getByText('My first app')).toBeInTheDocument();
        expect(screen.getByText('My first description')).toBeInTheDocument();
        expect(screen.getByText('My second app')).toBeInTheDocument();
        expect(screen.getByText('My second description')).toBeInTheDocument();
        expect(screen.getByText(/favorites/)).toBeInTheDocument();
        expect(screen.getByText(/consulted/)).toBeInTheDocument();
        expect(screen.getByText(/other_applications/)).toBeInTheDocument();

        userEvent.click(screen.getByText('My first app'));

        expect(window.location.assign).toBeCalledWith(mockApplication.url);
    });

    test('Can filter applications list', async () => {
        render(
            <MockedProvider mocks={mocks}>
                <Applications />
            </MockedProvider>
        );

        await screen.findByText('My first app');

        userEvent.type(screen.getByRole('textbox'), 'first');

        expect(screen.getByText('My first app')).toBeInTheDocument();
        expect(screen.queryByText('My second app')).not.toBeInTheDocument();
    });

    test('Can add and remove apps from favorites', async () => {
        render(
            <MockedProvider mocks={mocks}>
                <Applications />
            </MockedProvider>
        );

        const favoritesList = await screen.findByTestId('favorites-list');
        expect(within(favoritesList).getAllByTestId(/app-card/)).toHaveLength(2);

        const firstAppCard = screen.getByTestId('app-card-my-app');
        const fourthAppCard = screen.getByTestId('app-card-my-fourth-app');
        userEvent.hover(firstAppCard);

        // Add an app to favorites
        userEvent.click(within(firstAppCard).getByRole('img', {name: /star/, hidden: true}));
        expect(within(favoritesList).getAllByTestId(/app-card/)).toHaveLength(3);

        // Remove an app from favorites
        userEvent.click(within(fourthAppCard).getByRole('img', {name: /star/, hidden: true}));
        expect(within(favoritesList).getAllByTestId(/app-card/)).toHaveLength(2);
    });
});
