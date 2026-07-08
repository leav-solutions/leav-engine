import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import {RedirectToFirstPanel} from '../RedirectToFirstPanel';

vi.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useParams: vi.fn(),
    Navigate: vi.fn(),
    generatePath: vi.fn(),
}));

describe('RedirectToFirstPanel component guard', () => {
    const spyNavigate = vi.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = vi.spyOn(ReactRouter, 'generatePath');
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should redirect to first library panel', async () => {
        const firstWorkspaceId = '42';
        const firstLibraryPanelId = 'panel1';
        const application: Application = {
            workspaces: [
                {
                    id: firstWorkspaceId,
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
                            id: firstLibraryPanelId,
                            name: {
                                fr: 'Gestion des PACs',
                                en: 'MAPs Management',
                            },
                            type: 'explorer',
                            isViewSettingsActive: false,
                            viewId: '885451776',
                            actions: [
                                {
                                    where: 'fullpage',
                                    what: 'record',
                                    label: {
                                        en: 'Open PAC',
                                        fr: 'Ouvrir le PAC',
                                    },
                                },
                            ],
                        },
                    ],
                    recordPanels: [],
                },
            },
        };
        spyUseParams.mockReturnValue({workspaceId: firstWorkspaceId});
        spyGeneratePath.mockReturnValueOnce(`/${firstWorkspaceId}/${firstLibraryPanelId}`);
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        render(<RedirectToFirstPanel />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:workspaceId/:panelId/*', {
            workspaceId: firstWorkspaceId,
            panelId: firstLibraryPanelId,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith(
            {replace: true, to: `/${firstWorkspaceId}/${firstLibraryPanelId}`},
            {},
        );
    });

    it('should redirect to first record panel', async () => {
        const firstWorkspaceId = '42';
        const firstRecordPanelId = 'panel1';
        const application: Application = {
            workspaces: [
                {
                    id: firstWorkspaceId,
                    icon: 'fa-layer-group',
                    title: {
                        fr: 'PAC de l’année',
                        en: 'MAP of the year',
                    },
                    type: 'record',
                    recordId: '0123456789',
                    libraryId: 'map',
                },
            ],
            libraries: {
                map: {
                    libraryPanels: [],
                    recordPanels: [
                        {
                            id: firstRecordPanelId,
                            type: 'editionForm',
                            formId: 'edition',
                        },
                    ],
                },
            },
        };
        spyUseParams.mockReturnValue({workspaceId: firstWorkspaceId});
        spyGeneratePath.mockReturnValueOnce(`/${firstWorkspaceId}/${firstRecordPanelId}`);
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        render(<RedirectToFirstPanel />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:workspaceId/:panelId/*', {
            workspaceId: firstWorkspaceId,
            panelId: firstRecordPanelId,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: `/${firstWorkspaceId}/${firstRecordPanelId}`}, {});
    });

    it('should redirect to not found when workspace is not found', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        const workspaceId = '42';
        const application: Application = {
            workspaces: [],
            libraries: {},
        };

        spyUseParams.mockReturnValue({workspaceId});
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        render(<RedirectToFirstPanel />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(`Workspace with id ${workspaceId} not found`);
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });

    it('should redirect to not found when no panel is found for workspace', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        const workspaceId = '42';
        const application: Application = {
            workspaces: [
                {
                    id: workspaceId,
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
                    libraryPanels: [],
                    recordPanels: [],
                },
            },
        };

        spyUseParams.mockReturnValue({workspaceId});
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        render(<RedirectToFirstPanel />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(`No panel found for workspace with id ${workspaceId}`);
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });
});
