import {LibraryBehavior, TreeBehavior, useGetTreeLibrariesQuery} from '_ui/_gqlTypes';

export interface IFilesTreeLibraries {
    filesTreeId?: string;
    directoriesLibraryId?: string;
    loading: boolean;
}

/**
 * Resolves the system `files` tree a library belongs to, and the `directories` library it holds.
 * Both file-management modals need it to know where they are allowed to drop things.
 */
export const useFilesTreeLibraries = (libraryId: string): IFilesTreeLibraries => {
    const {data, loading} = useGetTreeLibrariesQuery({variables: {library: libraryId}});

    const filesTree = data?.trees?.list.find(tree => tree.system && tree.behavior === TreeBehavior.files);

    return {
        filesTreeId: filesTree?.id,
        directoriesLibraryId: filesTree?.libraries.find(({library}) => library.behavior === LibraryBehavior.directories)
            ?.library.id,
        loading,
    };
};
