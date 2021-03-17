// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError, useMutation} from '@apollo/client';
import {ErrorTypes} from '@leav/types';
import {deleteValueMutation} from 'graphQL/mutations/values/deleteValueMutation';
import {useTranslation} from 'react-i18next';
import {DELETE_VALUE, DELETE_VALUEVariables} from '_gqlTypes/DELETE_VALUE';
import {IRecordIdentityWhoAmI} from '_types/types';
import {APICallStatus, DeleteValueFunc} from '../_types';

export interface ISaveValueHook {
    deleteValue: DeleteValueFunc;
}

export default function useSaveValueMutation(record: IRecordIdentityWhoAmI, attribute: string): ISaveValueHook {
    const [executeDeleteValue] = useMutation<DELETE_VALUE, DELETE_VALUEVariables>(deleteValueMutation);
    const {t} = useTranslation();

    return {
        deleteValue: async valueId => {
            try {
                await executeDeleteValue({
                    variables: {
                        library: record.library.id,
                        attribute,
                        recordId: record.id,
                        valueId
                    }
                });
                return {status: APICallStatus.SUCCESS};
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
