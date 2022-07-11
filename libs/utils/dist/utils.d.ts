import {FileType} from './types/files';
import {IKeyValue} from './types/helpers';
export declare const getGraphqlTypeFromLibraryName: (library: string) => string;
export declare const getGraphqlQueryNameFromLibraryName: (library: string) => string;
export declare const isFileAllowed: (
    fsPath: string,
    allowList: string[],
    ignoreList: string[],
    filePath: string
) => boolean;
export declare const localizedTranslation: (
    translations: Record<string, string>,
    availableLanguages: string[]
) => string;
/**
 *
 * @param str
 * @param format 'hsl' || 'rgb' || 'hex'
 * @param saturation in percent, default to 30
 * @param luminosity in percent, default to 80
 */
export declare const stringToColor: (str?: string, format?: string, saturation?: number, luminosity?: number) => string;
export declare const getInvertColor: (color: string) => string;
/**
 * Parse string to extract args.
 * Arg is a string with format:
 * -[argName] argValue
 *
 * eg. "-library product -type link" => {library: product, type: link}
 * @param mapping
 */
export declare const extractArgsFromString: (
    mapping: string
) => {
    [arg: string]: string;
};
export declare const objectToNameValueArray: <T>(
    obj: IKeyValue<T>
) => Array<{
    name: string;
    value: T;
}>;
export declare const getLibraryGraphqlNames: (
    libraryId: string
) => {
    query: string;
    type: string;
    list: string;
    searchableFields: string;
    filter: string;
};
export declare const getFileType: (fileName: string) => FileType;
/**
 * Return a simplified call stack (for the function who called this function, not this one, obviously)
 *
 * @param depth Number of calls to return
 */
export declare const getCallStack: (depth?: number) => string[];
