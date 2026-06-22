import {renderHook} from '@testing-library/react';
import * as ReactRouter from 'react-router-dom';
import * as ApplicationSettingsContext from '../../../config/application-instance/application-settings/useApplicationSettingsContext';
import * as RetrievePanelDetails from '../utils/retrievePanelDetails';
import {type Application} from '../types';
import {useViewSettingsAutoClose} from '../useViewSettingsAutoClose';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}));

jest.mock('../../../config/application-instance/application-settings/useApplicationSettingsContext', () => ({
    useApplicationSettingsContext: jest.fn(),
}));

jest.mock('../utils/retrievePanelDetails', () => ({
    retrievePanelDetails: jest.fn(),
}));

describe('useViewSettingsAutoClose', () => {
    const spyUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = jest.spyOn(RetrievePanelDetails, 'retrievePanelDetails');
    const mockSetApplication = jest.fn();

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
        jest.clearAllMocks();
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
});
