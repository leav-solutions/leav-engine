// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {i18n} from 'i18next';
import camelCase from 'lodash/camelCase';
import flow from 'lodash/flow';
import isEqual from 'lodash/isEqual';
import mergeWith from 'lodash/mergeWith';
import partialRight from 'lodash/partialRight';
import trimEnd from 'lodash/trimEnd';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment';
import os from 'os';
import {ActionsListConfig} from '_types/actionsList';
import {IConfig} from '_types/config';
import {ErrorFieldDetail, ErrorFieldDetailMessage, Errors, IExtendedErrorMsg} from '../_types/errors';
import {ILibrary, ILibraryPreviewsSettings, LibraryBehavior} from '_types/library';
import {ISystemTranslation} from '_types/systemTranslation';
import {IValue} from '_types/value';
import ValidationError from '../errors/ValidationError';
import {APPS_URL_PREFIX} from '../_types/application';
import {AttributeFormats, AttributeTypes, IAttribute} from '../_types/attribute';
import {IPreviewAttributesSettings, IPreviewVersion, IPreviewVersionSize} from '../_types/filesManager';
import getDefaultActionsList from './helpers/getDefaultActionsList';
import getLibraryDefaultAttributes from './helpers/getLibraryDefaultAttributes';
import {getPreviewsAttributeName, getPreviewsStatusAttributeName} from './helpers/getPreviewsAttributes';

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
     * @param isExternal
     */
    isEndpointValid(id: string, isExternal: boolean): boolean;

    /**
     * Rethrow an error prefixed by optional message.
     * The same given error is re-thrown so stacktrace is kept intact
     *
     * @param err
     * @param message
     */
    rethrow(err: Error, message?: string): never;

    pipe(...fns: any[]): any;

    mergeConcat<T = object, U = object>(object: T, sources: U): T & U;

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

    /**
     * Get the files library associated with the directories library given
     *
     * @param directoriesLibrary
     */
    getFilesLibraryId(directoriesLibrary: string): string;

    forceArray<T>(val: T | T[]): T[];

    getDefaultActionsList(attribute: IAttribute): ActionsListConfig;

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

    getFullApplicationEndpoint(endpoint?: string): string;

    getCoreEntityCacheKey(entityType: string, entityId: string): string;

    getRecordsCacheKey(libraryId: string, recordId: string): string;

    generateExplicitValidationError<T>(
        field: keyof T,
        message: ErrorFieldDetailMessage,
        lang: string
    ): ValidationError<T>;

    deleteFile(path: string): Promise<void>;

    getUnixTime(): number;

    getFileExtension(filename: string): string | null;

    getProcessIdentifier(): string;

    getPreviewsAttributeName(libraryId: string): string;
    getPreviewsStatusAttributeName(libraryId: string): string;
    getPreviewAttributesSettings(library: ILibrary): IPreviewAttributesSettings;
    previewsSettingsToVersions(previewsSettings: ILibraryPreviewsSettings[]): IPreviewVersion[];
    areValuesIdentical(value1: IValue, value2: IValue): boolean;
}

export interface IUtilsDeps {
    config?: IConfig;
    translator?: i18n;
}

