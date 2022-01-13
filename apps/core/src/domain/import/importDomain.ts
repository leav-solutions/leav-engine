// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '../../_types/queryInfos';
import {Action, IMatch, IValue, IData, IFile} from '../../_types/import';
import {IAttribute} from '../../_types/attribute';
import {Operator, AttributeCondition} from '../../_types/record';
import {Errors} from '../../_types/errors';
import {IRecordDomain, IRecordFilterLight} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValidateHelper} from '../helpers/validate';
import ValidationError from '../../errors/ValidationError';
import fs, {linkSync} from 'fs';
import {validate} from 'jsonschema';
import {ITreeElement} from '../../_types/tree';
import path from 'path';

export const SCHEMA_PATH = path.resolve(__dirname, './import-schema.json');

export interface IImportExcelParams {
    data: string[][];
    library: string;
    mapping: string[];
    key?: string | null;
}

export interface IImportDomain {
    import(data: IFile, ctx: IQueryInfos): Promise<boolean>;
    importExcel(params: IImportExcelParams, ctx: IQueryInfos): Promise<boolean>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.helpers.validate': validateHelper = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree': treeDomain = null
}: IDeps = {}): IImportDomain {
    const _addValue = async (
        library: string,
        attribute: IAttribute,
        recordId: string,
        value: IValue,
        ctx: IQueryInfos,
        valueId?: string
    ): Promise<void> => {
        if (Array.isArray(value.value)) {
            const recordsList = await recordDomain.find({
                params: {
                    library: attribute.linked_library,
                    filters: _matchesToFilters(value.value)
                },
                ctx
            });

            // TODO: Add error handling : record not found?

            value.value = recordsList.list[0].id;
        }

        await valueDomain.saveValue({
            library,
            recordId,
            attribute: attribute.id,
            value: {value: value.value, id_value: valueId, version: value.version, metadata: value.metadata},
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
            let currentValues;

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
        const filters = matches.reduce((acc, m) => acc.concat(m, {operator: Operator.AND}), []);
        filters.pop();

        return filters.map((m: IMatch) => ({field: m.attribute, condition: AttributeCondition.EQUAL, value: m.value}));
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
                if (await treeDomain.isElementPresent({treeId, element: {library, id: e}, ctx})) {
                    await treeDomain.moveElement({
                        treeId,
                        element: {library, id: e},
                        parentTo: parent,
                        order,
                        ctx
                    });
                } else {
                    await treeDomain.addElement({
                        treeId,
                        element: {library, id: e},
                        parent,
                        order,
                        ctx
                    });
                }
            }
        }

        if (action === Action.REMOVE) {
            if (elements.length) {
                for (const e of elements) {
                    await treeDomain.deleteElement({treeId, element: {library, id: e}, deleteChildren: true, ctx});
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

    return {
        async importExcel({data, library, mapping, key}, ctx: IQueryInfos): Promise<boolean> {
            const file: IFile = {elements: [], trees: []};

            // delete first row of columns name
            data.shift();

            for (const d of data) {
                const matches =
                    key && d[mapping.indexOf(key)] !== null && typeof d[mapping.indexOf(key)] !== 'undefined'
                        ? [
                              {
                                  attribute: key,
                                  value: String(d[mapping.indexOf(key)])
                              }
                          ]
                        : [];

                file.elements.push({
                    library,
                    matches,
                    data: d
                        .filter((_, i) => mapping[i])
                        .map((e, i) => ({
                            attribute: mapping.filter(m => m !== null)[i],
                            values: [{value: String(e)}],
                            action: Action.REPLACE
                        }))
                        .filter(e => e.attribute !== 'id'),
                    links: []
                });
            }

            return this.import(file, ctx);
        },
        async import(data: IFile, ctx: IQueryInfos): Promise<boolean> {
            const schema = await fs.promises.readFile(SCHEMA_PATH);

            validate(data, JSON.parse(schema.toString()), {throwAll: true});

            const linksElements: Array<{library: string; recordIds: string[]; links: IData[]}> = [];

            // elements data
            await Promise.all(
                data.elements.map(
                    e =>
                        new Promise(async resolve => {
                            await validateHelper.validateLibrary(e.library, ctx);

                            let recordIds = await _getMatchRecords(e.library, e.matches, ctx);

                            recordIds = recordIds.length
                                ? recordIds
                                : [(await recordDomain.createRecord(e.library, ctx)).id];

                            for (const d of e.data) {
                                await _treatElement(e.library, d, recordIds, ctx);
                            }

                            linksElements.push({library: e.library, recordIds, links: e.links});

                            resolve(true);
                        })
                )
            );

            // elements links
            await Promise.all(
                linksElements.map(
                    le =>
                        new Promise(async resolve => {
                            for (const link of le.links) {
                                await _treatElement(le.library, link, le.recordIds, ctx);
                            }

                            resolve(true);
                        })
                )
            );

            // trees
            for (const t of data.trees) {
                await validateHelper.validateLibrary(t.library, ctx);

                const recordIds = await _getMatchRecords(t.library, t.matches, ctx);
                let parent;

                if (typeof t.parent !== 'undefined') {
                    const parentIds = await _getMatchRecords(t.parent.library, t.parent.matches, ctx);
                    parent = parentIds.length ? {id: parentIds[0], library: t.parent.library} : parent;
                }

                if (typeof parent === 'undefined' && !recordIds.length) {
                    throw new ValidationError<IAttribute>({id: Errors.MISSING_ELEMENTS});
                }

                await _treatTree(t.library, t.treeId, parent, recordIds, t.action, ctx, t.order);
            }

            return true;
        }
    };
}
