// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import * as RetrievePanelDetails from '../../utils/retrievePanelDetails';
import {RedirectCreationFormPanelToPopup} from '../RedirectCreationFormPanelToPopup';

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

describe('RedirectCreationFormPanelToPopup component guard', () => {
    const spyUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyNavigate = jest.spyOn(ReactRouter, 'Navigate');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = jest.spyOn(RetrievePanelDetails, 'retrievePanelDetails');

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
        jest.clearAllMocks();
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
