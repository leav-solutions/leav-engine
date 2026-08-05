import {render} from '_ui/_tests/testUtils';
import * as ReactRouter from 'react-router-dom';
import {PanelCustomCreation} from '../PanelCustomCreation';
import {PanelCustom} from '../PanelCustom';
import {RelativePaths} from '../../../router/paths';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
}));

vi.mock('../PanelCustom', () => ({
    PanelCustom: vi.fn(() => null),
}));

describe('PanelCustomCreation', () => {
    const spyUseNavigate = vi.spyOn(ReactRouter, 'useNavigate');
    const spyUseSearchParams = vi.spyOn(ReactRouter, 'useSearchParams');
    const navigateMock = vi.fn();

    const getPanelCustomProps = () => (PanelCustom as ReturnType<typeof vi.fn>).mock.calls[0][0];

    beforeEach(() => {
        vi.clearAllMocks();
        spyUseNavigate.mockReturnValue(navigateMock);
        spyUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    });

    it('renders the iframe panel without a recordId (top-level creation)', () => {
        render(<PanelCustomCreation source="https://host/creation-flow" title="create-custom" />);

        expect(getPanelCustomProps()).toMatchObject({
            source: 'https://host/creation-flow',
            title: 'create-custom',
            recordId: null,
        });
    });

    it('forwards the formInitialValues query param as-is to the iframe URL', () => {
        // the host route carries initial values, set by a navigate-to-panel message
        const initialValues = JSON.stringify({linked_attribute: ['42']});
        spyUseSearchParams.mockReturnValue([new URLSearchParams({formInitialValues: initialValues}), vi.fn()]);

        render(<PanelCustomCreation source="https://host/creation-flow" title="create-custom" />);

        expect(getPanelCustomProps().source).toBe(
            `https://host/creation-flow?${new URLSearchParams({formInitialValues: initialValues}).toString()}`,
        );
    });

    it('appends formInitialValues with & when the configured source already has a query string', () => {
        spyUseSearchParams.mockReturnValue([new URLSearchParams({formInitialValues: '{}'}), vi.fn()]);

        render(<PanelCustomCreation source="https://host/creation-flow?mode=quick" title="create-custom" />);

        expect(getPanelCustomProps().source).toBe(
            `https://host/creation-flow?mode=quick&${new URLSearchParams({formInitialValues: '{}'}).toString()}`,
        );
    });

    it('closes the panel when the iframe notifies that its record was created', () => {
        // panel open, iframe mounted with the record-created handler
        render(<PanelCustomCreation source="https://host/creation-flow" title="create-custom" />);

        // the iframe sends record-created (relayed by PanelCustom as onRecordCreated)
        getPanelCustomProps().onRecordCreated({recordId: '42'});

        // the host closes the creation panel — no manual refresh, the explorer's
        // library-wide subscription picks the new record up by itself
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith(RelativePaths.closeCurrentPanel, {relative: 'path'});
    });
});
