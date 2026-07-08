import {render, screen} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as Utils from '../../utils/retrievePanelDetails';
import * as LibraryIdCardComponent from '../id-card/LibraryIdCard';
import * as RecordIdCardComponent from '../id-card/RecordIdCard';
import * as ApplicationSettingsContext from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type Application} from '../../types';
import {PanelHeader} from '../PanelHeader';

vi.mock('../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useParams: vi.fn(),
}));

vi.mock('../id-card/LibraryIdCard', () => ({
    LibraryIdCard: vi.fn(),
}));

vi.mock('../id-card/RecordIdCard', () => ({
    RecordIdCard: vi.fn(),
}));

vi.mock('../tabs/PanelsTabs', () => ({
    PanelsTabs: vi.fn(),
}));

describe('PanelHeader', () => {
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyLibraryIdCard = vi.spyOn(LibraryIdCardComponent, 'LibraryIdCard');
    const spyRecordIdCard = vi.spyOn(RecordIdCardComponent, 'RecordIdCard');
    const spyRetrievePanelDetails = vi.spyOn(Utils, 'retrievePanelDetails');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const emptyApplication: Application = {
        workspaces: [],
        libraries: {},
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should display RecordIdCard component when panel is type record', async () => {
        spyUseParams.mockReturnValue({recordId: '1234567890'});
        spyRetrievePanelDetails.mockReturnValue({
            libraryId: 'test',
            displayedLibraryId: 'test',
            panelType: 'recordPanels',
            currentPanel: {
                id: 'panel1',
                type: 'editionForm',
                formId: 'edition',
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader />);

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
            displayedLibraryId: 'test',
            panelType: 'recordPanels',
            currentPanel: {
                id: 'panel1',
                type: 'editionForm',
                formId: 'edition',
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader currentRecordId="1234567890" />);

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
            displayedLibraryId: 'test',
            panelType: 'libraryPanels',
            currentPanel: {
                id: '1',
                name: {
                    fr: 'un',
                },
                type: 'explorer',
                isViewSettingsActive: false,
                actions: [],
            },
        });
        spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

        render(<PanelHeader />);

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

    describe('PanelDisplayModeSelector', () => {
        it('should display PanelDisplayModeSelector when in slider mode', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                displayedLibraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader />);

            const displayModeButton = screen.getByRole('button', {name: /display_mode.select_display/i});
            expect(displayModeButton).toBeInTheDocument();
        });

        it('should display PanelDisplayModeSelector when in popup mode', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'popup',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                displayedLibraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader />);

            const displayModeButton = screen.getByRole('button', {name: /display_mode.select_display/i});
            expect(displayModeButton).toBeInTheDocument();
        });

        it('should display PanelDisplayModeSelector when in fullpage mode', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'fullpage',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                displayedLibraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader />);

            const displayModeButton = screen.getByRole('button', {name: /display_mode.select_display/i});
            expect(displayModeButton).toBeInTheDocument();
        });

        it('should not display PanelDisplayModeSelector when on first panel (where is undefined)', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                displayedLibraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader />);

            const displayModeButton = screen.queryByRole('button', {name: /display_mode.select_display/i});
            expect(displayModeButton).not.toBeInTheDocument();
        });

        it('should not display PanelDisplayModeSelector when hidePanelDisplayModeSelector is true', async () => {
            spyUseParams.mockReturnValue({
                recordId: '1234567890',
                recordPanelId: 'panel123',
                where: 'slider',
            });
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                displayedLibraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader hidePanelDisplayModeSelector />);

            const displayModeButton = screen.queryByRole('button', {name: /display_mode.select_display/i});
            expect(displayModeButton).not.toBeInTheDocument();
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
                displayedLibraryId: 'test',
                panelType: 'recordPanels',
                currentPanel: {
                    id: 'panel123',
                    type: 'editionForm',
                    formId: 'edition',
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader />);

            const informationButton = screen.queryByRole('button', {name: /information/i});
            const discussionButton = screen.queryByRole('button', {name: /discussion/i});
            expect(informationButton).toBeInTheDocument();
            expect(discussionButton).toBeInTheDocument();
        });

        it('should not display ToggleFlapButton components for library panels', async () => {
            spyRetrievePanelDetails.mockReturnValue({
                libraryId: 'test',
                displayedLibraryId: 'test',
                panelType: 'libraryPanels',
                currentPanel: {
                    id: '1',
                    name: {
                        fr: 'un',
                    },
                    type: 'explorer',
                    isViewSettingsActive: false,
                    actions: [],
                },
            });
            spyUseApplicationSettingsContext.mockReturnValue([emptyApplication] as any);

            render(<PanelHeader />);

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
                displayedLibraryId: 'campaigns',
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

            render(<PanelHeader />);

            const informationButton = screen.queryByRole('button', {name: /information/i});
            const discussionButton = screen.queryByRole('button', {name: /discussion/i});
            const displayModeButton = screen.queryByRole('button', {name: /display_mode.select_display/i});
            expect(informationButton).not.toBeInTheDocument();
            expect(discussionButton).not.toBeInTheDocument();
            expect(displayModeButton).not.toBeInTheDocument();
        });
    });
});
