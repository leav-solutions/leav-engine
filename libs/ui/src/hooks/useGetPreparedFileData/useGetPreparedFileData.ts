// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult} from '@apollo/client';
import {useEffect, useState} from 'react';
import {useGetFileDataQuery} from '_ui/_gqlTypes';
import {IFileDataWithPreviewsStatus, IFilePreviewsStatus} from '../../_queries/records/getFileDataQuery';

export interface IUseGetFileDataQueryHook {
    loading: boolean;
    error: QueryResult['error'];
    fileData: IFileDataWithPreviewsStatus;
}

export default function useGetPreparedFileData(libraryId: string, fileId: string): IUseGetFileDataQueryHook {
    const [fileData, setFileData] = useState<IFileDataWithPreviewsStatus>();

    const {data, error, loading} = useGetFileDataQuery({
        fetchPolicy: 'cache-and-network',
        skip: !fileId,
        variables: {library: libraryId, fileId, previewsStatusAttribute: `${libraryId}_previews_status`}
    });

    useEffect(() => {
        if (data) {
            if (!data.records.list?.length) {
                setFileData(null);
                return;
            }

            const rawFileData = data.records?.list[0];
            // Convert preview status to an object
            const previewsStatus = rawFileData?.previews_status
                ? (JSON.parse(rawFileData.previews_status?.[0]?.value) as IFilePreviewsStatus)
                : null;
            const file: IFileDataWithPreviewsStatus = {
                ...rawFileData,
                previews_status: previewsStatus,
                isPreviewsGenerationPending: previewsStatus
                    ? Object.keys(previewsStatus).some(key => previewsStatus[key]?.status === -1)
                    : false
            };

            setFileData(file);
        }
    }, [data]);

    return {
        error,
        loading: loading || (!loading && typeof fileData === undefined),
        fileData
    };
}
