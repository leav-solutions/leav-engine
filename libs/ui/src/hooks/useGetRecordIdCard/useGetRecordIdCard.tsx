// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
