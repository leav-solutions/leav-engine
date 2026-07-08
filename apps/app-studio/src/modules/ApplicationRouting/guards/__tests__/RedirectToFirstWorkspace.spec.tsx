import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import {RedirectToFirstWorkspace} from '../RedirectToFirstWorkspace';

vi.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    Navigate: vi.fn(),
    generatePath: vi.fn(),
}));

describe('RedirectToFirstWorkspace component guard', () => {
    const spyNavigate = vi.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = vi.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const firstWorkspaceId = '42';
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
                        id: 'maps',
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

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should redirect to first workspace', async () => {
        spyGeneratePath.mockReturnValueOnce(`/${firstWorkspaceId}`);
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);

        render(<RedirectToFirstWorkspace />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:workspaceId/*', {workspaceId: firstWorkspaceId});

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: `/${firstWorkspaceId}`}, {});
    });

    it('should redirect to not found when no workspace is found', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        const applicationWithoutWorkspaces: Application = {
            workspaces: [],
            libraries: {},
        };

        spyUseApplicationSettingsContext.mockReturnValue([applicationWithoutWorkspaces] as any);

        render(<RedirectToFirstWorkspace />);

        expect(consoleErrorSpy).toHaveBeenCalledWith('No workspace found');
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });
});
