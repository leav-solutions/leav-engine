// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
        const dest = encodeURIComponent('/dashboard?query=1&params=2');
        jest.spyOn(useQueryParams, 'useQueryParams').mockReturnValue({dest});

        const {result} = renderHook(() => useRedirectToDest());

        act(() => {
            result.current.redirectToDest();
        });

        expect(replaceMock).toHaveBeenCalledWith('/dashboard?query=1&params=2');
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
