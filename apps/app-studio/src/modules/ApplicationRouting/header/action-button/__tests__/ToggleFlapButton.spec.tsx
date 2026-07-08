import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {matomo} from '../../../../../services/analytics';
import {type Application} from '../../../types';
import {ToggleFlapButton} from '../ToggleFlapButton';
import {FLAP_INFO_AND_HISTORY_PANEL_ID, FLAP_THREAD_PANEL_ID} from '../../../../../constants';
import {matomoEvents} from '../../../../../services/analytics/constants/matomoEvents';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: vi.fn(),
    useParams: vi.fn(),
}));

vi.mock('../../../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('../../../../../services/analytics', async () => ({
    ...(await vi.importActual('../../../../../services/analytics')),
    matomo: {trackNavigationEvent: vi.fn()},
}));

describe('ToggleFlapButton', () => {
    const spyUseNavigate = vi.spyOn(ReactRouter, 'useNavigate');
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');

    const applicationWithTrackingLabel: Application = {
        workspaces: [],
        libraries: {map: {libraryPanels: [], recordPanels: []}},
    };

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        vi.clearAllMocks();
        user = userEvent.setup();
        spyUseNavigate.mockReturnValue(vi.fn());
        spyUseParams.mockReturnValue({});
        spyUseApplicationSettingsContext.mockReturnValue([applicationWithTrackingLabel] as any);
    });

    it('tracks a History Panel Opened event with the library trackingLabel when opening info-history', async () => {
        render(
            <ToggleFlapButton
                targetFlapPanelId={FLAP_INFO_AND_HISTORY_PANEL_ID}
                targetRecordId="1"
                targetLibraryId="map"
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(matomo.trackNavigationEvent).toHaveBeenCalledWith(matomoEvents.actions.history_panel_opened, 'map');
    });

    it('does not track when the target flap is the thread panel', async () => {
        render(<ToggleFlapButton targetFlapPanelId={FLAP_THREAD_PANEL_ID} targetRecordId="1" targetLibraryId="map" />);

        await user.click(screen.getByRole('button'));

        expect(matomo.trackNavigationEvent).not.toHaveBeenCalled();
    });
});
