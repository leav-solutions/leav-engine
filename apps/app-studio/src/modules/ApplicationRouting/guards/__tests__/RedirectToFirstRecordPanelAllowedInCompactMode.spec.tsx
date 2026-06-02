import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import * as RetrievePanelDetails from '../../utils/retrievePanelDetails';
import {RedirectToFirstRecordPanelAllowedInCompactMode} from '../RedirectToFirstRecordPanelAllowedInCompactMode';

jest.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    Navigate: jest.fn(),
    generatePath: jest.fn(),
}));

jest.mock('../../utils/retrievePanelDetails', () => ({
    retrievePanelDetails: jest.fn(),
}));

describe('RedirectToFirstRecordPanelAllowedInCompactMode component guard', () => {
    const spyUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyNavigate = jest.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = jest.spyOn(RetrievePanelDetails, 'retrievePanelDetails');

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
        jest.clearAllMocks();
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
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

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
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

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
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

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
