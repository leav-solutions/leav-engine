// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {GET_API_KEYS_apiKeys_list} from '_gqlTypes/GET_API_KEYS';

const mockUser = {
    whoAmI: {
        id: '1',
        library: {
            id: 'users',
            label: {
                en: 'Users',
                fr: 'Utilisateurs'
            },
            __typename: 'Library'
        },
        label: 'admin',
        color: null,
        preview: null,
        __typename: 'RecordIdentity'
    },
    __typename: 'User'
};
export const mockApiKey: WithTypename<GET_API_KEYS_apiKeys_list> = {
    __typename: 'ApiKey',
    id: 'my_api_key',
    label: 'My API key',
    key: null,
    expiresAt: 1234567890,
    user: mockUser,
    createdBy: mockUser,
    createdAt: 1234567890,
    modifiedBy: mockUser,
    modifiedAt: 1234567890
};
