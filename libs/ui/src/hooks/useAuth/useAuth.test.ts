// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useAuth from './useAuth';
import {renderHook} from '_ui/_tests/testUtils';

const fetchMock = jest.fn();
global.fetch = fetchMock;

jest.mock('_ui/constants', () => ({
    GLOBAL_BASE_URL: '/global-base',
}));

describe('useAuth', () => {
    const {location} = window;
    const mockLocation: Location = {...location, reload: jest.fn(), assign: jest.fn()};

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: mockLocation,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore original window.location after tests
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: location,
        });
    });

    it('should reload page on empty logout', async () => {
        const {result} = renderHook(() => useAuth());
        fetchMock.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({}),
        });

        await result.current.logout();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/global-base/auth/logout', {method: 'POST'});
        expect(mockLocation.assign).not.toHaveBeenCalled();
        expect(mockLocation.reload).toHaveBeenCalledTimes(1);
        expect(mockLocation.reload).toHaveBeenCalledWith();
    });

    it('Should go to redirectUrl if present in response logout', async () => {
        const {result} = renderHook(() => useAuth());
        fetchMock.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({
                redirectUrl: 'redirectUrl',
            }),
        });

        await result.current.logout();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/global-base/auth/logout', {method: 'POST'});
        expect(mockLocation.assign).toHaveBeenCalledTimes(1);
        expect(mockLocation.assign).toHaveBeenCalledWith('redirectUrl');
        expect(mockLocation.reload).not.toHaveBeenCalled();
    });
});
