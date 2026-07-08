import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import * as RetrievePanelDetails from '../../utils/retrievePanelDetails';
import {RedirectToFirstRecordPanel} from '../RedirectToFirstRecordPanel';

vi.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useParams: vi.fn(),
    Navigate: vi.fn(),
    generatePath: vi.fn(),
}));

vi.mock('../../utils/retrievePanelDetails', () => ({
    retrievePanelDetails: vi.fn(),
}));

describe('RedirectToFirstRecordPanel component guard', () => {
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyNavigate = vi.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = vi.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = vi.spyOn(RetrievePanelDetails, 'retrievePanelDetails');

    const workspaceId = '42';
    const currentPanelId = 'maps';
    const currentRecordId = '0123456789';
    const panelToReach = 'panelToReach';
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
                libraryPanels: [
                    {
                        id: currentPanelId,
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
                recordPanels: [
                    {
                        id: panelToReach,
                        type: 'editionForm',
                        formId: 'edition',
                    },
                ],
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should redirect to first panel', async () => {
        spyUseParams.mockReturnValue({workspaceId, panelId: currentPanelId, recordId: currentRecordId});
        spyGeneratePath.mockReturnValueOnce('/completePath');
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'map',
        } as any);

        render(<RedirectToFirstRecordPanel />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('/:workspaceId/:panelId/:recordId/:where/:recordPanelId/*', {
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'fullpage',
            recordPanelId: panelToReach,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/completePath'}, {});
    });

    it('should redirect to not found when library is not found for panel', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        spyUseParams.mockReturnValue({workspaceId, panelId: currentPanelId, recordId: currentRecordId});
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: undefined,
        } as any);

        render(<RedirectToFirstRecordPanel />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(`Library not found for panel with id ${currentPanelId}`);
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });

    it('should redirect to not found when no record panel is found for library', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        const libraryIdWithoutRecordPanels = 'mapWithoutRecordPanels';
        const applicationWithoutRecordPanels: Application = {
            workspaces: application.workspaces,
            libraries: {
                ...application.libraries,
                [libraryIdWithoutRecordPanels]: {
                    libraryPanels: application.libraries.map.libraryPanels,
                    recordPanels: [],
                },
            },
        };

        spyUseParams.mockReturnValue({workspaceId, panelId: currentPanelId, recordId: currentRecordId});
        spyUseApplicationSettingsContext.mockReturnValue([applicationWithoutRecordPanels] as any);
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: libraryIdWithoutRecordPanels,
        } as any);

        render(<RedirectToFirstRecordPanel />);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            `No record panel found for library with id ${libraryIdWithoutRecordPanels}`,
        );
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });
});
