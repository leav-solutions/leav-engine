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
export declare const objectToNameValueArray: (
    obj: IKeyValue<any>
) => Array<{
    name: string;
    value: string;
}>;
