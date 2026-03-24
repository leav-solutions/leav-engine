// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from './queryInfos';
import {type IRecord} from './record';
import type jwt from 'jsonwebtoken';

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const API_KEY_PARAM_NAME = 'key';

export interface ITokenUserData {
    userId: string;
    groupsId: string[];
}

export type AuthPostOidcLoginCallback = (
    user: IRecord,
    decodedAccessToken: jwt.JwtPayload,
    ctx: IQueryInfos,
) => Promise<void>;
