// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError, useMutation} from '@apollo/client';
import {ErrorTypes} from '@leav/utils';
import {saveValueMutation} from 'graphQL/mutations/values/saveValueMutation';
import {useTranslation} from 'react-i18next';
import {SAVE_VALUE, SAVE_VALUEVariables, SAVE_VALUE_saveValue} from '_gqlTypes/SAVE_VALUE';
import {IRecordIdentityWhoAmI} from '_types/types';
import {APICallStatus, FieldSubmitFunc} from '../_types';
import getPropertyCacheFieldName from './helpers/getPropertyCacheFieldName';

export interface ISaveValueHook {
    saveValue: FieldSubmitFunc;
}

export default function useSaveValueMutation(record: IRecordIdentityWhoAmI, attribute: string): ISaveValueHook {
    const [executeSaveValue] = useMutation<SAVE_VALUE, SAVE_VALUEVariables>(saveValueMutation, {
        update: (cache, {data: {saveValue}}) => {
            const recordWithTypename = {...record, __typename: record.library.gqlNames.type};
            cache.modify({
                id: cache.identify(recordWithTypename),
                fields: {
                    [getPropertyCacheFieldName(attribute)]: (cacheValue: SAVE_VALUE_saveValue[]) => {
                        // Update or add saved value to the cache
                        const newCacheValue = [...cacheValue];
                        const cacheIndex = cacheValue.findIndex(val => val.id_value === saveValue.id_value);

                        if (cacheIndex !== -1) {
                            newCacheValue[cacheIndex] = saveValue;
                        } else {
                            newCacheValue.push(saveValue);
                        }

                        return newCacheValue;
                    }
                }
            });
        }
    });
    const {t} = useTranslation();

    return {
        saveValue: async value => {
            try {
                const saveRes = await executeSaveValue({
                    variables: {
                        library: record.library.id,
                        attribute,
                        recordId: record.id,
                        value: {
                            value: String(value.value),
                            id_value: value.idValue
                        }
                    }
                });
                return {status: APICallStatus.SUCCESS, value: saveRes.data.saveValue};
            } catch (err) {
                const gqlError = (err as ApolloError).graphQLErrors[0];

                const message = gqlError?.extensions?.code
                    ? gqlError.extensions.code === ErrorTypes.VALIDATION_ERROR
                        ? gqlError.extensions.fields[attribute]
                        : t(`error.${gqlError.extensions.code}`)
                    : err.message;

                return {status: APICallStatus.ERROR, error: message};
            }
        }
    };
}
