// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, extractArgsFromString} from '@leav/utils';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type UpdateTaskProgress} from 'domain/helpers/updateTaskProgress';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type AwilixContainer} from 'awilix';
import ExcelJS from 'exceljs';
import fs from 'fs';
import {type i18n} from 'i18next';
import JsonParser from 'jsonparse';
import {validate} from 'jsonschema';
import {ValidatorResultError} from 'jsonschema/lib/helpers';
import {nanoid} from 'nanoid';
import path from 'path';
import {type IUtils} from 'utils/utils';
import * as crypto from 'node:crypto';
import type * as Config from '_types/config';
import PermissionError from '../../errors/PermissionError';
import {AdminPermissionsActions} from '../../_types/permissions';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, type ICachesService} from '../../infra/cache/cacheService';
import {type IDbUtils} from '../../infra/db/dbUtils';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';
import {type ErrorFieldDetail, Errors} from '../../_types/errors';
import {
    Action,
    type ICacheParams,
    type IData,
    type IElement,
    type IMatch,
    ImportMode,
    ImportType,
    type ITree,
    type IValue as IImportValue,
} from '../../_types/import';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AttributeCondition, type IRecordFilterLight, Operator} from '../../_types/record';
import {type ITaskFuncParams, TaskCallbackType, TaskPriority, TaskType} from '../../_types/tasksManager';
import {type ITreeElement} from '../../_types/tree';
import {type IValue} from '../../_types/value';
import {type IValidateHelper} from '../helpers/validate';
import {type IVersionProfileDomain} from '../versionProfile/versionProfileDomain';
import {type ILogger} from '@leav/logger';
import {type ICreateRecordValueError} from 'domain/record/_types';
import getFileDataBuffer from '../../utils/helpers/getFileDataBuffer';
import getExcelData from '../../utils/helpers/getExcelData';

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
    clearDatabase?: boolean; // only for admin or system users for now
    dbMigrate?: boolean;
}

export interface IImportDomain {
    importConfig(params: IImportConfigParams, task?: ITaskFuncParams): Promise<string | undefined>;
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
    IGNORED = 'ignored',
}

