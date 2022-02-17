// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '../../_types/queryInfos';
import {Action, IMatch, IData, IElement, ITree} from '../../_types/import';
import {IAttribute} from '../../_types/attribute';
import {Operator, AttributeCondition} from '../../_types/record';
import {IValue} from '../../_types/value';
import {Errors} from '../../_types/errors';
import {IRecordDomain, IRecordFilterLight} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValidateHelper} from '../helpers/validate';
import ValidationError from '../../errors/ValidationError';
import fs from 'fs';
import {ITreeElement} from '../../_types/tree';
import path from 'path';
import JsonParser from 'jsonparse';
import * as Config from '_types/config';
import {ICacheService} from 'infra/cache/cacheService';
import LineByLine from 'line-by-line';
import {validate} from 'jsonschema';
import ExcelJS from 'exceljs';

export const SCHEMA_PATH = path.resolve(__dirname, './import-schema.json');

export interface IImportExcelParams {
    filename: string;
    library: string;
    mapping: string[];
    key?: string | null;
}

export interface IImportDomain {
    import(filename: string, ctx: IQueryInfos): Promise<boolean>;
    importExcel({filename, library, mapping, key}, ctx: IQueryInfos): Promise<boolean>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.infra.cache.cacheService'?: ICacheService;
    config?: Config.IConfig;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.helpers.validate': validateHelper = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.infra.cache.cacheService': cacheService = null,
    config = null
}: IDeps = {}): IImportDomain {
    const _addValue = async (
        library: string,
        attribute: IAttribute,
        recordId: string,
        value: IValue,
        ctx: IQueryInfos,
        valueId?: string
    ): Promise<void> => {
        const isMatch = Array.isArray(value.value);

        if (isMatch) {
            const recordsList = await recordDomain.find({
                params: {
                    library: attribute.linked_library,
                    filters: _matchesToFilters(value.value)
                },
                ctx
            });

            value.value = recordsList.list[0]?.id;
        }

        if (isMatch && typeof value.value === 'undefined') {
            // TODO: Throw
            return;
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
            throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
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
                            valueId: cv.id_value,
                            ctx
                        });
                    }
                }
            }

            for (const v of data.values) {
                const valueId =
                    data.action === Action.REPLACE && !libraryAttribute.multiple_values
                        ? currentValues[0]?.id_value
                        : undefined;

                await _addValue(library, libraryAttribute, recordId, v, ctx, valueId);
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

            for (const element of elements) {
                if (await treeDomain.isElementPresent({treeId, element: {library, id: element}, ctx})) {
                    await treeDomain.moveElement({
                        treeId,
                        element: {library, id: element},
                        parentTo: parent,
                        order,
                        ctx
                    });
                } else {
                    await treeDomain.addElement({
                        treeId,
                        element: {library, id: element},
                        parent,
                        order,
                        ctx
                    });
                }
            }
        } else if (action === Action.REMOVE) {
            if (elements.length) {
                for (const element of elements) {
                    await treeDomain.deleteElement({
                        treeId,
                        element: {library, id: element},
                        deleteChildren: true,
                        ctx
                    });
                }
            } else if (typeof parent !== 'undefined') {
                const children = await treeDomain.getElementChildren({treeId, element: parent, ctx});

                for (const c of children) {
                    await treeDomain.deleteElement({
                        treeId,
                        element: {library: c.record?.library, id: c.record?.id},
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
                    if (callbacks.length >= config.import.groupData) {
                        await callCallbacks();
                    }

                    if (this.stack[this.stack.length - 1]?.key === 'elements' && !!data.library) {
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
        async import(filename: string, ctx: IQueryInfos): Promise<boolean> {
            await _jsonSchemaValidation(filename);

            const cacheDataType = `${filename}-links`;
            let lastCacheIndex: number;

            await _getStoredFileData(
                filename,
                // treat elements and cache links
                async (element: IElement, index: number): Promise<void> => {
                    await validateHelper.validateLibrary(element.library, ctx);

                    let recordIds = await _getMatchRecords(element.library, element.matches, ctx);

                    // if not match we create a new record
                    if (!recordIds.length) {
                        recordIds = [(await recordDomain.createRecord(element.library, ctx)).id];
                    }

                    for (const data of element.data) {
                        await _treatElement(element.library, data, recordIds, ctx);
                    }

                    // caching element links
                    await cacheService.storeData(
                        cacheDataType,
                        index.toString(),
                        JSON.stringify({library: element.library, recordIds, links: element.links}) // FIXME: if no links cache null
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
                const cacheStringifiedObject = await cacheService.getData(cacheDataType, cacheKey.toString());
                const element = JSON.parse(cacheStringifiedObject);
                for (const link of element.links) {
                    await _treatElement(element.library, link, element.recordIds, ctx);
                }
            }

            await cacheService.deleteAll(cacheDataType);

            return true;
        },
        async importExcel({filename, library, mapping, key}, ctx: IQueryInfos): Promise<boolean> {
            // convert excel to json
            // before calling this.import

            return true;
            // const buffer = await _getFileDataBuffer(filename);
            // const workbook = new ExcelJS.Workbook();

            // await workbook.xlsx.load(buffer);
            // const data: string[][] = [];

            // workbook.eachSheet(s => {
            //     s.eachRow(r => {
            //         let elem = (r.values as string[]).slice(1);

            //         // replace empty item by null
            //         elem = Array.from(elem, e => (typeof e !== 'undefined' ? e : null));

            //         data.push(elem);
            //     });
            // });

            // const file: IFile = {elements: [], trees: []};

            // // delete first row of columns name
            // data.shift();

            // for (const d of data) {
            //     const matches =
            //         key && d[mapping.indexOf(key)] !== null && typeof d[mapping.indexOf(key)] !== 'undefined'
            //             ? [
            //                   {
            //                       attribute: key,
            //                       value: String(d[mapping.indexOf(key)])
            //                   }
            //               ]
            //             : [];

            //     const element = {
            //         library,
            //         matches,
            //         data: d
            //             .filter((_, i) => mapping[i])
            //             .map((e, i) => ({
            //                 attribute: mapping.filter(m => m !== null)[i],
            //                 values: [{value: String(e)}],
            //                 action: Action.REPLACE
            //             }))
            //             .filter(e => e.attribute !== 'id'),
            //         links: []
            //     };

            //     file.elements.push(element);
            // }

            // return this.import(file, ctx);
        }
    };
}
