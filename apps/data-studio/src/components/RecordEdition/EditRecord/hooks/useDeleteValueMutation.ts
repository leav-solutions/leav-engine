// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError, useMutation} from '@apollo/client';
import {ErrorTypes} from '@leav/utils';
import {deleteValueMutation} from 'graphQL/mutations/values/deleteValueMutation';
import {useValuesCacheUpdate} from 'hooks/useValuesCacheUpdate';
import {useTranslation} from 'react-i18next';
import {DELETE_VALUE, DELETE_VALUEVariables} from '_gqlTypes/DELETE_VALUE';
import {IRecordIdentityWhoAmI} from '_types/types';
import {APICallStatus, DeleteValueFunc} from '../_types';

export interface ISaveValueHook {
    deleteValue: DeleteValueFunc;
}

export default function useDeleteValueMutation(record: IRecordIdentityWhoAmI): ISaveValueHook {
    const updateValuesCache = useValuesCacheUpdate();
    const [executeDeleteValue] = useMutation<DELETE_VALUE, DELETE_VALUEVariables>(deleteValueMutation, {
        update: (cache, {data: {deleteValue}}) => {
            updateValuesCache(record, [deleteValue]);
        }
    });
    const {t} = useTranslation();

    return {
        deleteValue: async (value, attribute) => {
            try {
                await executeDeleteValue({
                    variables: {
                        library: record.library.id,
                        attribute,
                        recordId: record.id,
                        value
                    }
                });
                return {status: APICallStatus.SUCCESS};
            } catch (err) {
                const gqlError = (err as ApolloError).graphQLErrors[0];

                const message = gqlError?.extensions?.code
                    ? gqlError.extensions.code === ErrorTypes.VALIDATION_ERROR
                        ? gqlError.extensions.fields[attribute]
                        : t(`error.${gqlError.extensions.code}`)
                    : (err as Error).message;

                return {status: APICallStatus.ERROR, error: message};
            }
        }
    };
}
