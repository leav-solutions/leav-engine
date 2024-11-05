// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useAuth from './useAuth';
import {renderHook} from '_ui/_tests/testUtils';

const fetchMock = jest.fn();
global.fetch = fetchMock;

const mockedLocation = {...window.location, reload: jest.fn(), assign: jest.fn()};
delete window.location;
window.location = mockedLocation;

describe('useAuth', () => {
    beforeEach(() => {
        fetchMock.mockClear();
        mockedLocation.reload.mockClear();
        mockedLocation.assign.mockClear();
    });

    it('should reload page on empty logout', async () => {
        const {result} = renderHook(() => useAuth());
        fetchMock.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({})
        });

        await result.current.logout();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/auth/logout', {method: 'POST'});
        expect(mockedLocation.assign).not.toHaveBeenCalled();
        expect(mockedLocation.reload).toHaveBeenCalledTimes(1);
        expect(mockedLocation.reload).toHaveBeenCalledWith();
    });

    it('Should go to redirectUrl if present in response logout', async () => {
        const {result} = renderHook(() => useAuth());
        fetchMock.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce({
                redirectUrl: 'redirectUrl'
            })
        });

        await result.current.logout();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('/auth/logout', {method: 'POST'});
        expect(mockedLocation.assign).toHaveBeenCalledTimes(1);
        expect(mockedLocation.assign).toHaveBeenCalledWith('redirectUrl');
        expect(mockedLocation.reload).not.toHaveBeenCalled();
    });
});
