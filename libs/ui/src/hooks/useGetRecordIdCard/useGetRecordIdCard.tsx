import {useGetRecordIdCardQuery} from '_ui/_gqlTypes';
import {NEW_RECORD_ID} from '_ui/index';

export const useGetRecordIdCard = (recordId: string, libraryId: string) => {
    const {data, loading, error} = useGetRecordIdCardQuery({
        variables: {
            id: recordId,
            libraryId,
        },
        skip: !recordId || recordId === NEW_RECORD_ID || !libraryId,
    });

    return {
        data: data?.records?.list?.[0],
        loading,
        error,
    };
};
