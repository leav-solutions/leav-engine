import useAuth from './useAuth';
import {renderHook} from '_ui/_tests/testUtils';

const fetchMock = jest.fn();
global.fetch = fetchMock;

const setRefreshTokenMock = jest.fn();
jest.mock('../useRefreshToken', () => () => ({
    setRefreshToken: setRefreshTokenMock
}));

const mockedLocation = {...window.location, reload: jest.fn(), assign: jest.fn()};
delete window.location;
window.location = mockedLocation;

describe('useAuth', () => {
    beforeEach(() => {
        fetchMock.mockClear();
        setRefreshTokenMock.mockClear();
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
