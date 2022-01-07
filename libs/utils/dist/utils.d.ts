export declare const getGraphqlTypeFromLibraryName: (library: string) => string;
export declare const getGraphqlQueryNameFromLibraryName: (library: string) => string;
export declare const isFileAllowed: (
    fsPath: string,
    allowList: string[],
    ignoreList: string[],
    filePath: string
) => boolean;
