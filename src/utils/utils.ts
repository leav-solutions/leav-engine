import {camelCase, upperFirst, trimEnd} from 'lodash';

export interface IUtils {
    libNameToQueryName(name: string): string;
    libNameToTypeName(name: string): string;

    /**
     * Rethrow an error prefixed by optional message.
     * The same given error is re-thrown so stacktrace is keeped intact
     *
     * @param err
     * @param message
     */
    rethrow(err: Error, message?: string): void;
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
        },
        rethrow(err: Error, message?: string): void {
            if (message) {
                err.message = `${message} ${err.message}`;
            }

            throw err;
        }
    };
}
