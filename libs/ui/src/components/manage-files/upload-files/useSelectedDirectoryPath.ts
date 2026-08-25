import {useGetDirectoryDataQuery} from '_ui/_gqlTypes';

/**
 * Full path of the selected destination directory, derived from the query so that nothing has to be
 * resynchronised when the selection changes.
 */
export const useSelectedDirectoryPath = (directoriesLibraryId?: string, directoryId?: string): string | undefined => {
    const {data} = useGetDirectoryDataQuery({
        skip: !directoriesLibraryId || !directoryId,
        variables: {library: directoriesLibraryId, directoryId},
    });

    const directory = data?.records.list[0];

    if (!directory) {
        return undefined;
    }

    return [directory.file_path?.[0]?.value ?? '', directory.file_name?.[0]?.value ?? '']
        .filter(Boolean)
        .join('/')
        .replace('./', '');
};
