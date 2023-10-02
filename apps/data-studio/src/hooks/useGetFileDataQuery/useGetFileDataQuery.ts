// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {
    getFileDataQuery,
    IFileDataQuery,
    IFileDataQueryVariables,
    IFileDataWithPreviewsStatus
} from 'graphQL/queries/records/getFileDataQuery';
import {useEffect, useState} from 'react';

export interface IUseGetFileDataQueryHook {
    loading: boolean;
    error: QueryResult['error'];
    fileData: IFileDataWithPreviewsStatus;
}

export default function useGetFileDataQuery(libraryId: string, fileId: string): IUseGetFileDataQueryHook {
    const [fileData, setFileData] = useState<IFileDataWithPreviewsStatus>();

    const {data, error, loading} = useQuery<IFileDataQuery, IFileDataQueryVariables>(getFileDataQuery(libraryId), {
        fetchPolicy: 'cache-and-network',
        skip: !fileId,
        variables: {fileId}
    });

    useEffect(() => {
        if (data) {
            // Convert preview status to an object
            if (!data[libraryId]?.list?.length) {
                setFileData(null);
                return;
            }

            const rawFileData = data[libraryId]?.list[0];
            const previewsStatus = rawFileData?.previews_status ? JSON.parse(rawFileData.previews_status) : null;
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
