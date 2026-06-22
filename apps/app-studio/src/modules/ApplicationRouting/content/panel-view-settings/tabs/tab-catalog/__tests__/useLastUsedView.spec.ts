import * as ReactRouter from 'react-router-dom';
import {renderHook} from '_ui/_tests/testUtils';
import * as gqlTypes from '_ui/_gqlTypes';
import * as ApplicationSettingsContext from '../../../../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import * as RetrievePanelDetails from '../../../../../utils/retrievePanelDetails';
import {useLastUsedView} from '../useLastUsedView';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({})),
}));

jest.mock('../../../../../../../constants', () => ({
    APP_ENDPOINT: 'APPLICATION_ENDPOINT',
}));

jest.mock(
    '../../../../../../../config/application-instance/application-settings/useApplicationSettingsContext',
    () => ({
        useApplicationSettingsContext: jest.fn(),
    }),
);

jest.mock('../../../../../utils/retrievePanelDetails', () => ({
    retrievePanelDetails: jest.fn(),
}));

describe('useLastUsedView', () => {
    const panelId = 'panel-products';
    const displayedLibraryId = 'products';
    const lastUsedViewId = 'view-42';
    // The memory is scoped by the DISPLAYED library AND the panel id, so a record-panel link explorer
    // can't resurface a view id belonging to the parent (owner) library.
    const userDataKey = `last_used_view_APPLICATION_ENDPOINT_${displayedLibraryId}_${panelId}`;

    const spyOnUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyOnUseGetUserDataQuery = jest.spyOn(gqlTypes, 'useGetUserDataQuery');
    const spyOnUseSaveUserDataMutation = jest.spyOn(gqlTypes, 'useSaveUserDataMutation');
    const spyUseApplicationSettingsContext = jest.spyOn(ApplicationSettingsContext, 'useApplicationSettingsContext');
    const spyRetrievePanelDetails = jest.spyOn(RetrievePanelDetails, 'retrievePanelDetails');

    beforeEach(() => {
        spyOnUseParams.mockReturnValue({panelId});
        spyUseApplicationSettingsContext.mockReturnValue([{} as any, jest.fn()]);
        spyRetrievePanelDetails.mockReturnValue({displayedLibraryId} as any);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should return the last used view id from user data', () => {
        spyOnUseGetUserDataQuery.mockReturnValue({
            data: {userData: {data: {[userDataKey]: lastUsedViewId}}},
        } as any);
        spyOnUseSaveUserDataMutation.mockReturnValue([jest.fn(), {} as any]);

        const {result} = renderHook(() => useLastUsedView());

        expect(result.current.lastUsedViewId).toBe(lastUsedViewId);
    });

    it('should save the selected view id under a key scoped by displayed library and panel', () => {
        const saveMutation = jest.fn();
        spyOnUseSaveUserDataMutation.mockReturnValue([saveMutation, {} as any]);
        spyOnUseGetUserDataQuery.mockReturnValue({data: undefined} as any);

        const {result} = renderHook(() => useLastUsedView());
        result.current.saveLastUsedView('view-1');

        expect(saveMutation).toHaveBeenCalledWith({
            variables: {
                key: userDataKey,
                value: 'view-1',
                global: false,
            },
        });
    });
});
