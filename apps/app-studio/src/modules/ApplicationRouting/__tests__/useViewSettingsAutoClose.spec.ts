import {renderHook} from '@testing-library/react';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import * as RetrievePanelDetails from '../utils/retrievePanelDetails';
import {type Application} from '../types';
import {useViewSettingsAutoClose} from '../useViewSettingsAutoClose';

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useParams: vi.fn(),
}));

vi.mock('../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: vi.fn(),
}));

vi.mock('../utils/retrievePanelDetails', () => ({
    retrievePanelDetails: vi.fn(),
}));

describe('useViewSettingsAutoClose', () => {
    const spyUseParams = vi.spyOn(ReactRouter, 'useParams');
    const spyUseApplicationSettingsContext = vi.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = vi.spyOn(RetrievePanelDetails, 'retrievePanelDetails');
    const mockSetApplication = vi.fn();

    const recordPanelId = 'rp';

    const application: Application = {
        workspaces: [{id: 'ws', icon: 'fa-layer-group', type: 'library', libraryId: 'lib'}],
        libraries: {},
    };

    const explorerWithActiveVolet = {
        id: recordPanelId,
        name: {fr: 'Explorateur', en: 'Explorer'},
        type: 'explorer' as const,
        isViewSettingsActive: true,
        actions: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        spyUseParams.mockReturnValue({panelId: 'p', recordPanelId});
        spyUseApplicationSettingsContext.mockReturnValue([application, mockSetApplication] as any);
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: explorerWithActiveVolet,
            libraryId: 'lib',
            displayedLibraryId: 'lib',
            panelType: 'recordPanels',
        });
    });

    it('should not reset the volet when the explorer is in the foreground', () => {
        renderHook(() => useViewSettingsAutoClose(false));

        expect(mockSetApplication).not.toHaveBeenCalled();
    });

    it('should reset the volet when a next-level panel opens', () => {
        renderHook(() => useViewSettingsAutoClose(true));

        expect(mockSetApplication).toHaveBeenCalled();
    });

    it('should not reset the volet when it is already closed and a next-level panel opens', () => {
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {...explorerWithActiveVolet, isViewSettingsActive: false},
            libraryId: 'lib',
            displayedLibraryId: 'lib',
            panelType: 'recordPanels',
        });

        renderHook(() => useViewSettingsAutoClose(true));

        expect(mockSetApplication).not.toHaveBeenCalled();
    });

    it('should reset the volet when a flap opens over it', () => {
        const {rerender} = renderHook(() => useViewSettingsAutoClose(false));
        expect(mockSetApplication).not.toHaveBeenCalled();

        spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, flapPanelId: 'fp'});
        rerender();

        expect(mockSetApplication).toHaveBeenCalled();
    });

    it('should not reset the volet when the flap is already open and the volet opens', () => {
        spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, flapPanelId: 'fp'});
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {...explorerWithActiveVolet, isViewSettingsActive: false},
            libraryId: 'lib',
            displayedLibraryId: 'lib',
            panelType: 'recordPanels',
        });
        const {rerender} = renderHook(() => useViewSettingsAutoClose(false));

        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: explorerWithActiveVolet,
            libraryId: 'lib',
            displayedLibraryId: 'lib',
            panelType: 'recordPanels',
        });
        rerender();

        expect(mockSetApplication).not.toHaveBeenCalled();
    });

    it('should not reset the volet when a flap is already open from the start', () => {
        spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, flapPanelId: 'fp'});

        renderHook(() => useViewSettingsAutoClose(false));

        expect(mockSetApplication).not.toHaveBeenCalled();
    });

    it('should reset the leaving panel when the current panel changes', () => {
        const {rerender} = renderHook(() => useViewSettingsAutoClose(false));
        expect(mockSetApplication).not.toHaveBeenCalled();

        // Navigate to a different panel: the previous panel's cleanup must reset its volet state so
        // it does not reopen on return.
        spyRetrievePanelDetails.mockReturnValue({
            currentPanel: {...explorerWithActiveVolet, id: 'other-panel'},
            libraryId: 'lib',
            displayedLibraryId: 'lib',
            panelType: 'recordPanels',
        });
        rerender();

        expect(mockSetApplication).toHaveBeenCalled();
    });

    it('should reset the leaving panel on unmount when the volet is active', () => {
        const {unmount} = renderHook(() => useViewSettingsAutoClose(false));
        expect(mockSetApplication).not.toHaveBeenCalled();

        unmount();

        expect(mockSetApplication).toHaveBeenCalled();
    });

    describe('in a slider', () => {
        it('should not reset the volet when active in a slider with no next-level panel nor flap', () => {
            spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, where: 'slider'});

            renderHook(() => useViewSettingsAutoClose(false));

            expect(mockSetApplication).not.toHaveBeenCalled();
        });

        it('should reset the volet when a flap opens over it in a slider', () => {
            spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, where: 'slider'});
            const {rerender} = renderHook(() => useViewSettingsAutoClose(false));
            expect(mockSetApplication).not.toHaveBeenCalled();

            spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, where: 'slider', flapPanelId: 'fp'});
            rerender();

            expect(mockSetApplication).toHaveBeenCalled();
        });

        it('should reset the volet when a next-level panel opens in a slider', () => {
            spyUseParams.mockReturnValue({panelId: 'p', recordPanelId, where: 'slider'});

            renderHook(() => useViewSettingsAutoClose(true));

            expect(mockSetApplication).toHaveBeenCalled();
        });
    });
});
