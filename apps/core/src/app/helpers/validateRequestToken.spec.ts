// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import validateRequestTokenHelper from './validateRequestToken';
import {IAuthApp} from '../auth/authApp';
import {API_KEY_PARAM_NAME} from '../../_types/auth';

describe('validateRequestToken', () => {
    const payload = {};
    const validateRequestTokenMock = jest.fn().mockResolvedValue(payload);
    const mockAuthApp: Mockify<IAuthApp> = {
        validateRequestToken: validateRequestTokenMock
    };
    const validateRequestToken = validateRequestTokenHelper({'core.app.auth': mockAuthApp as IAuthApp});

    beforeEach(() => {
        validateRequestTokenMock.mockClear();
    });

    it('Should call authApp with only cookies if API_KEY_PARAM_NAME is not provided', async () => {
        const request: any = {
            query: {},
            cookies: 'token=123456;'
        };

        const result = await validateRequestToken(request);

        expect(validateRequestTokenMock).toHaveBeenCalledTimes(1);
        expect(validateRequestTokenMock).toHaveBeenCalledWith({cookies: request.cookies});
        expect(result).toEqual(payload);
    });

    it('Should call authApp with apiKey and cookies when API_KEY_PARAM_NAME is provided', async () => {
        const apiKey = 1234567890;
        const request: any = {
            query: {
                [API_KEY_PARAM_NAME]: apiKey
            },
            cookies: 'token=123456;'
        };

        const result = await validateRequestToken(request);

        expect(validateRequestTokenMock).toHaveBeenCalledTimes(1);
        expect(validateRequestTokenMock).toHaveBeenCalledWith({
            apiKey: String(apiKey),
            cookies: request.cookies
        });
        expect(result).toEqual(payload);
    });
});
