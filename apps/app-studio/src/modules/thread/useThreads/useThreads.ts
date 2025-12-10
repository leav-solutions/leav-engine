// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetThreadQuery} from '../../../__generated__';

export const useThreads = (recordId: string, libraryId: string) => {
    const {data, loading} = useGetThreadQuery({
        variables: {libraryId, recordId},
    });
    const record = data?.records.list?.[0];
    const editRecordPermission = record?.permissions.edit_record ?? false;
    const rawThreads = record?.threads;

    if (loading || !rawThreads) {
        return {threads: [], loading, editRecordPermission};
    }

    const threads = rawThreads.map(thread => ({
        id: thread.payload?.id as string,
        label: thread.payload?.label[0]?.payload,
        status: thread.payload?.status?.[0]?.payload?.id,
        comments:
            thread.payload?.comments
                ?.map(comment => ({
                    id: comment.payload?.id,
                    content: comment.payload?.content?.[0]?.payload,
                    createdAt: new Date(comment.payload?.createdAt?.[0]?.raw_payload * 1000),
                    author: {
                        name: comment?.payload?.author?.[0]?.payload?.name[0]?.payload,
                        id: comment?.payload?.author?.[0]?.payload?.id,
                    },
                }))
                .reverse() ?? [],
    }));

    return {
        threads,
        loading,
        editRecordPermission,
    };
};
