import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import * as RetrievePanelDetails from '../../utils/retrievePanelDetails';
import {RedirectCreationFormPanelToPopup} from '../RedirectCreationFormPanelToPopup';

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

describe('RedirectCreationFormPanelToPopup component guard', () => {
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyNavigate = vi.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = vi.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = vi.spyOn(RetrievePanelDetails, 'retrievePanelDetails');

    const workspaceId = '42';
    const currentPanelId = 'map-list';
    const currentRecordId = 'newRecord';
    const currentRecordPanelId = 'creation_explorer';

    const application: Application = {
        workspaces: [
            {
                id: workspaceId,
                icon: 'fa-layer-group',
                title: {
                    fr: 'Campagnes',
                    en: 'Campaigns',
                },
                type: 'library',
                libraryId: 'campaigns',
            },
        ],
        libraries: {
            campaigns: {
                libraryPanels: [
                    {
                        id: currentPanelId,
                        name: {
                            fr: 'Liste des campagnes',
                            en: 'Campaigns list',
                        },
                        type: 'explorer',
                        isViewSettingsActive: false,
                        viewId: '123456',
                        actions: [],
                    },
                ],
                recordPanels: [
                    {
                        id: currentRecordPanelId,
                        name: {
                            en: 'Create',
                            fr: 'Créer une campagne',
                        },
                        isStandalone: true,
                        type: 'creationForm',
                        formId: 'creation',
                        attributeSource: 'campaigns_id_pac',
                    },
                    {
                        id: 'details',
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

    it('should render children when panel is not a creation form', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'slider',
            recordPanelId: 'details',
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: 'details',
                type: 'editionForm',
                formId: 'edition',
            },
            libraryId: 'campaigns',
            displayedLibraryId: 'campaigns',
            panelType: 'recordPanels',
        });

        const {getByText} = render(
            <RedirectCreationFormPanelToPopup>
                <div>Test children</div>
            </RedirectCreationFormPanelToPopup>,
        );

        expect(getByText('Test children')).toBeInTheDocument();
        expect(spyNavigate).not.toHaveBeenCalled();
        expect(spyGeneratePath).not.toHaveBeenCalled();
    });

    it('should render children when panel is a creation form and where is already popup', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'popup',
            recordPanelId: currentRecordPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                name: {
                    en: 'Create',
                    fr: 'Créer une campagne',
                },
                isStandalone: true,
                type: 'creationForm',
                formId: 'creation',
                attributeSource: 'campaigns_id_pac',
            },
            libraryId: 'campaigns',
            displayedLibraryId: 'campaigns',
            panelType: 'recordPanels',
        });

        const {getByText} = render(
            <RedirectCreationFormPanelToPopup>
                <div>Test children</div>
            </RedirectCreationFormPanelToPopup>,
        );

        expect(getByText('Test children')).toBeInTheDocument();
        expect(spyNavigate).not.toHaveBeenCalled();
        expect(spyGeneratePath).not.toHaveBeenCalled();
    });

    it('should redirect to not found when panel is not found', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'slider',
            recordPanelId: currentRecordPanelId,
        });
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: undefined,
        } as any);

        render(
            <RedirectCreationFormPanelToPopup>
                <div>Test children</div>
            </RedirectCreationFormPanelToPopup>,
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            `Current panel not found for record panel with id ${currentRecordPanelId}`,
        );
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/not-found'}, {});

        consoleErrorSpy.mockRestore();
    });

    it('should redirect to popup when panel is a creation form and where is slider', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'slider',
            recordPanelId: currentRecordPanelId,
        });
        spyGeneratePath.mockReturnValueOnce('/completePath');
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                name: {
                    en: 'Create',
                    fr: 'Créer une campagne',
                },
                isStandalone: true,
                type: 'creationForm',
                formId: 'creation',
                attributeSource: 'campaigns_id_pac',
            },
            libraryId: 'campaigns',
            displayedLibraryId: 'campaigns',
            panelType: 'recordPanels',
        });

        render(<RedirectCreationFormPanelToPopup />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith(expect.any(String), {
            recordId: currentRecordId,
            recordPanelId: currentRecordPanelId,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/completePath', relative: 'path'}, {});
    });

    it('should redirect to popup when panel is a creation form and where is fullpage', async () => {
        spyUseParams.mockReturnValue({
            workspaceId,
            panelId: currentPanelId,
            recordId: currentRecordId,
            where: 'fullpage',
            recordPanelId: currentRecordPanelId,
        });
        spyGeneratePath.mockReturnValueOnce('/completePath');
        spyUseApplicationSettingsContext.mockReturnValue([application] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {
                id: currentRecordPanelId,
                name: {
                    en: 'Create',
                    fr: 'Créer une campagne',
                },
                isStandalone: true,
                type: 'creationForm',
                formId: 'creation',
                attributeSource: 'campaigns_id_pac',
            },
            libraryId: 'campaigns',
            displayedLibraryId: 'campaigns',
            panelType: 'recordPanels',
        });

        render(<RedirectCreationFormPanelToPopup />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith(expect.any(String), {
            recordId: currentRecordId,
            recordPanelId: currentRecordPanelId,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/completePath', relative: 'path'}, {});
    });
});
