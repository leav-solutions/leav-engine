import {camelCase, upperFirst, trimEnd} from 'lodash';

export interface IUtils {
    libNameToQueryName(name: string): string;
    libNameToTypeName(name: string): string;
}

export default function(): IUtils {
    return {
        libNameToQueryName(name: string): string {
            let formattedName = camelCase(name);
            formattedName = trimEnd(formattedName);

            return formattedName;
        },
        libNameToTypeName(name: string): string {
            let formattedName = camelCase(name);
            formattedName = upperFirst(formattedName);
            formattedName = trimEnd(formattedName);
            formattedName = trimEnd(formattedName, 's');

            return formattedName;
        }
    };
}
