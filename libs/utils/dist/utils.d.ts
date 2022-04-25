export declare const getGraphqlTypeFromLibraryName: (library: string) => string;
export declare const getGraphqlQueryNameFromLibraryName: (library: string) => string;
export declare const isFileAllowed: (fsPath: string, allowList: string[], ignoreList: string[], filePath: string) => boolean;
export declare const localizedTranslation: (translations: Record<string, string>, availableLanguages: string[]) => string;
/**
 *
 * @param str
 * @param format 'hsl' || 'rgb' || 'hex'
 * @param saturation in percent, default to 30
 * @param luminosity in percent, default to 80
 */
export declare const stringToColor: (str?: string, format?: string, saturation?: number, luminosity?: number) => string;
export declare const getInvertColor: (color: string) => string;
