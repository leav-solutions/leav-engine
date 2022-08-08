// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {extractArgsFromString} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain, IRecordFilterLight} from 'domain/record/recordDomain';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import ExcelJS from 'exceljs';
import fs from 'fs';
import JsonParser from 'jsonparse';
import {validate} from 'jsonschema';
import LineByLine from 'line-by-line';
import path from 'path';
import * as Config from '_types/config';
import {TaskPriority, ITask} from '../../_types/tasksManager';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {
    Action,
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
import {ITreeElement} from '../../_types/tree';
import {IValue} from '../../_types/value';
import {IValidateHelper} from '../helpers/validate';

export const SCHEMA_PATH = path.resolve(__dirname, './import-schema.json');
const defaultImportMode = ImportMode.UPSERT;

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
}

export interface IImportDomain {
    import(filename: string, ctx: IQueryInfos, taskId?: string): Promise<boolean>;
    importExcel({filename, sheets}: IImportExcelParams, ctx: IQueryInfos): Promise<boolean>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.infra.cache.cacheService'?: ICachesService;
    'core.domain.tasksManager'?: ITasksManagerDomain;
    config?: Config.IConfig;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.helpers.validate': validateHelper = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.infra.cache.cacheService': cacheService = null,
    'core.domain.tasksManager': tasksManager = null,
    config = null
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

