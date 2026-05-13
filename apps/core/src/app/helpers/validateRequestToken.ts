import {type IAuthApp} from '../auth/authApp';
import {type IRequestWithContext} from '../../_types/express';
import {API_KEY_PARAM_NAME, type ITokenUserData} from '../../_types/auth';
import {type Response} from 'express';

export type ValidateRequestTokenFunc = (req: IRequestWithContext, res: Response<unknown>) => Promise<ITokenUserData>;

export interface IValidateRequestTokenDeps {
    'core.app.auth': IAuthApp;
}

export default function ({'core.app.auth': authApp}: IValidateRequestTokenDeps): ValidateRequestTokenFunc {
    return (req, res) =>
        authApp.validateRequestToken(
            {
                ...(req.query?.[API_KEY_PARAM_NAME] && {
                    apiKey: String(req.query[API_KEY_PARAM_NAME]),
                }),
                headers: req.headers,
                cookies: req.cookies,
            },
            res,
        );
}
