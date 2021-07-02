// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError, useMutation} from '@apollo/client';
import {ErrorTypes} from '@leav/utils';
import {saveValueBatchMutation} from 'graphQL/mutations/values/saveValueBatchMutation';
import {useTranslation} from 'react-i18next';
import {SAVE_VALUE_BATCH, SAVE_VALUE_BATCHVariables} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IRecordIdentityWhoAmI} from '_types/types';
import {APICallStatus, FieldSubmitMultipleFunc} from '../_types';
import getPropertyCacheFieldName from './helpers/getPropertyCacheFieldName';

export interface ISaveValueHook {
    saveValues: FieldSubmitMultipleFunc;
}

export default function useSaveValueMutation(record: IRecordIdentityWhoAmI, attribute: string): ISaveValueHook {
    const [executeSaveValueBatch] = useMutation<SAVE_VALUE_BATCH, SAVE_VALUE_BATCHVariables>(saveValueBatchMutation, {
        update: (cache, {data: {saveValueBatch}}) => {
            const recordWithTypename = {...record, __typename: record.library.gqlNames.type};
            cache.modify({
                id: cache.identify(recordWithTypename),
                fields: {
                    [getPropertyCacheFieldName(attribute)]: cacheValue => {
                        return [...cacheValue, ...saveValueBatch.values];
                    }
                }
            });
        }
    });
    const {t} = useTranslation();

    return {
        saveValues: async values => {
            try {
                const saveRes = await executeSaveValueBatch({
                    variables: {
                        library: record.library.id,
                        recordId: record.id,
                        values: values.map(value => ({
                            attribute,
                            id_value: value.idValue,
                            value: String(value.value)
                        }))
                    }
                });

                return {status: APICallStatus.SUCCESS, ...saveRes.data.saveValueBatch};
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