            if (typeof value.value === 'undefined') {
                // TODO: Throw
                return;
            }
        }

        await valueDomain.saveValue({
            library,
            recordId,
            attribute: attribute.id,
            value: {value: value.value, id_value: valueId, metadata: value.metadata, version: value.version},
            ctx
        });
    };

    const _treatElement = async (
        library: string,
        data: IData,
        recordIds: string[],
        ctx: IQueryInfos
    ): Promise<void> => {
        const attrs = await attributeDomain.getLibraryAttributes(library, ctx);
        const libraryAttribute = attrs.find(a => a.id === data.attribute);

        if (typeof libraryAttribute === 'undefined') {
            throw new ValidationError<IAttribute>({
                id: {msg: Errors.UNKNOWN_ATTRIBUTE, vars: {attribute: data.attribute}}
            });
        }

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
                    //TODO: handle errors properly (generate a report or something)
                    continue;
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
        callbackTree: (element: ITree) => Promise<void>
    ): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const p = new JsonParser();
            const fileStream = new LineByLine(`${config.import.directory}/${filename}`);
            let elementIndex = 0;
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

            p.onValue = async function (data: any) {
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
                        await callbackTree(data);
                        fileStream.resume();
                    }
                } catch (e) {
                    reject(e);
                }
            };

            fileStream.on('line', line => {
                p.write(line);
            });
            fileStream.on('error', () => reject(new ValidationError({id: Errors.FILE_ERROR})));
            fileStream.on('end', async () => {
                // If there are still pending callbacks we call them.
                if (callbacks.length) {
                    await callCallbacks();
                }

                resolve(true);
            });
        });
    };

    const _getFileDataBuffer = async (filename: string): Promise<Buffer> => {
        const fileStream = fs.createReadStream(`${config.import.directory}/${filename}`);

        const data = await ((): Promise<Buffer> =>
            new Promise((resolve, reject) => {
                const chunks = [];

                fileStream.on('data', chunk => chunks.push(chunk));
                fileStream.on('error', () => reject(new ValidationError({id: Errors.FILE_ERROR})));
                fileStream.on('end', () => resolve(Buffer.concat(chunks)));
            }))();

        return data;
    };

    const _jsonSchemaValidation = async (filename: string): Promise<void> => {
        const {size} = await fs.promises.stat(`${config.import.directory}/${filename}`);
        const megaBytesSize = size / (1024 * 1024);

        // if file is too big we validate json schema
        if (megaBytesSize > config.import.sizeLimit) {
            return;
        }

        const buffer = await _getFileDataBuffer(filename);
        const data = JSON.parse(buffer.toString('utf8'));
        const schema = await fs.promises.readFile(SCHEMA_PATH);
        validate(data, JSON.parse(schema.toString()), {throwAll: true});
    };

    return {
        async import(filename: string, ctx: IQueryInfos, taskId?: string): Promise<boolean> {
            if (typeof taskId === 'undefined') {
                await tasksManager.sendOrder(
                    {
                        func: {
                            moduleName: 'domain',
                            subModuleName: 'import',
                            name: 'import',
                            args: [filename, ctx]
                        },
                        startAt: Math.floor(Date.now() / 1000),
                        priority: TaskPriority.MEDIUM
                        // TODO: add callback (del local file)?
                    },
                    ctx
                );

                return true;
            }

            try {
                await _jsonSchemaValidation(filename);
            } catch (err) {
                const message = (err?.errors ?? []).map(e => e.message).join('\n');
                throw new ValidationError({}, message || err.message);
            }

            const cacheDataPath = `${filename}-links`;
            let lastCacheIndex: number;

            await _getStoredFileData(
                filename,
                // treat elements and cache links
                async (element: IElement, index: number): Promise<void> => {
                    const importMode = element.mode ?? defaultImportMode;
                    await validateHelper.validateLibrary(element.library, ctx);

                    if (element.mode === ImportMode.UPDATE && !element.matches.length) {
                        throw new ValidationError({element: Errors.NO_IMPORT_MATCHES});
                    }

                    let recordIds = await _getMatchRecords(element.library, element.matches, ctx);
                    const recordFound = !!recordIds.length;

                    // Record not found, in update mode, we just ignore it
                    if (
                        (!recordFound && element.mode === ImportMode.UPDATE) ||
                        (recordFound && element.mode === ImportMode.INSERT)
                    ) {
                        return;
                    }

                    // Create the record if it does not exist
                    if (!recordIds.length) {
                        recordIds = [(await recordDomain.createRecord(element.library, ctx)).id];
                    }

                    for (const data of element.data) {
                        await _treatElement(element.library, data, recordIds, ctx);
                    }

                    // caching element links
                    // TODO: Improvement: if no links no cache.
                    await cacheService
                        .getCache(ECacheType.DISK)
                        .storeData(
                            index.toString(),
                            JSON.stringify({library: element.library, recordIds, links: element.links}),
                            cacheDataPath
                        );

                    if (typeof lastCacheIndex === 'undefined' || index > lastCacheIndex) {
                        lastCacheIndex = index;
                    }
                },
                // treat trees
                async (tree: ITree) => {
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

                    await _treatTree(tree.library, tree.treeId, parent, recordIds, tree.action, ctx, tree.order);
                }
            );

            // treat links cached before
            for (let cacheKey = 0; cacheKey <= lastCacheIndex; cacheKey++) {
                try {
                    const cacheStringifiedObject = (
                        await cacheService.getCache(ECacheType.DISK).getData([cacheKey.toString()], cacheDataPath)
                    )[0];
                    const element = JSON.parse(cacheStringifiedObject);
                    for (const link of element.links) {
                        await _treatElement(element.library, link, element.recordIds, ctx);
                    }
                } catch (err) {
                    continue;
                }
            }

            // Delete cache.
            await cacheService.getCache(ECacheType.DISK).deleteAll(cacheDataPath);

            return true;
        },
        async importExcel({filename, sheets}: IImportExcelParams, ctx: IQueryInfos): Promise<boolean> {
            const buffer = await _getFileDataBuffer(filename);
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

            // Header of file.
            writeLine('{"elements": [');

            const sheetsToProcess = data.filter((sheet, index) => {
                return !sheets || (!!sheets?.[index] && sheets[index].type !== ImportType.IGNORE);
            });

            let firstElementWritten = false;
            for (const [indexSheet, dataSheet] of sheetsToProcess.entries()) {
                let {
                    type,
                    library,
                    mode = defaultImportMode,
                    mapping,
                    keyIndex,
                    linkAttribute,
                    keyToIndex,
                    treeLinkLibrary
                } = sheets?.[indexSheet] || {};

                mapping = mapping ?? [];

                // on mapping in file
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
                    mode = args.mode ? (String(args.mode) as ImportMode) : defaultImportMode;

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

                // Delete columns' name line.
                dataSheet.shift();

                const linkAttributeProps = linkAttribute
                    ? await attributeDomain.getAttributeProperties({id: linkAttribute, ctx})
                    : null;

                const filteredMapping = mapping.filter(m => m); // Filters null values
                for (const [index, line] of dataSheet.entries()) {
                    let matches = [];
                    let elementData = [];
                    let elementLinks = [];

                    if (typeof keyIndex !== 'undefined' && typeof line[keyIndex] !== 'undefined') {
                        const keyAttribute = mapping[keyIndex];
                        matches = [
                            {
                                attribute: keyAttribute,
                                value: String(line[keyIndex])
                            }
                        ];
                    }

                    if (type === ImportType.STANDARD) {
                        elementData = line
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
                        const keyToValue = String(line[keyToIndex]);
                        const keyToValueLibrary =
                            linkAttributeProps.type === AttributeTypes.TREE
                                ? treeLinkLibrary
                                : linkAttributeProps.linked_library;

                        const metadataValues = line.filter(
                            (_, cellIndex) => mapping[cellIndex] && cellIndex !== keyIndex && cellIndex !== keyToIndex
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
                        data: elementData,
                        links: elementLinks
                    };

                    // Adding element to JSON file.
                    // Add comma if not first element
                    writeLine((firstElementWritten ? ',' : '') + JSON.stringify(element));
                    firstElementWritten = true;
                }
            }

            // End of file.
            writeLine('], "trees": []}');

            return this.import(JSONFilename, ctx);
        }
    };
}
