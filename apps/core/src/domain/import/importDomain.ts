// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, extractArgsFromString} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {UpdateTaskProgress} from 'domain/helpers/updateTaskProgress';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IRecordFilterLight} from 'domain/record/_types';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import ExcelJS from 'exceljs';
import fs from 'fs';
import {i18n} from 'i18next';
import JsonParser from 'jsonparse';
import {validate} from 'jsonschema';
import {ValidatorResultError} from 'jsonschema/lib/helpers';
import {nanoid} from 'nanoid';
import path from 'path';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {
    Action,
    ICacheParams,
    IData,
    IElement,
    IMatch,
    ImportMode,
    ImportType,
    ITree,
    IValue as IImportValue
} from '../../_types/import';
import {IQueryInfos} from '../../_types/queryInfos';
import {AttributeCondition, Operator} from '../../_types/record';
import {ITaskFuncParams, TaskCallbackType, TaskPriority, TaskType} from '../../_types/tasksManager';
import {ITreeElement} from '../../_types/tree';
import {IValue} from '../../_types/value';
import {IValidateHelper} from '../helpers/validate';
import {IVersionProfileDomain} from '../versionProfile/versionProfileDomain';

export const IMPORT_DATA_SCHEMA_PATH = path.resolve(__dirname, './import-data-schema.json');
export const IMPORT_CONFIG_SCHEMA_PATH = path.resolve(__dirname, './import-config-schema.json');

const DEFAULT_IMPORT_MODE = ImportMode.UPSERT;

export interface IImportExcelParams {
    filename: string;
    sheets?: Array<{
        type: ImportType;
        library: string;
        mode: ImportMode;
        mapping: Array<string | null>;
        keyIndex?: number;
        keyToIndex?: number;
        linkAttribute?: string;
        treeLinkLibrary?: string;
    } | null>;
    startAt?: number;
}

interface IImportDataParams {
    filename: string;
    ctx: IQueryInfos;
    excelMapping?: IExcelMapping;
}

interface IImportConfigParams {
    filepath: string;
    ctx: IQueryInfos;
    forceNoTask?: boolean;
}

export interface IImportDomain {
    importConfig(params: IImportConfigParams, task?: ITaskFuncParams): Promise<string>;
    importData(params: IImportDataParams, task?: ITaskFuncParams): Promise<string>;
    importExcel({filename, sheets, startAt}: IImportExcelParams, ctx: IQueryInfos): Promise<string>;
}

interface IExcelMapping {
    [elementIndex: number]: {sheet: number; line: number};
}

interface ICachedData {
    recordIds: string[];
    element: IElement;
}

enum ImportAction {
    CREATED = 'created',
    UPDATED = 'updated',
    IGNORED = 'ignored'
}

interface IStat {
    elements: {[key in ImportAction]?: number};
    links: number;
    trees: number;
}

type Stat = {[sheetIndex: number]: IStat} | IStat;

interface IProgress {
    elements: number;
    elementsCached: number;
    treesNb: number;
    position: number;
    percent: number;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.versionProfile'?: IVersionProfileDomain;
    'core.domain.tasksManager'?: ITasksManagerDomain;
    'core.domain.helpers.updateTaskProgress'?: UpdateTaskProgress;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.cache.cacheService'?: ICachesService;
    config?: Config.IConfig;
    translator?: i18n;
    'core.utils'?: IUtils;
}

