import {type ApolloError} from '@apollo/client';
import {ErrorTypes} from '@leav/utils';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValuesCacheUpdate} from '_ui/hooks/useValuesCacheUpdate';
import {type IRecordIdentityWhoAmI} from '_ui/types/records';
import {useDeleteValueMutation} from '_ui/_gqlTypes';
import {APICallStatus, type DeleteValueFunc} from '../_types';

export interface IDeleteValueHook {
    deleteValue: DeleteValueFunc;
}

export default function useExecuteDeleteValueMutation(record: IRecordIdentityWhoAmI): IDeleteValueHook {
    const updateValuesCache = useValuesCacheUpdate();
    const [executeDeleteValue] = useDeleteValueMutation({
        update: (cache, {data: {deleteValue}}) => {
            updateValuesCache(record, deleteValue);
        },
    });
    const {t} = useSharedTranslation();

    return {
        deleteValue: async (value, attribute) => {
            try {
                await executeDeleteValue({
                    variables: {
                        library: record.library.id,
                        attribute,
                        recordId: record.id,
                        value,
                    },
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
        },
    };
}
