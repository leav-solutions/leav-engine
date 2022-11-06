// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as bcrypt from 'bcryptjs';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {i18n} from 'i18next';
import {IApiKeyRepo} from 'infra/apiKey/apiKeyRepo';
import moment from 'moment';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import {IApiKey, IGetCoreApiKeysParams} from '_types/apiKey';
import {IQueryInfos} from '_types/queryInfos';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';

export interface IApiKeyDomain {
    getApiKeys(params: {params?: IGetCoreApiKeysParams; ctx: IQueryInfos}): Promise<IList<IApiKey>>;
    getApiKeyProperties(params: {id: string; ctx: IQueryInfos}): Promise<IApiKey>;
    saveApiKey(params: {apiKey: IApiKey; ctx: IQueryInfos}): Promise<IApiKey>;
    deleteApiKey(params: {id: string; ctx: IQueryInfos}): Promise<IApiKey>;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.infra.apiKey'?: IApiKeyRepo;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export default function ({'core.infra.apiKey': apiKeyRepo = null, 'core.utils': utils = null}: IDeps): IApiKeyDomain {
    const _encryptApiKey = async (key: string): Promise<string> => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(key, salt);
        return hash;
    };

    const _hideSecrets = (apiKey: IApiKey): IApiKey => {
        return {
            ...apiKey,
            key: null
        };
    };

    return {
        async getApiKeys({params, ctx}) {
            const initializedParams = {...params};

            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            const keys = await apiKeyRepo.getApiKeys({params: initializedParams, ctx});

            return {
                ...keys,
                list: keys.list.map(_hideSecrets)
            };
        },
        async getApiKeyProperties({id, ctx}) {
            const searchParams: IGetCoreApiKeysParams = {
                filters: {id}
            };

            const keys = await apiKeyRepo.getApiKeys({params: searchParams, ctx});

            if (!keys.list.length) {
                throw utils.generateExplicitValidationError(
                    'id',
                    {msg: Errors.UNKNOWN_API_KEY, vars: {apiKey: id}},
                    ctx.lang
                );
            }

            return _hideSecrets(keys.list[0]);
        },
        async saveApiKey({apiKey, ctx}) {
            const isNewKey = !apiKey.id;

            let existingKeyProps;
            if (!isNewKey) {
                existingKeyProps = await this.getApiKeyProperties({id: apiKey.id, ctx});
            }

            const defaultParams: Partial<IApiKey> = {
                label: '',
                createdAt: moment().unix(),
                createdBy: String(ctx.userId),
                modifiedAt: moment().unix(),
                modifiedBy: String(ctx.userId),
                expiresAt: null,
                userId: null
            };

            const modifier = String(ctx.userId);
            const now = moment().unix();

            const {key, ...inputApiKeyData} = apiKey; // NEVER save the key from user input

            const dataToSave = {
                ...defaultParams,
                ...existingKeyProps,
                ...inputApiKeyData
            };

            let keyString: string;
            if (isNewKey) {
                keyString = uuidv4();
                dataToSave.key = await _encryptApiKey(keyString);
                dataToSave.created_at = now;
                dataToSave.created_by = modifier;
            } else {
                delete dataToSave.key; // Don't update the key
            }

            dataToSave.modified_at = now;
            dataToSave.modified_by = modifier;

            let savedKey: IApiKey;
            if (isNewKey) {
                savedKey = await apiKeyRepo.createApiKey({keyData: dataToSave, ctx});
                savedKey.key = keyString; // On creation, return the raw key to the user, not the encrypted one
            } else {
                savedKey = await apiKeyRepo.updateApiKey({keyData: dataToSave, ctx});
                savedKey = _hideSecrets(savedKey);
            }

            return savedKey;
        },
        async deleteApiKey({id, ctx}) {
            const keyProps = await this.getApiKeyProperties({id, ctx});

            const deletedKey = await apiKeyRepo.deleteApiKey({id: keyProps.id, ctx});

            return _hideSecrets(deletedKey);
        }
    };
}
