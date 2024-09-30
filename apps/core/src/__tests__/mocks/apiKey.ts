// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IApiKey} from '_types/apiKey';

export const mockApiKey: MandatoryId<IApiKey> & {key: string} = {
    id: '123456',
    label: 'API Key Label',
    key: 'my-secret-key',
    createdAt: 123456789,
    createdBy: '42',
    modifiedAt: 123456789,
    modifiedBy: '42',
    expiresAt: null,
    userId: '42'
};
