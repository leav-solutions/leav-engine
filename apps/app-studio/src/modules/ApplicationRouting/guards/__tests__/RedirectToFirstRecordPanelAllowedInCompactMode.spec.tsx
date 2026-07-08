import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import * as RetrievePanelDetails from '../../utils/retrievePanelDetails';
import {RedirectToFirstRecordPanelAllowedInCompactMode} from '../RedirectToFirstRecordPanelAllowedInCompactMode';

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

describe('RedirectToFirstRecordPanelAllowedInCompactMode component guard', () => {
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyNavigate = vi.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = vi.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = vi.spyOn(RetrievePanelDetails, 'retrievePanelDetails');

    const workspaceId = '42';
    const currentPanelId = 'maps';
    const currentRecordId = '0123456789';
    const currentRecordPanelId = 'hiddenPanel';
    const firstAllowedPanelId = 'allowedPanel';
    const where = 'slider';

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
                        id: currentRecordPanelId,
                        type: 'editionForm',
                        formId: 'edition',
                        hideInCompactMode: true,
                    },
                    {
                        id: firstAllowedPanelId,
                        type: 'editionForm',
                        formId: 'edition',
                        hideInCompactMode: false,
                    },
                ],
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render children when panel is not hidden in compact mode', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where,
            recordPanelId: firstAllowedPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: firstAllowedPanelId,
                type: 'editionForm',
                formId: 'edition',
                hideInCompactMode: false,
            },
            libraryId: 'map',
            displayedLibraryId: 'map',
            panelType: 'recordPanels',
        });

        const {getByText} = render(
            <RedirectToFirstRecordPanelAllowedInCompactMode>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInCompactMode>,
        );

        expect(getByText('Test children')).toBeInTheDocument();
        expect(spyNavigate).not.toHaveBeenCalled();
        expect(spyGeneratePath).not.toHaveBeenCalled();
    });

    it('should render children when where is not slider', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'fullpage',
            recordPanelId: currentRecordPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                type: 'editionForm',
                formId: 'edition',
                hideInCompactMode: true,
            },
            libraryId: 'map',
            displayedLibraryId: 'map',
            panelType: 'recordPanels',
        });

        const {getByText} = render(
            <RedirectToFirstRecordPanelAllowedInCompactMode>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInCompactMode>,
        );

        expect(getByText('Test children')).toBeInTheDocument();
        expect(spyNavigate).not.toHaveBeenCalled();
        expect(spyGeneratePath).not.toHaveBeenCalled();
    });

    it('should redirect to first allowed panel when panel is hidden in slider and where is compact mode', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where,
            recordPanelId: currentRecordPanelId,
        });
        spyGeneratePath.mockReturnValueOnce('/completePath');
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                type: 'editionForm',
                formId: 'edition',
                hideInCompactMode: true,
            },
            libraryId: 'map',
            displayedLibraryId: 'map',
            panelType: 'recordPanels',
        });

        render(<RedirectToFirstRecordPanelAllowedInCompactMode />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('../:recordPanelId', {
            recordPanelId: firstAllowedPanelId,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/completePath', relative: 'path'}, {});
    });

    it('should redirect to not found when current panel is not found', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where,
            recordPanelId: currentRecordPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: undefined,
        } as any);

        render(
            <RedirectToFirstRecordPanelAllowedInCompactMode>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInCompactMode>,
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            `Current panel not found for record panel with id ${currentRecordPanelId}`,
        );
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });

    it('should redirect to not found when library is not found', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where,
            recordPanelId: currentRecordPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                type: 'editionForm',
                formId: 'edition',
                hideInCompactMode: true,
            },
            libraryId: null,
            displayedLibraryId: null,
            panelType: 'recordPanels',
        });

        render(
            <RedirectToFirstRecordPanelAllowedInCompactMode>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInCompactMode>,
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(`Library not found for panel with id ${currentRecordPanelId}`);
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });

    it('should redirect to not found when no record panel allowed in compact mode is found', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        const applicationWithoutAllowedRecordPanel: Application = {
            workspaces: application.workspaces,
            libraries: {
                map: {
                    libraryPanels: application.libraries.map.libraryPanels,
                    recordPanels: [
                        {
                            id: currentRecordPanelId,
                            type: 'editionForm',
                            formId: 'edition',
                            hideInCompactMode: true,
                        },
                    ],
                },
            },
        };

        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where,
            recordPanelId: currentRecordPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([applicationWithoutAllowedRecordPanel] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                type: 'editionForm',
                formId: 'edition',
                hideInCompactMode: true,
            },
            libraryId: 'map',
            displayedLibraryId: 'map',
            panelType: 'recordPanels',
        });

        render(
            <RedirectToFirstRecordPanelAllowedInCompactMode>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInCompactMode>,
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith('No record panel allowed in slider found');
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });
});
