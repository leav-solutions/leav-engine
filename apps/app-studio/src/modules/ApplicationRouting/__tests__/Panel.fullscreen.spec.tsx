import {render, screen} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import * as useFullscreenHook from '../../../hooks/useFullscreen';
import {type Application} from '../types';
import {Panel} from '../Panel';
import {type Mock} from 'vitest';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useParams: vi.fn(),
    useMatch: vi.fn().mockReturnValue(null),
    useRoutes: vi.fn().mockReturnValue(null),
}));
vi.mock('../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));
vi.mock('../../../hooks/useFullscreen', () => ({useFullscreen: vi.fn()}));
vi.mock('../content/PanelContent', () => ({PanelContent: () => <div>content</div>}));

describe('Panel fullscreen', () => {
    const application = {
        workspaces: [{id: 'ws', type: 'record', libraryId: 'pac', recordId: '1'}],
        libraries: {
            pac: {
                libraryPanels: [],
                recordPanels: [
                    {id: 'planning', type: 'custom', name: {fr: 'Planning', en: 'Planning'}},
                    {id: 'other', type: 'custom', name: {fr: 'Other', en: 'Other'}},
                ],
            },
        },
    } as unknown as Application;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (ReactRouter.useRoutes as Mock).mockReturnValue(null);
        (ReactRouter.useMatch as Mock).mockReturnValue(null);
        (ApplicationSettingsContext.useApplicationSettingsContext as Mock).mockReturnValue([application]);
        (useFullscreenHook.useFullscreen as Mock).mockReturnValue({
            fullscreenPanelId: null,
            enterFullscreen: vi.fn(),
            exitFullscreen: vi.fn(),
        });
    });

    it('should render the toggle button on a record panel', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'planning',
        });
        render(<Panel />);
        expect(screen.getByRole('button', {name: 'fullscreen.enter'})).toBeInTheDocument();
    });

    it('should render the toggle button on any panel (available everywhere)', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'other',
        });
        render(<Panel />);
        expect(screen.getByRole('button', {name: 'fullscreen.enter'})).toBeInTheDocument();
    });

    it('should not render the toggle button when the panel is in a slider', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'slider',
            recordPanelId: 'planning',
        });
        render(<Panel />);
        expect(screen.queryByRole('button', {name: 'fullscreen.enter'})).not.toBeInTheDocument();
    });

    it('should not render the toggle button when a fullpage next-level panel replaces it', () => {
        (ReactRouter.useRoutes as Mock).mockReturnValue(<div>next level</div>);
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'planning',
            '*': '2/fullpage/other',
        });
        render(<Panel />);
        expect(screen.queryByRole('button', {name: 'fullscreen.enter'})).not.toBeInTheDocument();
    });

    it('should keep the toggle button when a slider overlay is open over it', () => {
        (ReactRouter.useRoutes as Mock).mockReturnValue(<div>next level</div>);
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'planning',
            '*': '2/slider/other',
        });
        render(<Panel />);
        expect(screen.getByRole('button', {name: 'fullscreen.enter'})).toBeInTheDocument();
    });

    it('should keep the toggle button when a popup overlay is open over it', () => {
        (ReactRouter.useRoutes as Mock).mockReturnValue(<div>next level</div>);
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'planning',
            '*': '2/popup/other',
        });
        render(<Panel />);
        expect(screen.getByRole('button', {name: 'fullscreen.enter'})).toBeInTheDocument();
    });

    it('should render the toggle button on a popup when no panel is fullscreen', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'popup',
            recordPanelId: 'other',
        });
        render(<Panel />);
        expect(screen.getByRole('button', {name: 'fullscreen.enter'})).toBeInTheDocument();
    });

    it('should not render the toggle button on a popup while another panel is fullscreen', () => {
        (useFullscreenHook.useFullscreen as Mock).mockReturnValue({
            fullscreenPanelId: 'planning',
            enterFullscreen: vi.fn(),
            exitFullscreen: vi.fn(),
        });
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'popup',
            recordPanelId: 'other',
        });
        render(<Panel />);
        expect(screen.queryByRole('button', {name: 'fullscreen.enter'})).not.toBeInTheDocument();
    });

    it('should show the alert when its panel is fullscreen and not dismissed', () => {
        (useFullscreenHook.useFullscreen as Mock).mockReturnValue({
            fullscreenPanelId: 'planning',
            enterFullscreen: vi.fn(),
            exitFullscreen: vi.fn(),
        });
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'planning',
        });
        render(<Panel />);
        expect(screen.getByText('fullscreen.alert_title')).toBeInTheDocument();
    });

    it('should hide the alert when already dismissed', () => {
        localStorage.setItem('fullscreenAlertDismissed', 'true');
        (useFullscreenHook.useFullscreen as Mock).mockReturnValue({
            fullscreenPanelId: 'planning',
            enterFullscreen: vi.fn(),
            exitFullscreen: vi.fn(),
        });
        (ReactRouter.useParams as Mock).mockReturnValue({
            workspaceId: 'ws',
            panelId: 'pac',
            recordId: '1',
            where: 'fullpage',
            recordPanelId: 'planning',
        });
        render(<Panel />);
        expect(screen.queryByText('fullscreen.alert_title')).not.toBeInTheDocument();
    });
});
