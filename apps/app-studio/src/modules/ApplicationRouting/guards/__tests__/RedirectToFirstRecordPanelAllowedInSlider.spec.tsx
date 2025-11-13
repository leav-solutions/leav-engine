// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/ApplicationSettingsContext';
import {type Application} from '../../types';
import * as RetrievePanelDetails from '../../utils/retrievePanelDetails';
import {RedirectToFirstRecordPanelAllowedInSlider} from '../RedirectToFirstRecordPanelAllowedInSlider';

jest.mock('../../../../config/application-instance/application-settings/ApplicationSettingsContext', () => ({
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

describe('RedirectToFirstRecordPanelAllowedInSlider component guard', () => {
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
                        hideInSlider: true,
                    },
                    {
                        id: firstAllowedPanelId,
                        type: 'editionForm',
                        formId: 'edition',
                        hideInSlider: false,
                    },
                ],
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render children when panel is not hidden in slider', async () => {
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
                hideInSlider: false,
            },
            libraryId: 'map',
            panelType: 'recordPanels',
        });

        const {getByText} = render(
            <RedirectToFirstRecordPanelAllowedInSlider>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInSlider>,
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
                hideInSlider: true,
            },
            libraryId: 'map',
            panelType: 'recordPanels',
        });

        const {getByText} = render(
            <RedirectToFirstRecordPanelAllowedInSlider>
                <div>Test children</div>
            </RedirectToFirstRecordPanelAllowedInSlider>,
        );

        expect(getByText('Test children')).toBeInTheDocument();
        expect(spyNavigate).not.toHaveBeenCalled();
        expect(spyGeneratePath).not.toHaveBeenCalled();
    });

    it('should redirect to first allowed panel when panel is hidden in slider and where is slider', async () => {
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
                hideInSlider: true,
            },
            libraryId: 'map',
            panelType: 'recordPanels',
        });

        render(<RedirectToFirstRecordPanelAllowedInSlider />);

        expect(spyGeneratePath).toHaveBeenCalledTimes(1);
        expect(spyGeneratePath).toHaveBeenCalledWith('../:recordPanelId', {
            recordPanelId: firstAllowedPanelId,
        });

        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith({replace: true, to: '/completePath', relative: 'path'}, {});
    });
});
