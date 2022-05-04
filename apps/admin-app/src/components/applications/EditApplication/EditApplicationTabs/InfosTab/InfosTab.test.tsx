// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import EditApplicationContext from 'context/EditApplicationContext';
import {getApplicationByIdQuery} from 'queries/applications/getApplicationByIdQuery';
import {getApplicationComponentsQuery} from 'queries/applications/getApplicationsComponentsQuery';
import {saveApplicationMutation} from 'queries/applications/saveApplicationMutation';
import React from 'react';
import {act, render, screen, waitFor} from '_tests/testUtils';
import {mockApplicationDetails, mockApplicationsComponents} from '__mocks__/common/applications';
import InfosTab from './InfosTab';

describe('InfosTab', () => {
    test('Display form, edit value and submit on blur', async () => {
        let saveCalled = false;
        const mocks = [
            {
                request: {
                    query: getApplicationComponentsQuery,
                    variables: {}
                },
                result: {
                    data: {
                        applicationsComponents: mockApplicationsComponents
                    }
                }
            },
            {
                request: {
                    query: saveApplicationMutation,
                    variables: {
                        // If this test fails, check the mock variables here
                        application: {
                            id: 'myapp',
                            label: {fr: 'My App', en: 'My App'},
                            description: {en: 'My description'},
                            component: 'admin-app',
                            endpoint: 'my-app',
                            libraries: ['libA', 'libB'],
                            trees: ['treeA', 'treeB']
                        }
                    }
                },
                result: () => {
                    saveCalled = true;

                    return {
                        data: {
                            saveApplication: mockApplicationDetails
                        }
                    };
                }
            }
        ];

        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: mockApplicationDetails, readonly: false}}>
                    <InfosTab />
                </EditApplicationContext.Provider>,
                {apolloMocks: mocks}
            );
        });

        expect(screen.getByRole('textbox', {name: /id/})).toBeInTheDocument();
        expect(screen.getByRole('textbox', {name: /id/})).toHaveValue(mockApplicationDetails.id);
        expect(screen.getByRole('textbox', {name: /id/})).toBeDisabled();
        expect(screen.getAllByRole('textbox', {name: /label/})).toHaveLength(2);
        expect(screen.getAllByRole('textbox', {name: /description/})).toHaveLength(2);

        // Select a component
        const componentSelector = screen.getByRole('combobox', {name: /component/});
        expect(componentSelector).toBeInTheDocument();
        userEvent.click(componentSelector);

        await act(async () => {
            userEvent.click(await screen.findByText(/admin-app/));
        });

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Display form with disabled field if readonly', async () => {
        const mocks = [
            {
                request: {
                    query: getApplicationComponentsQuery,
                    variables: {}
                },
                result: {
                    data: {
                        applicationsComponents: mockApplicationsComponents
                    }
                }
            }
        ];

        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: mockApplicationDetails, readonly: true}}>
                    <InfosTab />
                </EditApplicationContext.Provider>,
                {apolloMocks: mocks}
            );
        });

        screen
            .getAllByRole('textbox', {name: /id|label|description|endpoint|component|trees|libraries/})
            .forEach(elem => {
                expect(elem).toBeDisabled();
            });
    });

    test('Display form for a new app, edit value and submit', async () => {
        let saveCalled = false;
        const checkIdUnicityMock = {
            request: {
                query: getApplicationByIdQuery,
                variables: {
                    id: 'myapp'
                }
            },
            result: {
                data: {
                    applications: {
                        list: []
                    }
                }
            }
        };

        const mocks = [
            checkIdUnicityMock, // Will be called once per letter of the 'myapp' id
            checkIdUnicityMock,
            checkIdUnicityMock,
            checkIdUnicityMock,
            checkIdUnicityMock,
            {
                request: {
                    query: getApplicationComponentsQuery,
                    variables: {}
                },
                result: {
                    data: {
                        applicationsComponents: mockApplicationsComponents
                    }
                }
            },
            {
                request: {
                    query: saveApplicationMutation,
                    variables: {
                        // If this test fails, check the mock variables here
                        application: {
                            id: 'myapp',
                            label: {fr: 'MyApp', en: ''},
                            description: {fr: '', en: ''},
                            component: 'admin-app',
                            endpoint: 'my-app',
                            libraries: [],
                            trees: []
                        }
                    }
                },
                result: () => {
                    saveCalled = true;

                    return {
                        data: {
                            saveApplication: mockApplicationDetails
                        }
                    };
                }
            }
        ];

        await act(async () => {
            render(
                <EditApplicationContext.Provider value={{application: null, readonly: false}}>
                    <InfosTab />
                </EditApplicationContext.Provider>,
                {apolloMocks: mocks}
            );
        });

        userEvent.type(screen.getByRole('textbox', {name: /label.fr/}), 'MyApp');
        userEvent.type(screen.getByRole('textbox', {name: /endpoint/}), 'my-app');

        // Select a component
        userEvent.click(screen.getByRole('combobox', {name: /component/}));
        userEvent.click(await screen.findByText(mockApplicationsComponents[0].description));

        userEvent.click(screen.getByRole('button', {name: /submit/}));

        await waitFor(() => expect(saveCalled).toBe(true));
    });
});
