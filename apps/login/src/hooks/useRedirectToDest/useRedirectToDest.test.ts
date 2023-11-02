import {act, renderHook} from '@testing-library/react';
import * as useQueryParams from 'hooks/useQueryParams';
import useRedirectToDest from './useRedirectToDest';

jest.mock('react-router-dom', () => ({
    useQueryParams: jest.fn()
}));

describe('useRedirectToDest', () => {
    const replaceMock = jest.fn();
    const originalWindow = {...window};

    beforeEach(() => {
        delete window.location;
        window.location = {replace: replaceMock} as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
        window.location = originalWindow.location;
    });

    it('should redirect to the destination when it is present in the query params', () => {
        jest.spyOn(useQueryParams, 'useQueryParams').mockReturnValue({dest: '/dashboard'});

        const {result} = renderHook(() => useRedirectToDest());

        act(() => {
            result.current.redirectToDest();
        });

        expect(replaceMock).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to the default destination when it is not present in the query params', () => {
        jest.spyOn(useQueryParams, 'useQueryParams').mockReturnValue({});
        const {result} = renderHook(() => useRedirectToDest());

        act(() => {
            result.current.redirectToDest();
        });

        expect(replaceMock).toHaveBeenCalledWith('/');
    });
});
