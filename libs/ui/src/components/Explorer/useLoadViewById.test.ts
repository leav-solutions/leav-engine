import {renderHook} from '_ui/_tests/testUtils';
import {useLoadViewById} from './useLoadViewById';
import {useLoadView} from './useLoadView';
import {viewSettingsInitialState} from './manage-view-settings/store-view-settings/viewSettingsInitialState';

jest.mock('./useLoadView');

describe('useLoadViewById', () => {
    const loadViewMock = jest.fn();

    beforeEach(() => {
        loadViewMock.mockReset();
        (useLoadView as jest.Mock).mockReturnValue({loadView: loadViewMock});
    });

    test('should call loadView when loadedViewId differs from view.viewId', () => {
        renderHook(() =>
            useLoadViewById({
                loadedViewId: 'other',
                isLoading: false,
                view: {...viewSettingsInitialState, viewId: 'current'},
                viewSettingsDispatch: jest.fn(),
                filtersDispatch: jest.fn(),
            }),
        );

        expect(loadViewMock).toHaveBeenCalledWith('other');
    });

    test('should not call loadView when loadedViewId matches view.viewId', () => {
        renderHook(() =>
            useLoadViewById({
                loadedViewId: 'same',
                isLoading: false,
                view: {...viewSettingsInitialState, viewId: 'same'},
                viewSettingsDispatch: jest.fn(),
                filtersDispatch: jest.fn(),
            }),
        );

        expect(loadViewMock).not.toHaveBeenCalled();
    });

    test('should not call loadView while isLoading is true', () => {
        renderHook(() =>
            useLoadViewById({
                loadedViewId: 'other',
                isLoading: true,
                view: {...viewSettingsInitialState, viewId: 'current'},
                viewSettingsDispatch: jest.fn(),
                filtersDispatch: jest.fn(),
            }),
        );

        expect(loadViewMock).not.toHaveBeenCalled();
    });

    test('should not call loadView when loadedViewId is undefined', () => {
        renderHook(() =>
            useLoadViewById({
                loadedViewId: undefined,
                isLoading: false,
                view: {...viewSettingsInitialState, viewId: 'current'},
                viewSettingsDispatch: jest.fn(),
                filtersDispatch: jest.fn(),
            }),
        );

        expect(loadViewMock).not.toHaveBeenCalled();
    });
});
