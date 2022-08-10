// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';
import {camelCase, flow, mergeWith, partialRight, trimEnd, upperFirst} from 'lodash';
import moment from 'moment';
import fs from 'fs';
import {IActionsListConfig} from '_types/actionsList';
import {ErrorFieldDetail, ErrorFieldDetailMessage, Errors, IExtendedErrorMsg} from '_types/errors';
import {LibraryBehavior} from '_types/library';
import ValidationError from '../errors/ValidationError';
import {APPS_URL_PREFIX} from '../_types/application';
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
     * Validate endpoint format: if external, can be any URL, if internal must be only alphanum characters and dashes
     *
     * @param id
     */
    isEndpointValid(id: string, isExternal: boolean): boolean;

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

    /**
     * Get the directories library associated with the library given
     *
     * @param library
     */
    getDirectoriesLibraryId(library: string): string;

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

    translateError(error: Errors | IExtendedErrorMsg | string, lang: string): string;

    getFullApplicationEndpoint(endpoint: string): string;

    getCoreEntityCacheKey(entityType: string, entityId: string): string;

    generateExplicitValidationError<T>(
        field: keyof T,
        message: ErrorFieldDetailMessage,
        lang: string
    ): ValidationError<T>;

    deleteFile(path: string): Promise<void>;
}

export interface IUtilsDeps {
    translator?: i18n;
}

export default function({translator = null}: IUtilsDeps = {}): IUtils {
    return {
        deleteFile: async (path: string): Promise<void> => {
            return fs.promises.unlink(path);
        },
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
        isEndpointValid(endpoint, isExternal) {
            if (!endpoint) {
                return false;
            }

            // External app: any URL
            if (isExternal) {
                try {
                    new URL(endpoint);
                    return true;
                } catch (err) {
                    return false;
                }
            }

            // Internal app: simple endpoint
            return /^[a-z0-9-]+$/.test(endpoint);
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
        getDirectoriesLibraryId(library) {
            return `${library}_directories`;
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
        },
        translateError(error: ErrorFieldDetailMessage, lang: string): string {
            const toTranslate = typeof error === 'string' ? {msg: error, vars: {}} : (error as IExtendedErrorMsg);

            return translator.t(('errors.' + toTranslate.msg) as string, {
                ...toTranslate.vars,
                lng: lang,
                interpolation: {escapeValue: false}
            });
        },
        getFullApplicationEndpoint(endpoint: string): string {
            return `${APPS_URL_PREFIX}/${endpoint}`;
        },
        getCoreEntityCacheKey(entityType: string, entityId: string): string {
            return `coreEntity:${entityType}:${entityId}`;
        },
        generateExplicitValidationError<T>(
            field: keyof T,
            message: ErrorFieldDetailMessage,
            lang: string
        ): ValidationError<T> {
            const fieldDetails: ErrorFieldDetail<T> = {};
            fieldDetails[field] = message;

            //TODO: test this
            return new ValidationError<T>(fieldDetails, this.translateError(message, lang));
        }
    };
}
