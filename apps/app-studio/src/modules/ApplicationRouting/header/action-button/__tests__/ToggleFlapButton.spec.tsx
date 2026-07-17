import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import * as ReactRouter from 'react-router-dom';
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

vi.mock('../../../../../services/analytics', async () => ({
    ...(await vi.importActual('../../../../../services/analytics')),
    matomo: {trackNavigationEvent: vi.fn(), trackInteractionEvent: vi.fn()},
}));

const campaignPanel = {
    id: 'campaigns',
    type: 'explorer',
    name: {fr: 'Campagnes'},
    actions: [],
} as Application['libraries'][string]['libraryPanels'][number];

describe('ToggleFlapButton', () => {
    const spyUseNavigate = vi.spyOn(ReactRouter, 'useNavigate');
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        vi.clearAllMocks();
        user = userEvent.setup();
        spyUseNavigate.mockReturnValue(vi.fn());
        spyUseParams.mockReturnValue({});
    });

    it('tracks a History Panel Opened event with the library id when opening info-history', async () => {
        render(
            <ToggleFlapButton
                targetFlapPanelId={FLAP_INFO_AND_HISTORY_PANEL_ID}
                targetRecordId="1"
                targetLibraryId="map"
                currentPanel={campaignPanel}
                lang={['fr']}
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(matomo.trackNavigationEvent).toHaveBeenCalledWith(matomoEvents.actions.history_panel_opened, 'map');
    });

    it('does not track a navigation event when the target flap is the thread panel', async () => {
        render(
            <ToggleFlapButton
                targetFlapPanelId={FLAP_THREAD_PANEL_ID}
                targetRecordId="1"
                targetLibraryId="map"
                currentPanel={campaignPanel}
                lang={['fr']}
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(matomo.trackNavigationEvent).not.toHaveBeenCalled();
    });
});

describe('ToggleFlapButton — comments tracking', () => {
    const spyUseNavigate = vi.spyOn(ReactRouter, 'useNavigate');
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        vi.clearAllMocks();
        user = userEvent.setup();
        spyUseNavigate.mockReturnValue(vi.fn());
        spyUseParams.mockReturnValue({});
    });

    it('should emit comments_panel_opened with the current panel and lang when opening the thread flap', async () => {
        render(
            <ToggleFlapButton
                targetFlapPanelId={FLAP_THREAD_PANEL_ID}
                targetRecordId="rec1"
                targetLibraryId="campaignLib"
                currentPanel={campaignPanel}
                lang={['fr']}
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(matomo.trackInteractionEvent).toHaveBeenCalledWith(
            matomoEvents.actions.comments_panel_opened,
            expect.objectContaining({id: 'campaigns', type: 'explorer'}),
            ['fr'],
        );
    });

    it('should not emit comments_panel_opened when opening the info-history flap', async () => {
        render(
            <ToggleFlapButton
                targetFlapPanelId={FLAP_INFO_AND_HISTORY_PANEL_ID}
                targetRecordId="rec1"
                targetLibraryId="campaignLib"
                currentPanel={campaignPanel}
                lang={['fr']}
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(matomo.trackInteractionEvent).not.toHaveBeenCalled();
    });

    it('should not emit comments_panel_opened when the thread flap is already open', async () => {
        spyUseParams.mockReturnValue({
            flapRecordId: 'rec1',
            flapLibraryId: 'campaignLib',
            flapPanelId: FLAP_THREAD_PANEL_ID,
        });

        render(
            <ToggleFlapButton
                targetFlapPanelId={FLAP_THREAD_PANEL_ID}
                targetRecordId="rec1"
                targetLibraryId="campaignLib"
                currentPanel={campaignPanel}
                lang={['fr']}
            />,
        );

        await user.click(screen.getByRole('button'));

        expect(matomo.trackInteractionEvent).not.toHaveBeenCalled();
    });
});
