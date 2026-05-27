import {act, renderHook} from '@testing-library/react';
import * as useQueryParams from '../useQueryParams';
import useRedirectToDest from './useRedirectToDest';

vi.mock('react-router-dom', () => ({
    useQueryParams: vi.fn(),
}));

describe('useRedirectToDest', () => {
    const replaceMock = vi.fn();
    const mockLocation: Location = {...location, replace: replaceMock, search: ''};

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: mockLocation,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        // Restore original window.location after tests
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: location,
        });
    });

    it('should redirect to the destination when it is present in the query params', () => {
        const dest = encodeURIComponent('/dashboard?query=1&params=2');
        vi.spyOn(useQueryParams, 'useQueryParams').mockReturnValue({dest});

        const {result} = renderHook(() => useRedirectToDest());

        act(() => {
            result.current.redirectToDest();
        });

        expect(replaceMock).toHaveBeenCalledWith('/dashboard?query=1&params=2');
    });

    it('should redirect to the default destination when it is not present in the query params', () => {
        vi.spyOn(useQueryParams, 'useQueryParams').mockReturnValue({});
        const {result} = renderHook(() => useRedirectToDest());

        act(() => {
            result.current.redirectToDest();
        });

        expect(replaceMock).toHaveBeenCalledWith('/');
    });
});
