// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {render as renderRTL} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as ReactRouter from 'react-router-dom';
import * as Utils from '../../utils/retrievePanelDetails';
import * as LibraryIdCardComponent from '../id-card/LibraryIdCard';
import * as RecordIdCardComponent from '../id-card/RecordIdCard';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import {PanelHeader} from '../PanelHeader';
import {MockedLangContextProvider} from '@leav/ui';

jest.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
    generatePath: jest.fn(),
}));

jest.mock('../id-card/LibraryIdCard', () => ({
    LibraryIdCard: jest.fn(),
}));

jest.mock('../id-card/RecordIdCard', () => ({
    RecordIdCard: jest.fn(),
}));

describe('PanelHeader', () => {
    const spyUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyUseNavigate = jest.spyOn(ReactRouter, 'useNavigate');
    const spyGeneratePath = jest.spyOn(ReactRouter, 'generatePath');
    const spyLibraryIdCard = jest.spyOn(LibraryIdCardComponent, 'LibraryIdCard');
    const spyRecordIdCard = jest.spyOn(RecordIdCardComponent, 'RecordIdCard');
    const spyRetrievePanelDetails = jest.spyOn(Utils, 'retrievePanelDetails');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const emptyApplication: Application = {
        workspaces: [],
        libraries: {},
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display RecordIdCard component when panel is type record', async () => {
        spyUseParams.mockReturnValue({recordId: '1234567890'});
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            panelType: 'recordPanels',
            currentPanel: {
                id: 'panel1',
                type: 'editionForm',
                formId: 'edition',
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader enabled />);

        expect(spyRetrievePanelDetails).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledWith(
            {
                libraryId: 'test',
                currentRecordId: '1234567890',
                avatarSize: 'l',
            },
            {},
        );
    });

    it('should display RecordIdCard component when panel is type record and recordId is providing by parent', async () => {
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            panelType: 'recordPanels',
            currentPanel: {
                id: 'panel1',
                type: 'editionForm',
                formId: 'edition',
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader enabled currentRecordId="1234567890" />);

        expect(spyRetrievePanelDetails).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledTimes(1);
        expect(spyRecordIdCard).toHaveBeenCalledWith(
            {
                libraryId: 'test',
                currentRecordId: '1234567890',
                avatarSize: 'l',
            },
            {},
        );
    });

    it('should display LibraryIdCard component when panel is type library', async () => {
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            panelType: 'libraryPanels',
            currentPanel: {
                id: '1',
                name: {
                    fr: 'un',
                },
                type: 'explorer',
                actions: [],
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader enabled />);

        expect(spyRetrievePanelDetails).toHaveBeenCalledTimes(1);
        expect(spyLibraryIdCard).toHaveBeenCalledTimes(1);
        expect(spyLibraryIdCard).toHaveBeenCalledWith(
            {
                libraryId: 'test',
                title: 'un',
                avatarSize: 'l',
            },
            {},
        );
    });

    it('should render nothing if component is not enabled', async () => {
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            panelType: 'libraryPanels',
            currentPanel: {
                id: '1',
                name: {
                    fr: 'un',
                },
                type: 'explorer',
                actions: [],
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        /**
         * Use render from React Testing Library directly to avoid LEAV injections as ANTD.
         * Useful to test that component render `null`
         * https://ploegert.gitbook.io/til/programmy/react-testing-library/check-that-a-component-renders-as-null
         */
        const {container} = renderRTL(
            <MockedLangContextProvider>
                <PanelHeader enabled={false} />
            </MockedLangContextProvider>,
        );

        expect(container.firstChild).toBeNull();
    });

    describe('Expand/Collapse Button', () => {
        it('should display ExpandCollapseCurrentPanelButton component and navigate to popup when clicked in slider', async () => {
            const mockNavigate = jest.fn();
            spyUseNavigate.mockReturnValue(mockNavigate);
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);
            spyGeneratePath.mockReturnValue('../../../1234567890/popup/panel123');

            const user = userEvent.setup();

            render(<PanelHeader enabled />);

            const expandButton = screen.getByRole('button', {name: /expand/i});
            expect(expandButton).toBeInTheDocument();

            await user.click(expandButton);

            expect(spyGeneratePath).toHaveBeenCalledWith('../../../:recordId/popup/:recordPanelId', {
                recordId: '1234567890',
                recordPanelId: 'panel123',
            });
            expect(mockNavigate).toHaveBeenCalledWith('../../../1234567890/popup/panel123', {relative: 'path'});
        });

        it('should display ExpandCollapseCurrentPanelButton component and navigate to slider when clicked in popup', async () => {
            const mockNavigate = jest.fn();
            spyUseNavigate.mockReturnValue(mockNavigate);
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'popup',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);
            spyGeneratePath.mockReturnValue('../../../1234567890/slider/panel123');

            const user = userEvent.setup();

            render(<PanelHeader enabled />);

            const collapseButton = screen.getByRole('button', {name: /collapse/i});
            expect(collapseButton).toBeInTheDocument();

            await user.click(collapseButton);

            expect(spyGeneratePath).toHaveBeenCalledWith('../../../:recordId/slider/:recordPanelId', {
                recordId: '1234567890',
                recordPanelId: 'panel123',
            });
            expect(mockNavigate).toHaveBeenCalledWith('../../../1234567890/slider/panel123', {relative: 'path'});
        });

        it('should not display ExpandCollapseCurrentPanelButton component when in fullpage', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'fullpage',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader enabled />);

            const expandButton = screen.queryByRole('button', {name: /expand/i});
            const collapseButton = screen.queryByRole('button', {name: /collapse/i});
            expect(expandButton).not.toBeInTheDocument();
            expect(collapseButton).not.toBeInTheDocument();
        });

        it('should not display ExpandCollapseCurrentPanelButton component when hideExpandCollapseButton is true', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader enabled hideExpandCollapseButton />);

            const expandButton = screen.queryByRole('button', {name: /expand/i});
            const collapseButton = screen.queryByRole('button', {name: /collapse/i});
            expect(expandButton).not.toBeInTheDocument();
            expect(collapseButton).not.toBeInTheDocument();
        });

        it('should not display ExpandCollapseCurrentPanelButton component when panel is a creation form', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'creation_panel',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'creation_panel',
                    type: 'creationForm',
                    formId: 'creation',
                    attributeSource: 'pac_campaigns_list',
                    name: {
                        en: 'Create',
                        fr: 'Créer une campagne',
                    },
                    isStandalone: true,
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader enabled />);

            const expandButton = screen.queryByRole('button', {name: /expand/i});
            const collapseButton = screen.queryByRole('button', {name: /collapse/i});
            expect(expandButton).not.toBeInTheDocument();
            expect(collapseButton).not.toBeInTheDocument();
        });
    });

    describe('Toggle Flap Buttons', () => {
        it('should display ToggleFlapButton components for record panels', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader enabled />);

            const informationButton = screen.queryByRole('button', {name: /information/i});
            const discussionButton = screen.queryByRole('button', {name: /discussion/i});
            expect(informationButton).toBeInTheDocument();
            expect(discussionButton).toBeInTheDocument();
        });

        it('should not display ToggleFlapButton components for library panels', async () => {
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                panelType: 'libraryPanels',
                currentPanel: {
                    id: '1',
                    name: {
                        fr: 'un',
                    },
                    type: 'explorer',
                    actions: [],
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader enabled />);

            const informationButton = screen.queryByRole('button', {name: /information/i});
            const discussionButton = screen.queryByRole('button', {name: /discussion/i});
            expect(informationButton).not.toBeInTheDocument();
            expect(discussionButton).not.toBeInTheDocument();
        });

        it('should not display ToggleFlapButton components for creation form panels', async () => {
            spyUseParams.mockReturnValue({
                recordId: 'newRecord',
                recordPanelId: 'creation_panel',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'campaigns',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'creation_panel',
                    type: 'creationForm',
                    formId: 'creation',
                    attributeSource: 'pac_campaigns_list',
                    name: {
                        en: 'Create',
                        fr: 'Créer une campagne',
                    },
                    isStandalone: true,
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader enabled />);

            const informationButton = screen.queryByRole('button', {name: /information/i});
            const discussionButton = screen.queryByRole('button', {name: /discussion/i});
            const expandButton = screen.queryByRole('button', {name: /expand/i});
            expect(informationButton).not.toBeInTheDocument();
            expect(discussionButton).not.toBeInTheDocument();
            expect(expandButton).not.toBeInTheDocument();
        });
    });
});
