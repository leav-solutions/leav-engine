// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {render, screen} from '_ui/_tests/testUtils';
import * as GraphQLClient from '../../../../__generated__';
import {InitApplicationSettingProvider} from '../InitApplicationSettingProvider';
import {useApplicationSettingsContext} from '../useApplicationSettingsContext';

describe('ApplicationSettingsContext component', () => {
    let useGetApplicationDataByEndpointQuerySpy: jest.SpyInstance;

    beforeEach(() => {
        useGetApplicationDataByEndpointQuerySpy = jest.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery');
    });

    it('should display error if current application is empty', async () => {
        useGetApplicationDataByEndpointQuerySpy.mockReturnValue({
            data: {
                applications: {
                    list: [],
                },
            },
        });

        render(<InitApplicationSettingProvider />);

        expect(screen.getByText(/current_app_error/)).toBeVisible();
    });

    it('should provide valide application configuration', async () => {
        const valideApplication = {
            application: {
                workspaces: [
                    {
                        id: '1',
                        icon: 'fa-layer-group',
                        title: {
                            fr: 'PACs',
                            en: 'Roadmap',
                        },
                        type: 'library',
                        libraryId: 'map',
                    },
                ],
                libraries: {
                    map: {
                        libraryPanels: [
                            {
                                id: 'maps',
                                name: {
                                    fr: 'Gestion des PACs',
                                    en: 'MAPs Management',
                                },
                                type: 'explorer',
                                viewId: '885451776',
                                actions: [],
                            },
                        ],
                        recordPanels: [],
                    },
                },
            },
        };
        useGetApplicationDataByEndpointQuerySpy.mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            settings: valideApplication,
                        },
                    ],
                },
            },
        });
        const FakeComponent: FunctionComponent = () => {
            const [application] = useApplicationSettingsContext();

            return <span>{application?.workspaces[0].id}</span>;
        };

        render(
            <InitApplicationSettingProvider>
                <FakeComponent />
            </InitApplicationSettingProvider>,
        );

        expect(screen.getByText(valideApplication.application.workspaces[0].id)).toBeVisible();
    });
});
