// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetLibraryByIdQuery} from '../../_gqlTypes';

export default function useCheckPreviewExistence(libraryId: string, previewId: string): boolean {
    const {data: PreviewExistenceData} = useGetLibraryByIdQuery({
        variables: {
            id: libraryId
        },
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
        partialRefetch: false
    });

    const library = PreviewExistenceData.libraries.list[0];

    return library?.previewsSettings.map(p => p.id).includes(previewId);
}