export default function ({config = null, translator = null}: IUtilsDeps = {}): IUtils {
    return {
        getFileExtension(filename) {
            if (filename.lastIndexOf('.') === -1) {
                return null;
            }

            return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
        },
        getUnixTime: () => Math.floor(Date.now() / 1000),
        deleteFile: async path => fs.promises.unlink(path),
        libNameToQueryName(name) {
            return flow([camelCase, trimEnd])(name);
        },
        libNameToTypeName(name) {
            return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(name);
        },
        isIdValid(id) {
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
        rethrow(err, message?) {
            if (message) {
                err.message = `${message}, ${err.message}`;
            }

            throw err;
        },
        pipe(...fns) {
            const _pipe =
                (f, g) =>
                async (...args) =>
                    g(await f(...args));
            return fns.length ? fns.reduce(_pipe) : () => null;
        },
        mergeConcat(object, sources) {
            const customizer = (oVal, srcVal) => {
                if (Array.isArray(oVal)) {
                    return oVal.concat(srcVal);
                }
            };

            return mergeWith(object, sources, customizer);
        },
        nameValArrayToObj(arr = [], keyFieldName = 'name', valueFieldName = 'value') {
            return Array.isArray(arr) && arr.length
                ? arr.reduce((formattedElem, elem) => {
                      formattedElem[elem[keyFieldName]] = elem[valueFieldName];

                      return formattedElem;
                  }, {})
                : null;
        },
        objToNameValArray<T extends object>(
            obj: object,
            keyFieldName: string = 'name',
            valueFieldName: string = 'value'
        ): T[] {
            if (!obj) {
                return [];
            }

            return Object.keys(obj).reduce(
                (arr, key) => [
                    ...arr,
                    {
                        [keyFieldName]: key,
                        [valueFieldName]: obj[key]
                    }
                ],
                []
            );
        },
        getLibraryTreeId(library) {
            return `${library}_tree`;
        },
        getFilesLibraryId(directoriesLibrary) {
            return directoriesLibrary.split('_')[0];
        },
        getDirectoriesLibraryId(library) {
            return `${library}_directories`;
        },
        forceArray<T>(val: T | T[]): T[] {
            return Array.isArray(val) ? val : [val];
        },
        getDefaultActionsList,
        getLibraryDefaultAttributes,
        timestampToDate(t) {
            return moment.unix(Number(t)).toDate();
        },
        dateToTimestamp(d) {
            return moment(d).unix();
        },
        isStandardAttribute(attribute) {
            return attribute.type === AttributeTypes.SIMPLE || attribute.type === AttributeTypes.ADVANCED;
        },
        isLinkAttribute(attribute) {
            return attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;
        },
        isTreeAttribute(attribute) {
            return attribute.type === AttributeTypes.TREE;
        },
        decomposeValueEdgeDestination(value) {
            const [library, id]: [string, string] = value.split('/') as [string, string];

            return {library, id};
        },
        translateError(error, lang) {
            // if error is undefined
            if (typeof error === 'undefined') {
                error = 'Unknown error';
            }

            const toTranslate = typeof error === 'string' ? {msg: error, vars: {}} : (error as IExtendedErrorMsg);

            if (!Object.keys(Errors).includes(toTranslate.msg)) {
                return toTranslate.msg;
            }

            return translator.t(('errors.' + toTranslate.msg) as string, {
                ...toTranslate.vars,
                lng: lang,
                interpolation: {escapeValue: false}
            });
        },
        getFullApplicationEndpoint(endpoint): string {
            return `${APPS_URL_PREFIX}/${endpoint ?? ''}`;
        },
        getCoreEntityCacheKey(entityType, entityId) {
            return `coreEntity:${entityType}:${entityId}`;
        },
        getRecordsCacheKey(libraryId, recordId) {
            return `records:${libraryId}:${recordId}`;
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
        },
        getProcessIdentifier() {
            return `${os.hostname()}-${process.pid}`;
        },
        getPreviewsAttributeName(libraryId) {
            return getPreviewsAttributeName(libraryId);
        },
        getPreviewsStatusAttributeName(library) {
            return getPreviewsStatusAttributeName(library);
        },
        getPreviewAttributesSettings(library) {
            const _getSizeLabel = (size: IPreviewVersionSize): ISystemTranslation =>
                config.lang.available.reduce((labels, lang) => {
                    labels[lang] = size.name;
                    return labels;
                }, {});

            const previewsSettings = library.previewsSettings;
            const previewsAttributeName = this.getPreviewsAttributeName(library.id);
            const previewsStatusAttributeName = this.getPreviewsStatusAttributeName(library.id);

            return previewsSettings.reduce(
                (allSettings: IPreviewAttributesSettings, settings) => {
                    for (const size of settings.versions.sizes) {
                        allSettings[previewsAttributeName].push({
                            id: size.name,
                            label: _getSizeLabel(size),
                            format: AttributeFormats.TEXT
                        });

                        allSettings[previewsStatusAttributeName].push({
                            id: size.name,
                            label: _getSizeLabel(size),
                            format: AttributeFormats.EXTENDED,
                            embedded_fields: [
                                {
                                    id: 'status',
                                    format: AttributeFormats.NUMERIC
                                },
                                {
                                    id: 'message',
                                    format: AttributeFormats.TEXT
                                }
                            ]
                        });
                    }
                    return allSettings;
                },
                {
                    [previewsAttributeName]: [],
                    [previewsStatusAttributeName]: []
                }
            );
        },
        previewsSettingsToVersions(previewsSettings) {
            return previewsSettings.map(settings => settings.versions);
        },
        areValuesIdentical(value1, value2) {
            const isValue1MetadataEmpty = !value1?.metadata || Object.keys(value1?.metadata).length === 0;
            const isValue2MetadataEmpty = !value2?.metadata || Object.keys(value2?.metadata).length === 0;

            const isValueIdentical = value1?.value === value2?.value;
            const isMetadataIdentical =
                (isValue1MetadataEmpty && isValue2MetadataEmpty) || isEqual(value1?.metadata, value2?.metadata);

            return isValueIdentical && isMetadataIdentical;
        }
    };
}
