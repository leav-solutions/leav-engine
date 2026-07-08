import {type MockInstance} from 'vitest';
import {type FunctionComponent} from 'react';
import {PanelMessengerProvider} from '@leav/ui';
import {render, screen} from '_ui/_tests/testUtils';
import * as GraphQLClient from '../../../../__generated__';
import {InitApplicationSettingProvider} from '../InitApplicationSettingProvider';
import {useApplicationSettingsContext} from '../useApplicationSettingsContext';

describe('ApplicationSettingsContext component', () => {
    let useGetApplicationDataByEndpointQuerySpy: MockInstance;

    beforeEach(() => {
        useGetApplicationDataByEndpointQuerySpy = vi.spyOn(GraphQLClient, 'useGetApplicationDataByEndpointQuery');
    });

    it('should display error if current application is empty', async () => {
        useGetApplicationDataByEndpointQuerySpy.mockReturnValue({
            data: {
                applications: {
                    list: [],
                },
            },
        });

        render(
            <PanelMessengerProvider>
                <InitApplicationSettingProvider />
            </PanelMessengerProvider>,
        );

        expect(screen.getByText(/current_app_error/)).toBeVisible();
    });

    it('should provide valide application configuration', async () => {
        const validAppStudioSettings = {
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
        };
        useGetApplicationDataByEndpointQuerySpy.mockReturnValue({
            data: {
                applications: {
                    list: [
                        {
                            appStudioSettings: validAppStudioSettings,
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
            <PanelMessengerProvider>
                <InitApplicationSettingProvider>
                    <FakeComponent />
                </InitApplicationSettingProvider>
            </PanelMessengerProvider>,
        );

        expect(screen.getByText(validAppStudioSettings.workspaces[0].id)).toBeVisible();
    });
});
