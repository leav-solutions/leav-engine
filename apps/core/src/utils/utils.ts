// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {camelCase, flow, mergeWith, partialRight, trimEnd, upperFirst} from 'lodash';
import moment from 'moment';
import {IActionsListConfig} from '_types/actionsList';
import {LibraryBehavior} from '_types/library';
import {AttributeTypes, IAttribute} from '../_types/attribute';
import getDefaultActionsList from './helpers/getDefaultActionsList';
import getLibraryDefaultAttributes from './helpers/getLibraryDefaultAttributes';

export interface IUtils {
    libNameToQueryName(name: string): string;
    libNameToTypeName(name: string): string;

    /**
     * Validate ID format: must be only alphanum characters and underscores
     *
     * @param id
     */
    isIdValid(id: string): boolean;

    /**
     * Rethrow an error prefixed by optional message.
     * The same given error is re-thrown so stacktrace is keeped intact
     *
     * @param err
     * @param message
     */
    rethrow(err: Error, message?: string): void;

    pipe(...fns: any[]): any;

    mergeConcat(object: {}, sources: {}): {};

    nameValArrayToObj(arr?: Array<{}>, keyFieldName?: string, valueFieldName?: string): {[key: string]: any};

    objToNameValArray<T extends {}>(obj: {}, keyFieldName?: string, valueFieldName?: string): T[];

    /**
     * Get the tree library associated with the library given
     *
     * @param library
     */
    getLibraryTreeId(library: string): string;

    forceArray<T>(val: T | T[]): T[];

    getDefaultActionsList(attribute: IAttribute): IActionsListConfig;

    getLibraryDefaultAttributes(behavior: LibraryBehavior, libraryId: string): string[];

    timestampToDate(t: number | string): Date;

    dateToTimestamp(d: Date): number;

    isStandardAttribute(attribute: IAttribute): boolean;

    isLinkAttribute(attribute: IAttribute): boolean;

    isTreeAttribute(attribute: IAttribute): boolean;

    /**
     * Extract library and record ID from the "_to" field
     *
     * @param value Edge destination in the form of "<library>/<record_id>"
     */
    decomposeValueEdgeDestination(value: string): {library: string; id: string};
}

export default function (): IUtils {
    return {
        libNameToQueryName(name: string): string {
            return flow([camelCase, trimEnd])(name);
        },
        libNameToTypeName(name: string): string {
            return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(name);
        },
        isIdValid(id: string): boolean {
            if (!id) {
                return false;
            }

            return /^[a-z0-9_]+$/.test(id);
        },
        rethrow(err: Error, message?: string): void {
            if (message) {
                err.message = `${message} ${err.message}`;
            }

            throw err;
        },
        pipe(...fns: any[]): any {
            const _pipe = (f, g) => async (...args) => g(await f(...args));
            return fns.length ? fns.reduce(_pipe) : () => null;
        },
        mergeConcat(object: {}, sources: {}): {} {
            const customizer = (oVal, srcVal) => {
                if (Array.isArray(oVal)) {
                    return oVal.concat(srcVal);
                }
            };

            return mergeWith(object, sources, customizer);
        },
        nameValArrayToObj(arr: Array<{}> = [], keyFieldName = 'name', valueFieldName = 'value'): {[key: string]: any} {
            return Array.isArray(arr) && arr.length
                ? arr.reduce((formattedElem, elem) => {
                      formattedElem[elem[keyFieldName]] = elem[valueFieldName];

                      return formattedElem;
                  }, {})
                : null;
        },
        objToNameValArray<T extends {}>(obj: {}, keyFieldName: string = 'name', valueFieldName: string = 'value'): T[] {
            if (!obj) {
                return [];
            }

            return Object.keys(obj).reduce((arr, key) => {
                return [
                    ...arr,
                    {
                        [keyFieldName]: key,
                        [valueFieldName]: obj[key]
                    }
                ];
            }, []);
        },
        getLibraryTreeId(library) {
            return `${library}_tree`;
        },
        forceArray<T>(val: T | T[]): T[] {
            return Array.isArray(val) ? val : [val];
        },
        getDefaultActionsList,
        getLibraryDefaultAttributes,
        timestampToDate(t: string | number): Date {
            return moment.unix(Number(t)).toDate();
        },
        dateToTimestamp(d: Date): number {
            return moment(d).unix();
        },
        isStandardAttribute(attribute: IAttribute): boolean {
            return attribute.type === AttributeTypes.SIMPLE || attribute.type === AttributeTypes.ADVANCED;
        },
        isLinkAttribute(attribute: IAttribute): boolean {
            return attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;
        },
        isTreeAttribute(attribute: IAttribute): boolean {
            return attribute.type === AttributeTypes.TREE;
        },
        decomposeValueEdgeDestination(value: string): {library: string; id: string} {
            const [library, id]: [string, string] = value.split('/') as [string, string];

            return {library, id};
        }
    };
}
