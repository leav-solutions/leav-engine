import * as ReactRouter from 'react-router-dom';
import {renderHook} from '_ui/_tests/testUtils';
import * as gqlTypes from '_ui/_gqlTypes';
import {useLastUsedView} from '../useLastUsedView';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({})),
}));

jest.mock('../../../../../../../constants', () => ({
    APP_ENDPOINT: 'APPLICATION_ENDPOINT',
}));

describe('useLastUsedView', () => {
    const panelId = 'panel-products';
    const lastUsedViewId = 'view-42';
    const userDataKey = `last_used_view_APPLICATION_ENDPOINT_${panelId}`;

    const spyOnUseParams = jest.spyOn(ReactRouter, 'useParams');
    const spyOnUseGetUserDataQuery = jest.spyOn(gqlTypes, 'useGetUserDataQuery');
    const spyOnUseSaveUserDataMutation = jest.spyOn(gqlTypes, 'useSaveUserDataMutation');

    beforeEach(() => {
        spyOnUseParams.mockReturnValue({panelId});
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

    it('should save the selected view id to user data', () => {
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
