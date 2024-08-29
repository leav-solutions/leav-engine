// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAuthApp} from '../auth/authApp';
import {IRequestWithContext} from '../../_types/express';
import {API_KEY_PARAM_NAME, ITokenUserData} from '../../_types/auth';
import {Response} from 'express';

export type ValidateRequestTokenFunc = (req: IRequestWithContext, res: Response<unknown>) => Promise<ITokenUserData>;

interface IDeps {
    'core.app.auth'?: IAuthApp;
}

export default function ({'core.app.auth': authApp = null}: IDeps = {}): ValidateRequestTokenFunc {
    return (req, res) =>
        authApp.validateRequestToken(
            {
                ...(req.query[API_KEY_PARAM_NAME] && {
                    apiKey: String(req.query[API_KEY_PARAM_NAME])
                }),
                headers: req.headers,
                cookies: req.cookies
            },
            res
        );
}
