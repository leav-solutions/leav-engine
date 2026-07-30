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
vi.mock('../ViewSettingsContainer', () => ({ViewSettingsContainer: () => <div>volet</div>}));
vi.mock('../content/panel-view-settings/store-current-view/CurrentViewStoreProvider', () => ({
    CurrentViewStoreProvider: ({children}: {children: React.ReactNode}) => children,
}));

describe('Panel view settings volet in slider (LEAVC-1089)', () => {
    const application = {
        workspaces: [{id: 'ws', type: 'library', libraryId: 'pac'}],
        enableViewSettings: true,
        libraries: {
            pac: {
                libraryPanels: [],
                recordPanels: [
                    {
                        id: 'linked',
                        type: 'explorer',
                        name: {fr: 'Linked', en: 'Linked'},
                        isViewSettingsActive: true,
                        selectedTab: 'display',
                    },
                    {
                        id: 'linked-inactive',
                        type: 'explorer',
                        name: {fr: 'Linked', en: 'Linked'},
                        isViewSettingsActive: false,
                    },
                ],
            },
        },
    } as unknown as Application;

    let hosts: HTMLElement[] = [];

    const baseParams = {
        workspaceId: 'ws',
        panelId: 'pac',
        recordId: '1',
        recordPanelId: 'linked',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        hosts = [];
        (ReactRouter.useRoutes as Mock).mockReturnValue(null);
        (ReactRouter.useMatch as Mock).mockReturnValue(null);
        (ApplicationSettingsContext.useApplicationSettingsContext as Mock).mockReturnValue([application, vi.fn()]);
        (useFullscreenHook.useFullscreen as Mock).mockReturnValue({
            fullscreenPanelId: null,
            enterFullscreen: vi.fn(),
            exitFullscreen: vi.fn(),
        });
    });

    afterEach(() => {
        hosts.forEach(host => host.remove());
    });

    // A detached host receives the portal fine, but `screen.getByText` only queries `document.body`.
    const createAttachedHost = () => {
        const host = document.body.appendChild(document.createElement('div'));
        hosts.push(host);
        return host;
    };

    it('renders the volet in a slider once the host is published (regression)', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({...baseParams, where: 'slider'});
        const host = createAttachedHost();

        render(<Panel sliderVoletHostElement={host} />);

        expect(screen.getByText('volet')).toBeInTheDocument();
    });

    it('renders nothing in a slider while the host is not yet published', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({...baseParams, where: 'slider'});

        render(<Panel sliderVoletHostElement={null} />);

        expect(screen.queryByText('volet')).not.toBeInTheDocument();
    });

    it('does not render the volet in a slider when a next-level panel is open', () => {
        (ReactRouter.useRoutes as Mock).mockReturnValue(<div>next level</div>);
        (ReactRouter.useParams as Mock).mockReturnValue({...baseParams, where: 'slider'});
        const host = createAttachedHost();

        render(<Panel sliderVoletHostElement={host} />);

        expect(screen.queryByText('volet')).not.toBeInTheDocument();
    });

    it('renders the volet in a popup regardless of the slider host (non-regression)', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({...baseParams, where: 'popup'});

        render(<Panel />);

        expect(screen.getByText('volet')).toBeInTheDocument();
    });

    it('does not render the volet when it is not active', () => {
        (ReactRouter.useParams as Mock).mockReturnValue({
            ...baseParams,
            recordPanelId: 'linked-inactive',
            where: 'slider',
        });
        const host = createAttachedHost();

        render(<Panel sliderVoletHostElement={host} />);

        expect(screen.queryByText('volet')).not.toBeInTheDocument();
    });
});
