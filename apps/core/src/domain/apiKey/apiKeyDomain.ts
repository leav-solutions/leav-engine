// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import * as bcrypt from 'bcryptjs';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {i18n} from 'i18next';
import {IApiKeyRepo} from 'infra/apiKey/apiKeyRepo';
import moment from 'moment';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import {IApiKey, IGetCoreApiKeysParams} from '_types/apiKey';
import {IQueryInfos} from '_types/queryInfos';
import AuthenticationError from '../../errors/AuthenticationError';
import PermissionError from '../../errors/PermissionError';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';

export interface IApiKeyDomain {
    getApiKeys(params: {params?: IGetCoreApiKeysParams; ctx: IQueryInfos}): Promise<IList<IApiKey>>;
    getApiKeyProperties(params: {id: string; hideKey?: boolean; ctx: IQueryInfos}): Promise<IApiKey>;
    saveApiKey(params: {apiKey: IApiKey; ctx: IQueryInfos}): Promise<IApiKey>;
    deleteApiKey(params: {id: string; ctx: IQueryInfos}): Promise<IApiKey>;
    validateApiKey(params: {apiKey: string; ctx: IQueryInfos}): Promise<IApiKey>;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.apiKey'?: IApiKeyRepo;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.infra.apiKey': apiKeyRepo = null,
    'core.utils': utils = null
}: IDeps): IApiKeyDomain {
    const _hashApiKey = async (key: string): Promise<string> => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(key, salt);
        return hash;
    };

    const _encodeExposedKey = (apiKey: IApiKey, rawKey: string): string => {
        // The key exposed to the user is the concatenation of the key and the id, encoded in base64
        // We'll need the ID later on to check the validity of the key
        const exposedKey = `${apiKey.id}|${rawKey}`;
        return Buffer.from(exposedKey).toString('base64url');
    };

    const _decodeExposedKey = (key: string): {id: string; key: string} => {
        // The string received is an encoded concatenation of the key and the id. Decode it and split it
        const string = Buffer.from(key, 'base64url').toString();
        const [id, rawKey] = string.split('|');
        return {id, key: rawKey};
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
        async getApiKeyProperties({id, hideKey = true, ctx}) {
            const searchParams: IGetCoreApiKeysParams = {
                filters: {id}
            };

            const keys = await apiKeyRepo.getApiKeys({params: searchParams, ctx});

            if (!keys.list.length) {
                throw utils.generateExplicitValidationError('id', Errors.UNKNOWN_API_KEY, ctx.lang);
            }

            return hideKey ? _hideSecrets(keys.list[0]) : keys.list[0];
        },
        async saveApiKey({apiKey, ctx}) {
            const isNewKey = !apiKey.id;

            const action = isNewKey ? AdminPermissionsActions.CREATE_API_KEY : AdminPermissionsActions.EDIT_API_KEY;
            const canSaveApiKey = await adminPermissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});
            if (!canSaveApiKey) {
                throw new PermissionError(action);
            }

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
                dataToSave.key = await _hashApiKey(keyString);
                dataToSave.createdAt = now;
                dataToSave.createdBy = modifier;
                delete dataToSave.id; // To make sure "id" is not present at all
            } else {
                delete dataToSave.key; // Don't update the key
            }

            dataToSave.modifiedAt = now;
            dataToSave.modifiedBy = modifier;

            let savedKey: IApiKey;
            if (isNewKey) {
                savedKey = await apiKeyRepo.createApiKey({keyData: dataToSave, ctx});

                // On creation, return a concatenation of ID and raw key to the user, not the hash stored in DB
                savedKey.key = _encodeExposedKey(savedKey, keyString);
            } else {
                savedKey = await apiKeyRepo.updateApiKey({keyData: dataToSave, ctx});
                savedKey = _hideSecrets(savedKey);
            }

            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.API_KEY_SAVE,
                    topic: {
                        apiKey: savedKey.id
                    },
                    before: _hideSecrets(existingKeyProps) ?? null,
                    after: _hideSecrets(savedKey)
                },
                ctx
            );

            return savedKey;
        },
        async deleteApiKey({id, ctx}) {
            const keyProps = await this.getApiKeyProperties({id, ctx});

            const action = AdminPermissionsActions.DELETE_API_KEY;
            const canDeleteApiKey = await adminPermissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canDeleteApiKey) {
                throw new PermissionError(action);
            }

            const deletedKey = await apiKeyRepo.deleteApiKey({id: keyProps.id, ctx});

            const keyToReturn = _hideSecrets(deletedKey);

            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.API_KEY_DELETE,
                    topic: {
                        apiKey: keyToReturn.id
                    },
                    before: _hideSecrets(keyProps),
                    after: null
                },
                ctx
            );

            return keyToReturn;
        },
        async validateApiKey({apiKey, ctx}) {
            // Get key hash
            const {id, key: rawKey} = _decodeExposedKey(apiKey);

            // Retrieve key from DB
            const keyData = await this.getApiKeyProperties({id, hideKey: false, ctx});

            const isKeyValid = await bcrypt.compare(rawKey, keyData.key);

            if (!isKeyValid) {
                throw new AuthenticationError('Invalid API key');
            }

            return keyData;
        }
    };
}