interface IStat {
    elements: {[key in ImportAction]?: number};
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

export interface IImportDomainDeps {
    'core.domain.library': ILibraryDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.value': IValueDomain;
    'core.domain.tree': ITreeDomain;
    'core.domain.versionProfile': IVersionProfileDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.domain.permission': IPermissionDomain;
    'core.domain.helpers.updateTaskProgress': UpdateTaskProgress;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.cache.cacheService': ICachesService;
    'core.infra.db.dbUtils': IDbUtils;
    'core.depsManager': AwilixContainer;
    config: Config.IConfig;
    translator: i18n;
    'core.utils': IUtils;
    'core.utils.logger'?: ILogger;
}

export default function ({
    'core.domain.library': libraryDomain,
    'core.domain.record': recordDomain,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.attribute': attributeDomain,
    'core.domain.value': valueDomain,
    'core.domain.tree': treeDomain,
    'core.domain.versionProfile': versionProfileDomain,
    'core.domain.tasksManager': tasksManagerDomain,
    'core.domain.permission': permissionDomain,
    'core.domain.helpers.updateTaskProgress': updateTaskProgress,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.infra.cache.cacheService': cacheService,
    'core.infra.db.dbUtils': dbUtils,
    'core.depsManager': depsManager,
    'core.utils': utils,
    'core.utils.logger': logger,
    config,
    translator,
}: IImportDomainDeps): IImportDomain {
    const _addValue = async (
        library: string,
        attribute: IAttribute,
        recordId: string,
        value: IImportValue,
        ctx: IQueryInfos,
        valueId?: string,
    ): Promise<void> => {
        const isMatch = Array.isArray(value.payload);

        if (isMatch) {
            const recordsList = await recordDomain.find({
                params: {
                    library: attribute.type === AttributeTypes.TREE ? value.library : attribute.linked_library,
                    filters: _matchesToFilters(value.payload as IMatch[]),
                },
                ctx,
            });

            value.payload = recordsList.list[0]?.id;

            // if value is undefined, it means that we have no record for this match
            if (typeof value.payload === 'undefined') {
                throw new Error('No record found for match');
            }

            if (attribute.type === AttributeTypes.TREE) {
                const node = await treeDomain.getNodesByRecord({
                    treeId: attribute.linked_tree,
                    record: {
                        id: value.payload,
                        library: value.library,
                    },
                    ctx,
                });

                value.payload = node[0];
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
                    filters: _matchesToFilters(v.element as IMatch[]),
                },
                ctx,
            });

            const recordIdFound = recordsList.list[0]?.id;

            if (!recordIdFound) {
                logger.warn(`No record found for match ${JSON.stringify(v.element)}`);
                return acc;
            }

            const treeNode = await treeDomain.getNodesByRecord({
                treeId: v.treeId,
                record: {
                    id: recordIdFound,
                    library: v.library,
                },
                ctx,
            });

            acc[v.treeId] = treeNode[0];
            return acc;
        }, Promise.resolve({}));

        await valueDomain.saveValue({
            library,
            recordId,
            attribute: attribute.id,
            value: {payload: value.payload as string, id_value: valueId, metadata: value.metadata, version},
            ctx,
        });
    };

    const _treatElement = async (
        element: IElement,
        recordIds: string[],
        cacheParams: ICacheParams,
        progress: IProgress,
        ctx: IQueryInfos,
    ): Promise<void> => {
        const tmpData = [];

        for (const data of element.data) {
            const attrs = await attributeDomain.getLibraryAttributes(element.library, ctx);
            const libraryAttribute = attrs.find(a => a.id === data.attribute);

            if (typeof libraryAttribute === 'undefined') {
                throw new ValidationError<IAttribute>({
                    id: {msg: Errors.UNKNOWN_ATTRIBUTE, vars: {attribute: data.attribute}},
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
                path: cacheParams.cacheDataPath,
            });
            progress.elementsCached += 1;
        }
    };

    const _treatData = async (
        library: string,
        data: IData,
        recordIds: string[],
        ctx: IQueryInfos,
        libraryAttribute: IAttribute,
    ): Promise<void> => {
        for (const recordId of recordIds) {
            let currentValues: IValue[];

            if (data.action === Action.REPLACE) {
                currentValues = await valueDomain.getValues({
                    library,
                    recordId,
                    attribute: libraryAttribute.id,
                    ctx,
                });

                // if replace && multiple values, delete all old values
                if (libraryAttribute.multiple_values) {
                    for (const cv of currentValues) {
                        await valueDomain.deleteValue({
                            library,
                            recordId,
                            attribute: libraryAttribute.id,
                            value: {id_value: cv.id_value},
                            ctx,
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
                        logger.error(
                            `Error adding value for attribute ${libraryAttribute.id} on record ${recordId}: ${err.stack}`,
                        );
                        throw err;
                    }

                    utils.rethrow(
                        err,
                        translator.t('import.add_value_error', {
                            lng: ctx.lang || config.lang.default,
                            attributeId: libraryAttribute.id,
                            value: v.payload,
                        }),
                    );
                }
            }
        }
    };

    const _matchesToFilters = (matches: IMatch[]): IRecordFilterLight[] => {
        // add AND operator between matches
        const filters: Array<IMatch & {operator: Operator}> = matches.reduce(
            (acc, m) => acc.concat(m, {operator: Operator.AND}),
            [],
        );

        // delete last AND operator
        filters.pop();

        return filters.map((m: IMatch & {operator: Operator}) => {
            if (!!m.operator) {
                return {operator: m.operator};
            }

            return {
                field: m.attribute,
                condition: AttributeCondition.EQUAL,
                value: m.value,
            };
        });
    };

    const _getMatchRecords = async (library: string, matches: IMatch[], ctx: IQueryInfos): Promise<string[]> => {
        let recordIds = [];

        if (matches.length) {
            const recordsList = await recordDomain.find({
                params: {
                    library,
                    filters: _matchesToFilters(matches),
                },
                ctx,
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
        order?: number,
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
                        ctx,
                    });
                } else {
                    await treeDomain.addElement({
                        treeId,
                        element: {library, id: e},
                        parent: destination,
                        order,
                        ctx,
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
                        ctx,
                    });
                }
            }
        }
    };

    const _getStoredFileData = async (
        filename: string,
        callbackElement: (element: IElement, index: number) => Promise<void>,
        callbackTree: (element: ITree, index: number) => Promise<void>,
        ctx: IQueryInfos,
    ): Promise<boolean> =>
        new Promise((resolve, reject) => {
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

            parser.onValue = async function (data: any) {
                try {
                    if (this.stack[this.stack.length - 1]?.key === 'elements' && !!data.library) {
                        // Manage memory usage
                        // if parser.value has more than 10k items, we clear it to avoid memory leak
                        if (parser.value.length % config.import.maxStackedElements === 0) {
                            parser.value = [];
                            parser.key = 0;
                        }

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

            fileStream.on('error', reject);
            fileStream.on('data', chunk => parser.write(chunk));

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

    const _jsonSchemaValidation = async (schemaPath: string, filepath: string, ctx: IQueryInfos): Promise<void> => {
        const {size} = await fs.promises.stat(filepath);
        const megaBytesSize = size / (1024 * 1024);

        // if file is too big we validate json schema
        if (megaBytesSize > config.import.sizeLimit) {
            return;
        }

        const buffer = await getFileDataBuffer(filepath);
        const data = JSON.parse(buffer.toString('utf8'));
        const schema = await fs.promises.readFile(schemaPath);
        validate(data, JSON.parse(schema.toString()), {throwAll: true});
    };

    const _writeReport = async (
        reportFilePath: string,
        pos: string,
        err: ValidationError<any> | PermissionError<any>,
        lang: string,
    ): Promise<void> => {
        const errors = err.fields
            ? Object.values(err.fields)
                  .map(v => utils.translateError(v as string, lang))
                  .join(', ')
            : '';

        const message = err.message || '';

        await fs.promises.writeFile(reportFilePath, `${pos}: ${errors}${errors && message ? ' | ' : ''}${message}\n`, {
            flag: 'a',
        });
    };

    const _writeStats = async (reportFilePath: string, stats: Stat, lang: string) => {
        await fs.promises.writeFile(
            reportFilePath,
            `\n### ${translator.t('import.stats_title', {lng: lang}).toUpperCase()} ###\n`,
            {flag: 'a'},
        );

        if (_isExcelMapped(stats)) {
            for (const sheetIndex of Object.keys(stats)) {
                if (stats[sheetIndex].elements) {
                    await fs.promises.writeFile(
                        reportFilePath,
                        `${translator.t('import.stats_sheet_elements', {
                            lng: lang,
                            sheet: Number(sheetIndex) + 1,
                            created: stats[sheetIndex].elements[ImportAction.CREATED] || 0,
                            updated: stats[sheetIndex].elements[ImportAction.UPDATED] || 0,
                            ignored: stats[sheetIndex].elements[ImportAction.IGNORED] || 0,
                        })}\n`,
                        {flag: 'a'},
                    );
                }

                if (stats[sheetIndex].links) {
                    await fs.promises.writeFile(
                        reportFilePath,
                        `${translator.t('import.stats_sheet_links', {
                            lng: lang,
                            sheet: Number(sheetIndex) + 1,
                            links: stats[sheetIndex].links,
                        })}\n`,
                        {flag: 'a'},
                    );
                }
            }
        } else {
            await fs.promises.writeFile(
                reportFilePath,
                `${translator.t('import.stats_elements', {
                    lng: lang,
                    created: (stats as IStat).elements[ImportAction.CREATED],
                    updated: (stats as IStat).elements[ImportAction.UPDATED],
                    ignored: (stats as IStat).elements[ImportAction.IGNORED],
                })}\n`,
                {flag: 'a'},
            );

            await fs.promises.writeFile(
                reportFilePath,
                `${translator.t('import.stats_trees', {
                    lng: lang,
                    trees: (stats as IStat).trees,
                })}\n`,
                {flag: 'a'},
            );
        }
    };

    const _isExcelMapped = (stats: Stat): boolean => !(stats as IStat).elements;

    const _updateTaskProgress = async (
        progress: IProgress,
        increasePosition: number,
        translationKey: string,
        taskId: string,
        ctx: IQueryInfos,
    ) => {
        progress.position += increasePosition;
        progress.percent = await updateTaskProgress(taskId, progress.percent, ctx, {
            position: {
                index: progress.position,
                total: progress.elements + progress.treesNb + progress.elementsCached,
            },
            ...(translationKey && {translationKey}),
        });
    };

    // Temporary hack to ensure file is written in nfs due to async behavior
    // May be remove when nfs mount is sync.
    const _delayJobToEnsureFileIsWrittenInNfsDueToAsync = async () => {
        if (config.import.delayTaskExecMs > 0) {
            logger.debug(
                `Wait ${config.import.delayTaskExecMs}ms to ensure file is written in nfs due to async behavior`,
            );
            await new Promise(resolve => setTimeout(resolve, config.import.delayTaskExecMs));
        }
    };

    return {
        async importConfig(params: IImportConfigParams, task?: ITaskFuncParams): Promise<string | undefined> {
            const {filepath, ctx, forceNoTask, clearDatabase, dbMigrate} = params;

            const canClearDatabase = permissionDomain.isAdminOrSystemUser(ctx);
            if (!canClearDatabase && clearDatabase) {
                throw new PermissionError(AdminPermissionsActions.IMPORT_CONFIG_CLEAR_DATABASE);
            }

            if (!forceNoTask && typeof task?.id === 'undefined') {
                const newTaskId = crypto.randomUUID();

                await tasksManagerDomain.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.import_config_label', {
                                lng: lang,
                                filename: path.parse(filepath).name,
                            })}`;
                            return labels;
                        }, {}),
                        func: {
                            path: 'core.domain.import',
                            name: 'importConfig',
                            args: params,
                        },
                        role: {
                            type: TaskType.IMPORT_CONFIG,
                        },
                        priority: TaskPriority.MEDIUM,
                        startAt: !!task?.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                        ...(!!task?.callbacks && {callbacks: task.callbacks}),
                    },
                    ctx,
                );

                return newTaskId;
            }

            await _delayJobToEnsureFileIsWrittenInNfsDueToAsync();

            await eventsManagerDomain.sendDatabaseEvent<EventAction.CONFIG_IMPORT_START>(
                {
                    action: EventAction.CONFIG_IMPORT_START,
                    topic: null,
                },
                ctx,
            );

            if (clearDatabase) {
                logger.info('Clear database before configuration import...');
                await dbUtils.clearDatabase();
            }

            if (dbMigrate) {
                logger.info('Execute database migration script before configuration import...');
                await dbUtils.migrate(depsManager);
            }

            logger.info('Starting configuration import...');
            const reportFileName = nanoid() + '.config.report.txt';
            const reportFilePath = `${config.import.directory}/${reportFileName}`;
            const lang = ctx.lang || config.lang.default;

            try {
                await _jsonSchemaValidation(IMPORT_CONFIG_SCHEMA_PATH, filepath, ctx);
            } catch (err) {
                if (!(err instanceof ValidatorResultError)) {
                    logger.error(`Error validating JSON schema during import config task ${task.id}: ${err.stack}`);
                    throw err;
                }

                await Promise.all(err.errors.map(e => _writeReport(reportFilePath, e.path.join(' '), e, lang)));

                if (!forceNoTask) {
                    // We link report file to task
                    await tasksManagerDomain.setLink(
                        task.id,
                        {name: reportFileName, url: `/${config.import.endpoint}/${reportFileName}`},
                        ctx,
                    );
                }

                throw new Error(`Invalid JSON data. See ${reportFilePath} file for more details.`);
            }

            const buffer = await getFileDataBuffer(filepath);
            const elements = JSON.parse(buffer.toString());

            logger.info('Starting configuration import...');

            logger.info('Processing libraries...');
            if ('libraries' in elements) {
                for (const library of elements.libraries) {
                    await libraryDomain.saveLibrary((({attributes, ...rest}) => rest)(library), ctx);
                }
            }

            logger.info('Processing trees...');
            if ('trees' in elements) {
                for (const tree of elements.trees) {
                    await treeDomain.saveTree(tree, ctx);
                }
            }

            logger.info('Processing version profiles...');
            if ('version_profiles' in elements) {
                for (const versionProfile of elements.version_profiles) {
                    await versionProfileDomain.saveVersionProfile({versionProfile, ctx});
                }
            }

            logger.info('Processing attributes...');
            if ('attributes' in elements) {
                for (const attribute of elements.attributes) {
                    await attributeDomain.saveAttribute({attrData: attribute, ctx});
                }
            }

            logger.info('Add attributes to libraries...');
            if ('libraries' in elements) {
                for (const library of elements.libraries) {
                    library.attributes = library.attributes?.map((id: string) => ({id}));
                    await libraryDomain.saveLibrary({id: library.id, attributes: library.attributes}, ctx);
                }
            }

            await eventsManagerDomain.sendDatabaseEvent<EventAction.CONFIG_IMPORT_END>(
                {
                    action: EventAction.CONFIG_IMPORT_END,
                    topic: null,
                },
                ctx,
            );

            logger.info('Configuration import completed.');

            if (!forceNoTask) {
                return task.id;
            }

            return undefined;
        },
        async importData(params: IImportDataParams, task?: ITaskFuncParams): Promise<string> {
            const {filename, ctx, excelMapping} = params;

            if (typeof task?.id === 'undefined') {
                const newTaskId = crypto.randomUUID();

                await tasksManagerDomain.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.import_label', {lng: lang, filename})}`;
                            return labels;
                        }, {}),
                        func: {
                            path: 'core.domain.import',
                            name: 'importData',
                            args: params,
                        },
                        role: {
                            type: TaskType.IMPORT_DATA,
                        },
                        priority: TaskPriority.MEDIUM,
                        startAt: !!task?.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                        ...(!!task?.callbacks && {callbacks: task.callbacks}),
                    },
                    ctx,
                );

                return newTaskId;
            }

            await _delayJobToEnsureFileIsWrittenInNfsDueToAsync();

            ctx.trigger = 'data_import';
            await eventsManagerDomain.sendDatabaseEvent<EventAction.DATA_IMPORT_START>(
                {
                    action: EventAction.DATA_IMPORT_START,
                    topic: {filename},
                },
                ctx,
            );

            const reportFileName = nanoid() + '.data.report.txt';
            const reportFilePath = `${config.import.directory}/${reportFileName}`;
            const lang = ctx.lang || config.lang.default;

            const _getExcelPos = (elementIndex: number): string => {
                if (excelMapping) {
                    const sheet = excelMapping[elementIndex]?.sheet + 1 || translator.t('errors.unknown', {lng: lang});
                    const line = excelMapping[elementIndex]?.line + 1 || translator.t('errors.unknown', {lng: lang});

                    return translator.t('import.excel_pos', {lng: lang, sheet, line});
                }
                throw new Error('Missing excel mapping for element index');
            };

            try {
                await _jsonSchemaValidation(IMPORT_DATA_SCHEMA_PATH, `${config.import.directory}/${filename}`, ctx);
            } catch (err) {
                if (!(err instanceof ValidatorResultError)) {
                    logger.error(`Error validating JSON schema during import data task ${task.id}: ${err.stack}`);
                    throw err;
                }

                await Promise.all(err.errors.map(e => _writeReport(reportFilePath, e.path.join(' '), e, lang)));

                await tasksManagerDomain.setLink(
                    task.id,
                    {name: reportFileName, url: `/${config.import.endpoint}/${reportFileName}`},
                    ctx,
                );

                throw new Error(`Invalid JSON data. See ${reportFilePath} file for more details.`);
            }

            const progress: IProgress = {
                elements: 0,
                elementsCached: 0,
                treesNb: 0,
                position: 0,
                percent: 0,
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
                params.ctx,
            );

            const cacheDataPath = `${filename}-data`;
            let lastCacheIndex: number;

            let action: ImportAction;
            const stats: Stat = excelMapping ? {} : {elements: {created: 0, updated: 0, ignored: 0}, trees: 0};

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
                            const {record, valuesErrors} = await recordDomain.createRecord({
                                library: element.library,
                                ctx,
                            });

                            if (valuesErrors?.length) {
                                throw new ValidationError(
                                    valuesErrors.reduce(
                                        (acc: ErrorFieldDetail<unknown>, valueError: ICreateRecordValueError) => {
                                            acc[valueError.attribute] = valueError.message;
                                            return acc;
                                        },
                                        {} as ErrorFieldDetail<unknown>,
                                    ),
                                );
                            }
                            recordIds = [record.id];
                            action = ImportAction.CREATED;
                        } else {
                            action = ImportAction.UPDATED;
                        }
                        const cacheParams: ICacheParams = {
                            cacheDataPath,
                            cacheKey: index,
                            isCacheActive: true,
                        };

                        // update progress every 1% of progress.elements
                        if (index % (progress.elements / 100) === 0) {
                            await _updateTaskProgress(
                                progress,
                                1,
                                'tasks.import_description.elements_process',
                                task.id,
                                ctx,
                            );
                        }

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
                            logger.error(
                                `Error importing element at index ${index} during task ${task.id}: ${e.stack}`,
                            );
                            throw e;
                        }

                        const pos = excelMapping
                            ? _getExcelPos(index)
                            : translator.t('import.element_pos', {lng: lang, index});

                        await _writeReport(reportFilePath, pos, e, lang);
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

                            if (parentIds.length) {
                                parent = {id: parentIds[0], library: (tree as ITree).parent.library};
                            }
                        }

                        if (typeof parent === 'undefined' && !recordIds.length) {
                            throw new ValidationError<IAttribute>({id: Errors.MISSING_ELEMENTS});
                        }

                        await _updateTaskProgress(
                            progress,
                            1,
                            'tasks.import_description.tree_elements_process',
                            task.id,
                            ctx,
                        );
                        await _treatTree(tree.library, tree.treeId, parent, recordIds, tree.action, ctx, tree.order);

                        if (!excelMapping) {
                            (stats as IStat).trees += 1;
                        }
                    } catch (e) {
                        if (!(e instanceof ValidationError) && !(e instanceof PermissionError)) {
                            logger.error(`Error importing tree at index ${index} during task ${task.id}: ${e.stack}`);
                            throw e;
                        }

                        // Trees import is impossible with Excel file, so we don't need to check if excelMapping is defined
                        const pos = translator.t('import.tree_pos', {lng: lang, index});

                        await _writeReport(reportFilePath, pos, e, lang);
                    }
                },
                ctx,
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
                            isCacheActive: false,
                        };

                        await _treatElement(data.element, data.recordIds, cacheParams, progress, ctx);
                        if (excelMapping) {
                            const sheetIndex = excelMapping[cacheKey]?.sheet;
                            stats[sheetIndex] = stats[sheetIndex] || {};
                            stats[sheetIndex].links = stats[sheetIndex].links + data.element.data.length || 1;
                        }
                    } catch (e) {
                        if (!(e instanceof ValidationError) && !(e instanceof PermissionError)) {
                            logger.error(
                                `Error importing links/versions for element at index ${cacheKey} during task ${task.id}: ${e.stack}`,
                            );
                            throw e;
                        }

                        // cacheKey is equal to element index here
                        const pos = excelMapping
                            ? _getExcelPos(cacheKey)
                            : translator.t('import.element_pos', {lng: lang, index: cacheKey});

                        await _writeReport(reportFilePath, pos, e, lang);
                    } finally {
                        await _updateTaskProgress(
                            progress,
                            1,
                            'tasks.import_description.links_and_versions_process',
                            task.id,
                            ctx,
                        );
                    }
                } catch (err) {
                    continue;
                }
            }

            // Delete cache.
            await cacheService.getCache(ECacheType.DISK).deleteAll(cacheDataPath);

            await _writeStats(reportFilePath, stats, lang);

            // We link report file to task
            await tasksManagerDomain.setLink(
                task.id,
                {name: reportFileName, url: `/${config.import.endpoint}/${reportFileName}`},
                ctx,
            );

            await eventsManagerDomain.sendDatabaseEvent<EventAction.DATA_IMPORT_END>(
                {
                    action: EventAction.DATA_IMPORT_END,
                    topic: {filename},
                    metadata: {stats},
                },
                ctx,
            );

            return task.id;
        },
        async importExcel({filename, sheets, startAt}: IImportExcelParams, ctx: IQueryInfos): Promise<string> {
            const buffer = await getFileDataBuffer(`${config.import.directory}/${filename}`);
            const data = await getExcelData(buffer);

            const JSONFilename = filename.slice(0, filename.lastIndexOf('.')) + '.json';
            const writeStream = fs.createWriteStream(`${config.import.directory}/${JSONFilename}`, {
                flags: 'a', // 'a' means appending (old data will be preserved)
            });

            const writeLine = (line: string): Promise<void> =>
                new Promise((resolve, reject) => {
                    writeStream.write(line, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

            const header = '{"elements": [';
            await writeLine(header);

            let firstElementWritten = false;
            let elementIndex = 0;
            const excelMapping: IExcelMapping = {};
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

            for (const [indexSheet, dataSheet] of data.entries()) {
                let {
                    type,
                    library,
                    mode = DEFAULT_IMPORT_MODE,
                    mapping = [],
                    keyIndex,
                    linkAttribute,
                    keyToIndex,
                    treeLinkLibrary,
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
                                    value: String(dataLine[keyIndex]),
                                },
                            ];
                        }

                        if (type === ImportType.STANDARD) {
                            elementData = dataLine
                                .filter((_, i) => mapping[i]) // Ignore cells not mapped
                                .map((cellValue, cellIndex) => ({
                                    attribute: filteredMapping[cellIndex], // Retrieve attribute
                                    values: [{payload: String(cellValue)}],
                                    action: Action.REPLACE,
                                }))
                                .filter(cell => cell.attribute !== 'id' && cell.values[0].payload !== 'null');
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
                                    mapping[cellIndex] && cellIndex !== keyIndex && cellIndex !== keyToIndex,
                            );

                            elementLinks = [
                                {
                                    attribute: linkAttribute,
                                    values: [
                                        {
                                            library: keyToValueLibrary ?? '',
                                            payload: [{attribute: keyToAttribute, value: keyToValue}],
                                            metadata: metadataValues.reduce(
                                                (allMetadata, metadataValue, metadataValueIndex) => {
                                                    allMetadata[metadataValueIndex] = metadataValue;

                                                    return allMetadata;
                                                },
                                                {},
                                            ),
                                        },
                                    ],
                                    action: 'add',
                                },
                            ];
                        }

                        const element = {
                            library,
                            matches,
                            mode,
                            data: [...elementData, ...elementLinks],
                        };

                        // Adding element to JSON file.
                        // Add comma if not first element
                        await writeLine((firstElementWritten ? ',' : '') + JSON.stringify(element));

                        excelMapping[elementIndex++] = {sheet: indexSheet, line: indexLine + 1}; // +1 because we removed the first line

                        firstElementWritten = true;
                    }
                }
            }

            // End of file.
            await writeLine('], "trees": []}');
            await new Promise(resolve => writeStream.end(resolve));

            // Delete xlsx file
            await utils.deleteFile(`${config.import.directory}/${filename}`);

            return this.importData(
                {filename: JSONFilename, ctx, excelMapping},
                {
                    ...(!!startAt && {startAt}),
                    // Delete remaining import file.
                    callbacks: [
                        {
                            path: 'core.utils',
                            name: 'deleteFile',
                            args: [`${config.import.directory}/${JSONFilename}`],
                            type: [
                                TaskCallbackType.ON_SUCCESS,
                                TaskCallbackType.ON_FAILURE,
                                TaskCallbackType.ON_CANCEL,
                            ],
                        },
                    ],
                },
            );
        },
    };
}
