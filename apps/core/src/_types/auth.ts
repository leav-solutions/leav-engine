// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
export const API_KEY_PARAM_NAME = 'key';

export interface ITokenUserData {
    userId: string;
    groupsId: string[];
}