export default function({
    'core.domain.library': libraryDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.helpers.validate': validateHelper = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.versionProfile': versionProfileDomain = null,
    'core.domain.tasksManager': tasksManagerDomain = null,
    'core.domain.helpers.updateTaskProgress': updateTaskProgress = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.utils': utils = null,
    config = null,
    translator = null
}: IDeps = {}): IImportDomain {
    const _addValue = async (
        library: string,
        attribute: IAttribute,
        recordId: string,
        value: IImportValue,
        ctx: IQueryInfos,
        valueId?: string
    ): Promise<void> => {
        const isMatch = Array.isArray(value.value);

        if (isMatch) {
            const recordsList = await recordDomain.find({
                params: {
                    library: attribute.type === AttributeTypes.TREE ? value.library : attribute.linked_library,
                    filters: _matchesToFilters(value.value as IMatch[])
                },
                ctx
            });

            value.value = recordsList.list[0]?.id;

            // if value is undefined, it means that we have no record for this match
            if (typeof value.value === 'undefined') {
                throw new Error('No record found for match');
            }

            if (attribute.type === AttributeTypes.TREE) {
                const node = await treeDomain.getNodesByRecord({
                    treeId: attribute.linked_tree,
                    record: {
                        id: value.value,
                        library: value.library
                    },
                    ctx
                });

                value.value = node[0];
            }
        }

        // if version, search record id (from leav) then node id (from tree)
        // with that, construct the version object
        const version = await value.version?.reduce(async (accProm, v) => {
            const acc = await accProm;

            if (!v.element?.length) {
                acc[v.treeId] = null;
                return acc;
            }

            const recordsList = await recordDomain.find({
                params: {
                    library: v.library,
                    filters: _matchesToFilters(v.element as IMatch[])
                },
                ctx
            });

            const recordIdFound = recordsList.list[0]?.id;

            if (!recordIdFound) {
                console.warn(`No record found for match ${JSON.stringify(v.element)}`);
                return acc;
            }

            const treeNode = await treeDomain.getNodesByRecord({
                treeId: v.treeId,
                record: {
                    id: recordIdFound,
                    library: v.library
                },
                ctx
            });

            acc[v.treeId] = treeNode[0];
            return acc;
        }, Promise.resolve({}));

        await valueDomain.saveValue({
            library,
            recordId,
            attribute: attribute.id,
            value: {value: value.value, id_value: valueId, metadata: value.metadata, version},
            ctx
        });
    };

    const _treatElement = async (
        element: IElement,
        recordIds: string[],
        cacheParams: ICacheParams,
        progress: IProgress,
        ctx: IQueryInfos
    ): Promise<void> => {
        const tmpData = [];

        for (const data of element.data) {
            const attrs = await attributeDomain.getLibraryAttributes(element.library, ctx);
            const libraryAttribute = attrs.find(a => a.id === data.attribute);

            if (typeof libraryAttribute === 'undefined') {
                throw new ValidationError<IAttribute>({
                    id: {msg: Errors.UNKNOWN_ATTRIBUTE, vars: {attribute: data.attribute}}
                });
            }

            const isTypeLink =
                libraryAttribute?.type === AttributeTypes.SIMPLE_LINK ||
                libraryAttribute?.type === AttributeTypes.ADVANCED_LINK;

            // if cacheData = true, we cache data that is not versionable and is not a link type
            const hasVersionableValue = data.values.some(v => v.version?.length);
            const isCachedData = cacheParams.isCacheActive && (hasVersionableValue || isTypeLink);
            if (isCachedData) {
                tmpData.push(data);
                continue;
            }

            // call treatData only if data.version.length === 0
            await _treatData(element.library, data, recordIds, ctx, libraryAttribute);
        }

        // if we have cached data, we cache it
        if (tmpData.length) {
            await cacheService.getCache(ECacheType.DISK).storeData({
                key: cacheParams.cacheKey.toString(),
                data: JSON.stringify({element: {...element, data: tmpData}, recordIds}),
                path: cacheParams.cacheDataPath
            });
            progress.elementsCached += 1;
        }
    };

    const _treatData = async (
        library: string,
        data: IData,
        recordIds: string[],
        ctx: IQueryInfos,
        libraryAttribute: IAttribute
    ): Promise<void> => {
        for (const recordId of recordIds) {
            let currentValues: IValue[];

            if (data.action === Action.REPLACE) {
                currentValues = await valueDomain.getValues({
                    library,
                    recordId,
                    attribute: libraryAttribute.id,
                    ctx
                });

                // if replace && multiple values, delete all old values
                if (libraryAttribute.multiple_values) {
                    for (const cv of currentValues) {
                        await valueDomain.deleteValue({
                            library,
                            recordId,
                            attribute: libraryAttribute.id,
                            value: {id_value: cv.id_value},
                            ctx
                        });
                    }
                }
            }

            for (const v of data.values) {
                try {
                    const valueId =
                        data.action === Action.REPLACE && !libraryAttribute.multiple_values
                            ? currentValues[0]?.id_value
                            : undefined;

                    await _addValue(library, libraryAttribute, recordId, v, ctx, valueId);
                } catch (err) {
                    if (!(err instanceof ValidationError) && !(err instanceof PermissionError)) {
                        throw err;
                    }

                    utils.rethrow(
                        err,
                        translator.t('import.add_value_error', {
                            lng: ctx.lang || config.lang.default,
                            attributeId: libraryAttribute.id,
                            value: v.value
                        })
                    );
                }
            }
        }
    };

    const _matchesToFilters = (matches: IMatch[]): IRecordFilterLight[] => {
        // add AND operator between matches
        const filters: Array<IMatch & {operator: Operator}> = matches.reduce(
            (acc, m) => acc.concat(m, {operator: Operator.AND}),
            []
        );

        // delete last AND operator
        filters.pop();

        const filtersLight = filters.map((m: IMatch & {operator: Operator}) => {
            if (!!m.operator) {
                return {operator: m.operator};
            }

            return {
                field: m.attribute,
                condition: AttributeCondition.EQUAL,
                value: m.value
            };
        });

        return filtersLight;
    };

    const _getMatchRecords = async (library: string, matches: IMatch[], ctx: IQueryInfos): Promise<string[]> => {
        let recordIds = [];

        if (matches.length) {
            const recordsList = await recordDomain.find({
                params: {
                    library,
                    filters: _matchesToFilters(matches)
                },
                ctx
            });

            if (recordsList.list.length) {
                recordIds = recordsList.list.map(r => r.id);
            }
        }

        return recordIds;
    };

    const _treatTree = async (
        library: string,
        treeId: string,
        parent: ITreeElement,
        elements: string[],
        action: Action,
        ctx: IQueryInfos,
        order?: number
    ) => {
        if (action === Action.UPDATE) {
            if (!elements.length) {
                throw new ValidationError<IAttribute>({id: Errors.MISSING_ELEMENTS});
            }

            for (const e of elements) {
                const record = {library, id: e};
                const elementNodes = await treeDomain.getNodesByRecord({treeId, record, ctx});
                const destination = parent
                    ? (await treeDomain.getNodesByRecord({treeId, record: parent, ctx}))[0]
                    : null;

                if (parent && !destination) {
                    throw new ValidationError({parent: Errors.UNKNOWN_PARENT});
                }

                if (elementNodes.length) {
                    // If record is at multiple places in tree, only move the first
                    await treeDomain.moveElement({
                        treeId,
                        nodeId: elementNodes[0],
                        parentTo: destination,
                        order,
                        ctx
                    });
                } else {
                    await treeDomain.addElement({
                        treeId,
                        element: {library, id: e},
                        parent: destination,
                        order,
                        ctx
                    });
                }
            }
        } else if (action === Action.REMOVE) {
            if (elements.length) {
                for (const e of elements) {
                    const record = {library, id: e};
                    const elementNodes = await treeDomain.getNodesByRecord({treeId, record, ctx});

                    for (const node of elementNodes) {
                        await treeDomain.deleteElement({treeId, nodeId: node, deleteChildren: true, ctx});
                    }
                }
            } else if (typeof parent !== 'undefined') {
                const parentNodes = await treeDomain.getNodesByRecord({treeId, record: parent, ctx});

                const children = await treeDomain.getElementChildren({treeId, nodeId: parentNodes[0], ctx});
                for (const child of children.list) {
                    await treeDomain.deleteElement({
                        treeId,
                        nodeId: child.id,
                        deleteChildren: true,
                        ctx
                    });
                }
            }
        }
    };

    const _getStoredFileData = async (
        filename: string,
        callbackElement: (element: IElement, index: number) => Promise<void>,
        callbackTree: (element: ITree, index: number) => Promise<void>,
        ctx: IQueryInfos
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const parser = new JsonParser();
            const fileStream = fs.createReadStream(`${config.import.directory}/${filename}`, {highWaterMark: 128}); // 128 characters by chunk
            let elementIndex = 0;
            let treeIndex = 0;
            let treesReached = false;

            // We stack the callbacks and after reaching a specific length we pause
            // the flow and execute them all before resuming the flow again.
            let callbacks: Array<() => Promise<void>> = [];

            const callCallbacks = async () => {
                fileStream.pause();
                await Promise.all(callbacks.map(c => c()));
                callbacks = [];
                fileStream.resume();
            };

            parser.onValue = async function(data: any) {
                try {
                    if (this.stack[this.stack.length - 1]?.key === 'elements' && !!data.library) {
                        if (callbacks.length >= config.import.groupData) {
                            await callCallbacks();
                        }

                        callbacks.push(async () => callbackElement(data, elementIndex++));
                    } else if (this.stack[this.stack.length - 1]?.key === 'trees' && !!data.treeId) {
                        // If the first tree has never been reached before we check if callbacks for
                        // elements are still pending and call them before processing the trees.
                        if (!treesReached) {
                            await callCallbacks();
                        }

                        treesReached = true;

                        // We dont stack callbacks for trees to keep the order
                        // of JSON file because of the parent attribute.
                        fileStream.pause();

                        await callbackTree(data, treeIndex++);

                        fileStream.resume();
                    }
                } catch (e) {
                    reject(e);
                }
            };

            fileStream.on('error', err =>
                reject(
                    new Error(
                        translator.t(`errors.${Errors.FILE_ERROR}`, {
                            lng: ctx.lang,
                            error: err,
                            interpolation: {escapeValue: false}
                        })
                    )
                )
            );

            fileStream.on('data', chunk => {
                parser.write(chunk);
            });

            fileStream.on('end', async () => {
                try {
                    // If there are still pending callbacks we call them.
                    if (callbacks.length) {
                        await callCallbacks();
                    }
                } catch (e) {
                    reject(e);
                }

                resolve(true);
            });
        });
    };

    const _getFileDataBuffer = async (filepath: string, ctx: IQueryInfos): Promise<Buffer> => {
        const fileStream = fs.createReadStream(filepath);

        const data = await ((): Promise<Buffer> =>
            new Promise((resolve, reject) => {
                const chunks = [];

                fileStream.on('data', chunk => chunks.push(chunk));
                fileStream.on('error', err => {
                    reject(
                        new Error(
                            translator.t(`errors.${Errors.FILE_ERROR}`, {
                                lng: ctx.lang,
                                error: err,
                                interpolation: {escapeValue: false}
                            })
                        )
                    );
                });
                fileStream.on('end', () => resolve(Buffer.concat(chunks)));
            }))();

        return data;
    };

    const _jsonSchemaValidation = async (schemaPath: string, filepath: string, ctx: IQueryInfos): Promise<void> => {
        const {size} = await fs.promises.stat(filepath);
        const megaBytesSize = size / (1024 * 1024);

        // if file is too big we validate json schema
        if (megaBytesSize > config.import.sizeLimit) {
            return;
        }

        const buffer = await _getFileDataBuffer(filepath, ctx);
        const data = JSON.parse(buffer.toString('utf8'));
        const schema = await fs.promises.readFile(schemaPath);
        validate(data, JSON.parse(schema.toString()), {throwAll: true});
    };

    const _writeReport = (fd: number, pos: string, err: ValidationError<any> | PermissionError<any>, lang: string) => {
        const errors = err.fields
            ? Object.values(err.fields)
                  .map(v => utils.translateError(v as string, lang))
                  .join(', ')
            : '';

        const message = err.message || '';

        fs.writeSync(fd, `${pos}: ${errors}${errors && message ? ' | ' : ''}${message}\n`);
    };

    const _writeStats = (fd: number, stats: Stat, lang: string) => {
        fs.writeSync(fd, `\n### ${translator.t('import.stats_title', {lng: lang}).toUpperCase()} ###\n`);

        if (_isExcelMapped(stats)) {
            for (const sheetIndex of Object.keys(stats)) {
                if (stats[sheetIndex].elements) {
                    fs.writeSync(
                        fd,
                        `${translator.t('import.stats_sheet_elements', {
                            lng: lang,
                            sheet: Number(sheetIndex) + 1,
                            created: stats[sheetIndex].elements[ImportAction.CREATED] || 0,
                            updated: stats[sheetIndex].elements[ImportAction.UPDATED] || 0,
                            ignored: stats[sheetIndex].elements[ImportAction.IGNORED] || 0
                        })}\n`
                    );
                }

                if (stats[sheetIndex].links) {
                    fs.writeSync(
                        fd,
                        `${translator.t('import.stats_sheet_links', {
                            lng: lang,
                            sheet: Number(sheetIndex) + 1,
                            links: stats[sheetIndex].links
                        })}\n`
                    );
                }
            }
        } else {
            fs.writeSync(
                fd,
                `${translator.t('import.stats_elements', {
                    lng: lang,
                    created: (stats as IStat).elements[ImportAction.CREATED],
                    updated: (stats as IStat).elements[ImportAction.UPDATED],
                    ignored: (stats as IStat).elements[ImportAction.IGNORED]
                })}\n`
            );

            fs.writeSync(
                fd,
                `${translator.t('import.stats_links', {
                    lng: lang,
                    links: (stats as IStat).links
                })}\n`
            );

            fs.writeSync(
                fd,
                `${translator.t('import.stats_trees', {
                    lng: lang,
                    trees: (stats as IStat).trees
                })}\n`
            );
        }
    };

    const _isExcelMapped = (stats: Stat): boolean => !(stats as IStat).elements;

    const _updateTaskProgress = async (
        progress: IProgress,
        increasePosition: number,
        translationKey: string,
        taskId: string,
        ctx: IQueryInfos
    ) => {
        progress.position += increasePosition;
        progress.percent = await updateTaskProgress(taskId, progress.percent, ctx, {
            position: {
                index: progress.position,
                total: progress.elements + progress.treesNb + progress.elementsCached
            },
            ...(translationKey && {translationKey})
        });
    };

    return {
        async importConfig(params: IImportConfigParams, task?: ITaskFuncParams): Promise<string> {
            const {filepath, ctx, forceNoTask} = params;

            if (!forceNoTask && typeof task?.id === 'undefined') {
                const newTaskId = uuidv4();

                await tasksManagerDomain.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.import_label', {
                                lng: lang,
                                filename: path.parse(filepath).name
                            })}`;
                            return labels;
                        }, {}),
                        func: {
                            moduleName: 'domain',
                            subModuleName: 'import',
                            name: 'importConfig',
                            args: params
                        },
                        role: {
                            type: TaskType.IMPORT_CONFIG
                        },
                        priority: TaskPriority.MEDIUM,
                        startAt: !!task?.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                        ...(!!task?.callbacks && {callbacks: task.callbacks})
                    },
                    ctx
                );

                return newTaskId;
            }

            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.CONFIG_IMPORT_START,
                    topic: null
                },
                ctx
            );

            const reportFileName = nanoid() + '.config.report.txt';
            const reportFilePath = `${config.import.directory}/${reportFileName}`;
            const lang = ctx.lang || config.lang.default;

            try {
                await _jsonSchemaValidation(IMPORT_CONFIG_SCHEMA_PATH, filepath, ctx);
            } catch (err) {
                if (!(err instanceof ValidatorResultError)) {
                    throw err;
                }

                const fd: number = fs.openSync(reportFilePath, 'as');

                for (const e of err.errors) {
                    _writeReport(fd, e.path.join(' '), e, lang);
                }

                if (!forceNoTask) {
                    // We link report file to task
                    await tasksManagerDomain.setLink(
                        task.id,
                        {name: reportFileName, url: `/${config.import.endpoint}/${reportFileName}`},
                        ctx
                    );
                }

                throw new Error(`Invalid JSON data. See ${reportFilePath} file for more details.`);
            }

            const buffer = await _getFileDataBuffer(filepath, ctx);
            const elements = JSON.parse(buffer.toString());

            console.info('Starting configuration import...');

            console.info('Processing libraries...');
            if ('libraries' in elements) {
                for (const library of elements.libraries) {
                    await libraryDomain.saveLibrary((({attributes, ...rest}) => rest)(library), ctx);
                }
            }

            console.info('Processing trees...');
            if ('trees' in elements) {
                for (const tree of elements.trees) {
                    await treeDomain.saveTree(tree, ctx);
                }
            }

            console.info('Processing version profiles...');
            if ('version_profiles' in elements) {
                for (const version_profile of elements.version_profiles) {
                    await versionProfileDomain.saveVersionProfile({versionProfile: version_profile, ctx});
                }
            }

            console.info('Processing attributes...');
            if ('attributes' in elements) {
                for (const attribute of elements.attributes) {
                    await attributeDomain.saveAttribute({attrData: attribute, ctx});
                }
            }

            console.info('Add attributes to libraries...');
            if ('libraries' in elements) {
                for (const library of elements.libraries) {
                    library.attributes = library.attributes?.map((id: string) => ({id}));
                    await libraryDomain.saveLibrary({id: library.id, attributes: library.attributes}, ctx);
                }
            }

            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.CONFIG_IMPORT_END,
                    topic: null
                },
                ctx
            );

            console.info('Configuration import completed.');

            if (!forceNoTask) {
                return task.id;
            }
        },
        async importData(params: IImportDataParams, task?: ITaskFuncParams): Promise<string> {
            const {filename, ctx, excelMapping} = params;

            if (typeof task?.id === 'undefined') {
                const newTaskId = uuidv4();

                await tasksManagerDomain.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.import_label', {lng: lang, filename})}`;
                            return labels;
                        }, {}),
                        func: {
                            moduleName: 'domain',
                            subModuleName: 'import',
                            name: 'importData',
                            args: params
                        },
                        role: {
                            type: TaskType.IMPORT_DATA
                        },
                        priority: TaskPriority.MEDIUM,
                        startAt: !!task?.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                        ...(!!task?.callbacks && {callbacks: task.callbacks})
                    },
                    ctx
                );

                return newTaskId;
            }

            ctx.trigger = 'data_import';
            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.DATA_IMPORT_START,
                    topic: {filename}
                },
                ctx
            );

            const reportFileName = nanoid() + '.data.report.txt';
            const reportFilePath = `${config.import.directory}/${reportFileName}`;
            const lang = ctx.lang || config.lang.default;
            const fd: number = fs.openSync(reportFilePath, 'as');

            const _getExcelPos = (elementIndex: number): string => {
                if (excelMapping) {
                    const sheet = excelMapping[elementIndex]?.sheet + 1 || translator.t('errors.unknown', {lng: lang});
                    const line = excelMapping[elementIndex]?.line + 1 || translator.t('errors.unknown', {lng: lang});

                    return translator.t('import.excel_pos', {lng: lang, sheet, line});
                }
            };

            try {
                await _jsonSchemaValidation(IMPORT_DATA_SCHEMA_PATH, `${config.import.directory}/${filename}`, ctx);
            } catch (err) {
                if (!(err instanceof ValidatorResultError)) {
                    throw err;
                }

                for (const e of err.errors) {
                    _writeReport(fd, e.path.join(' '), e, lang);
                }

                await tasksManagerDomain.setLink(
                    task.id,
                    {name: reportFileName, url: `/${config.import.endpoint}/${reportFileName}`},
                    ctx
                );

                throw new Error(`Invalid JSON data. See ${reportFilePath} file for more details.`);
            }

            const progress: IProgress = {
                elements: 0,
                elementsCached: 0,
                treesNb: 0,
                position: 0,
                percent: 0
            };

            // We call iterate on file a first time to estimate time of import
            await _getStoredFileData(
                filename,
                async (element: IElement, index: number): Promise<void> => {
                    progress.elements += 1;
                },
                async (tree: ITree, index: number) => {
                    progress.treesNb += 1;
                },
                params.ctx
            );

            const cacheDataPath = `${filename}-data`;
            let lastCacheIndex: number;

            let action: ImportAction;
            const stats: Stat = excelMapping
                ? {}
                : {elements: {created: 0, updated: 0, ignored: 0}, links: 0, trees: 0};

            await _getStoredFileData(
                filename,
                // Treat elements and cache links
                async (element: IElement, index: number): Promise<void> => {
                    try {
                        const importMode = element.mode ?? DEFAULT_IMPORT_MODE;
                        await validateHelper.validateLibrary(element.library, ctx);

                        if (importMode === ImportMode.UPDATE && !element.matches.length) {
                            throw new ValidationError({element: Errors.NO_IMPORT_MATCHES});
                        }

                        // required to update an existing record (find it from the matches array)
                        let recordIds = await _getMatchRecords(element.library, element.matches, ctx);
                        const recordFound = !!recordIds.length;

                        // cannot update the record if not found
                        if (!recordFound && importMode === ImportMode.UPDATE) {
                            throw new ValidationError({element: Errors.MISSING_ELEMENTS});
                        }

                        // cannot add a found record
                        if (recordFound && importMode === ImportMode.INSERT) {
                            action = ImportAction.IGNORED;
                            return;
                        }

                        // Create the record if it does not exist
                        if (!recordIds.length) {
                            recordIds = [(await recordDomain.createRecord({library: element.library, ctx})).record.id];
                            action = ImportAction.CREATED;
                        } else {
                            action = ImportAction.UPDATED;
                        }
                        const cacheParams: ICacheParams = {
                            cacheDataPath,
                            cacheKey: index,
                            isCacheActive: true
                        };
                        await _updateTaskProgress(
                            progress,
                            1,
                            'tasks.import_description.elements_process',
                            task.id,
                            ctx
                        );
                        await _treatElement(element, recordIds, cacheParams, progress, ctx);

                        // update import stats
                        if (element.data.length) {
                            if (excelMapping) {
                                const sheetIndex = excelMapping[index]?.sheet;
                                stats[sheetIndex] = stats[sheetIndex] || {elements: {}};
                                stats[sheetIndex].elements[action] = stats[sheetIndex].elements[action] + 1 || 1;
                            } else {
                                (stats as IStat).elements[action] += 1;
                            }
                        }

                        if (typeof lastCacheIndex === 'undefined' || index > lastCacheIndex) {
                            lastCacheIndex = index;
                        }
                    } catch (e) {
                        if (!(e instanceof ValidationError) && !(e instanceof PermissionError)) {
                            throw e;
                        }

                        const pos = excelMapping
                            ? _getExcelPos(index)
                            : translator.t('import.element_pos', {lng: lang, index});

                        _writeReport(fd, pos, e, lang);
                    }
                },
                // Treat trees
                async (tree: ITree, index: number) => {
                    try {
                        await validateHelper.validateLibrary(tree.library, ctx);

                        const recordIds = await _getMatchRecords(tree.library, tree.matches, ctx);
                        let parent: {id: string; library: string};

                        if (typeof tree.parent !== 'undefined') {
                            const parentIds = await _getMatchRecords(tree.parent.library, tree.parent.matches, ctx);

                            parent = parentIds.length
                                ? {id: parentIds[0], library: (tree as ITree).parent.library}
                                : parent;
                        }

                        if (typeof parent === 'undefined' && !recordIds.length) {
                            throw new ValidationError<IAttribute>({id: Errors.MISSING_ELEMENTS});
                        }

                        await _updateTaskProgress(
                            progress,
                            1,
                            'tasks.import_description.elements_process',
                            task.id,
                            ctx
                        );
                        await _treatTree(tree.library, tree.treeId, parent, recordIds, tree.action, ctx, tree.order);

                        if (!excelMapping) {
                            (stats as IStat).trees += 1;
                        }
                    } catch (e) {
                        if (!(e instanceof ValidationError) && !(e instanceof PermissionError)) {
                            throw e;
                        }

                        // Trees import is impossible with Excel file, so we don't need to check if excelMapping is defined
                        const pos = translator.t('import.tree_pos', {lng: lang, index});

                        _writeReport(fd, pos, e, lang);
                    }
                },
                ctx
            );

            // Treat cache (links and versionable values)
            for (let cacheKey = 0; cacheKey <= lastCacheIndex; cacheKey++) {
                try {
                    const cacheStringifiedObject = (
                        await cacheService.getCache(ECacheType.DISK).getData([cacheKey.toString()], cacheDataPath)
                    )[0];

                    const data: ICachedData = JSON.parse(cacheStringifiedObject);

                    try {
                        const cacheParams: ICacheParams = {
                            cacheDataPath,
                            cacheKey,
                            isCacheActive: false
                        };

                        await _treatElement(data.element, data.recordIds, cacheParams, progress, ctx);
                        if (excelMapping) {
                            const sheetIndex = excelMapping[cacheKey]?.sheet;
                            stats[sheetIndex] = stats[sheetIndex] || {};
                            stats[sheetIndex].links = stats[sheetIndex].links + 1 || 1;
                        } else {
                            (stats as IStat).links += 1;
                        }
                    } catch (e) {
                        if (!(e instanceof ValidationError) && !(e instanceof PermissionError)) {
                            throw e;
                        }

                        // cacheKey is equal to element index here
                        const pos = excelMapping
                            ? _getExcelPos(cacheKey)
                            : translator.t('import.element_pos', {lng: lang, index: cacheKey});

                        _writeReport(fd, pos, e, lang);
                    } finally {
                        await _updateTaskProgress(
                            progress,
                            1,
                            'tasks.import_description.elements_in_cache_process',
                            task.id,
                            ctx
                        );
                    }
                } catch (err) {
                    continue;
                }
            }

            // Delete cache.
            await cacheService.getCache(ECacheType.DISK).deleteAll(cacheDataPath);

            _writeStats(fd, stats, lang);

            // We link report file to task
            await tasksManagerDomain.setLink(
                task.id,
                {name: reportFileName, url: `/${config.import.endpoint}/${reportFileName}`},
                ctx
            );

            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.DATA_IMPORT_END,
                    topic: {filename},
                    metadata: {stats}
                },
                ctx
            );

            return task.id;
        },
        async importExcel({filename, sheets, startAt}: IImportExcelParams, ctx: IQueryInfos): Promise<string> {
            const buffer = await _getFileDataBuffer(`${config.import.directory}/${filename}`, ctx);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);
            const data: string[][][] = [];

            workbook.eachSheet((s, i) => {
                s.eachRow(r => {
                    let elems = (r.values as any[]).slice(1);

                    elems = Array.from(elems, e => {
                        if (typeof e === 'undefined') {
                            return null; // we replace empty cell value by null
                        } else if (typeof e === 'object') {
                            return e.result; // if cell value is a formula
                        }

                        return e;
                    });

                    if (typeof data[i - 1] === 'undefined') {
                        data[i - 1] = [];
                    }

                    data[i - 1].push(elems);
                });
            });

            const JSONFilename = filename.slice(0, filename.lastIndexOf('.')) + '.json';
            const writeStream = fs.createWriteStream(`${config.import.directory}/${JSONFilename}`, {
                flags: 'a' // 'a' means appending (old data will be preserved)
            });

            const writeLine = (line: string) => writeStream.write(line);

            const header = '{"elements": [';
            writeLine(header);

            let firstElementWritten = false;
            let elementIndex = 0;
            const excelMapping: IExcelMapping = {};

            for (const [indexSheet, dataSheet] of data.entries()) {
                let {
                    type,
                    library,
                    mode = DEFAULT_IMPORT_MODE,
                    mapping = [],
                    keyIndex,
                    linkAttribute,
                    keyToIndex,
                    treeLinkLibrary
                } = sheets?.[indexSheet] || {};

                mapping = mapping ?? [];

                // If mapping in file.
                if (typeof sheets === 'undefined') {
                    const comments = [];
                    workbook.worksheets[indexSheet].getRow(1).eachCell(cell => {
                        // Cell comment might be split in multiple texts, merge them.
                        const cellComments = ((cell.note as ExcelJS.Comment)?.texts ?? [])
                            .map(cellComm => cellComm.text)
                            .join(' ');

                        comments.push(cellComments.replace(/\n/g, ' ') || null);
                    });

                    // if mapping parameters not specified we ignore this sheet
                    if (comments[0] === null) {
                        continue;
                    }

                    // Extract args global args from comment on first column
                    const args = extractArgsFromString(comments[0]);

                    type = ImportType[String(args.type)];
                    mode = args.mode ? (String(args.mode) as ImportMode) : DEFAULT_IMPORT_MODE;

                    // if sheet type is not specified we ignore this sheet
                    if (typeof type === 'undefined' || type === ImportType.IGNORE) {
                        continue;
                    }

                    library = String(args.library);

                    // Extract mapping, keyIndex and keyToIndex from all columns comments
                    for (const [index, comm] of comments.entries()) {
                        const commArgs = extractArgsFromString(comm);
                        mapping.push(String(commArgs.id) ?? null);

                        if (commArgs.key) {
                            keyIndex = index;
                        }

                        if (commArgs.keyTo) {
                            keyToIndex = index;
                        }
                    }

                    // may be undefined if standard import
                    linkAttribute = args.linkAttribute ? String(args.linkAttribute) : null;
                    treeLinkLibrary = args.treeLinkLibrary ? String(args.treeLinkLibrary) : null;

                    if (
                        (type === ImportType.LINK &&
                            (typeof keyIndex === 'undefined' ||
                                typeof linkAttribute === 'undefined' ||
                                typeof keyToIndex === 'undefined' ||
                                !mapping[keyToIndex])) ||
                        (typeof keyIndex !== 'undefined' && !mapping[keyIndex]) ||
                        typeof library === 'undefined' ||
                        typeof mapping === 'undefined'
                    ) {
                        throw new ValidationError({mapping: `Sheet n° ${indexSheet}: Missing mapping parameters`});
                    }
                }

                if (!!sheets?.[indexSheet] && sheets[indexSheet].type !== ImportType.IGNORE) {
                    // Delete columns' name line.
                    dataSheet.shift();

                    const linkAttributeProps = linkAttribute
                        ? await attributeDomain.getAttributeProperties({id: linkAttribute, ctx})
                        : null;

                    const filteredMapping = mapping.filter(m => m); // Filters null values

                    for (const [indexLine, dataLine] of dataSheet.entries()) {
                        let matches = [];
                        let elementData = [];
                        let elementLinks = [];

                        if (typeof keyIndex !== 'undefined' && typeof dataLine[keyIndex] !== 'undefined') {
                            const keyAttribute = mapping[keyIndex];
                            matches = [
                                {
                                    attribute: keyAttribute,
                                    value: String(dataLine[keyIndex])
                                }
                            ];
                        }

                        if (type === ImportType.STANDARD) {
                            elementData = dataLine
                                .filter((_, i) => mapping[i]) // Ignore cells not mapped
                                .map((cellValue, cellIndex) => ({
                                    attribute: filteredMapping[cellIndex], // Retrieve attribute
                                    values: [{value: String(cellValue)}],
                                    action: Action.REPLACE
                                }))
                                .filter(cell => cell.attribute !== 'id');
                        }

                        if (type === ImportType.LINK) {
                            const keyToAttribute = mapping[keyToIndex];
                            const keyToValue = String(dataLine[keyToIndex]);
                            const keyToValueLibrary =
                                linkAttributeProps.type === AttributeTypes.TREE
                                    ? treeLinkLibrary
                                    : linkAttributeProps.linked_library;

                            const metadataValues = dataLine.filter(
                                (_, cellIndex) =>
                                    mapping[cellIndex] && cellIndex !== keyIndex && cellIndex !== keyToIndex
                            );

                            elementLinks = [
                                {
                                    attribute: linkAttribute,
                                    values: [
                                        {
                                            library: keyToValueLibrary ?? '',
                                            value: [{attribute: keyToAttribute, value: keyToValue}],
                                            metadata: metadataValues.reduce(
                                                (allMetadata, metadataValue, metadataValueIndex) => {
                                                    allMetadata[metadataValueIndex] = metadataValue;

                                                    return allMetadata;
                                                },
                                                {}
                                            )
                                        }
                                    ],
                                    action: 'add'
                                }
                            ];
                        }

                        const element = {
                            library,
                            matches,
                            mode,
                            data: [...elementData, ...elementLinks]
                        };

                        // Adding element to JSON file.
                        // Add comma if not first element
                        writeLine((firstElementWritten ? ',' : '') + JSON.stringify(element));

                        excelMapping[elementIndex++] = {sheet: indexSheet, line: indexLine + 1}; // +1 because we removed the first line

                        firstElementWritten = true;
                    }
                }
            }

            // End of file.
            writeLine('], "trees": []}');

            // Delete xlsx file
            await utils.deleteFile(`${config.import.directory}/${filename}`);

            return this.importData(
                {filename: JSONFilename, ctx, excelMapping},
                {
                    ...(!!startAt && {startAt}),
                    // Delete remaining import file.
                    callbacks: [
                        {
                            moduleName: 'utils',
                            name: 'deleteFile',
                            args: [`${config.import.directory}/${JSONFilename}`],
                            type: [TaskCallbackType.ON_SUCCESS, TaskCallbackType.ON_FAILURE, TaskCallbackType.ON_CANCEL]
                        }
                    ]
                }
            );
        }
    };
}
