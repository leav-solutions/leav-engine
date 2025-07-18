// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {render, screen} from '_ui/_tests/testUtils';
import * as GraphQLClient from '../../../../__generated__';
import {InitApplicationSettingProvider, useApplicationSettingsContext} from '../ApplicationSettingsContext';

describe('ApplicationSettingsContext component', () => {
    let useGetApplicationInstanceDataByEndpointQuerySpy: jest.SpyInstance;

    beforeEach(() => {
        useGetApplicationInstanceDataByEndpointQuerySpy = jest.spyOn(
            GraphQLClient,
            'useGetApplicationInstanceDataByEndpointQuery'
        );
    });

    it('should display error if current application is empty', async () => {
        useGetApplicationInstanceDataByEndpointQuerySpy.mockReturnValue({
            data: {
                applications: {
                    list: []
                }
            }
        });

        render(<InitApplicationSettingProvider />);

        expect(screen.getByText(/current_app_error/)).toBeVisible();
    });

    it('should provide valide application configuration', async () => {
        const valideApplication = {
            workspaces: [
                {
                    id: 'workspace_test',
                    title: {
                        fr: 'Workspace de test',
                        en: 'Test workspace'
                    },
                    entrypoint: {
                        type: 'library',
                        libraryId: 'library_test'
                    },
                    panels: [
                        {
                            id: 'panel_test',
                            name: {
                                fr: 'Panel de test',
                                en: 'Test panel'
                            },
                            content: {
                                type: 'explorer',
                                libraryId: '<props>',
                                viewId: 'view_test',
                                actions: []
                            }
                        }
                    ]
                }
            ]
        };

        useGetApplicationInstanceDataByEndpointQuerySpy.mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            settings: valideApplication
                        }
                    ]
                }
            }
        });
        const FakeComponent: FunctionComponent = () => {
            const [application] = useApplicationSettingsContext();

            return <span>{application?.workspaces[0].id}</span>;
        };

        render(
            <InitApplicationSettingProvider>
                <FakeComponent />
            </InitApplicationSettingProvider>
        );

        expect(screen.getByText(valideApplication.workspaces[0].id)).toBeVisible();
    });
});
