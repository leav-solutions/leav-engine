// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain, IRecordFiltersLight} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {validate} from 'jsonschema';
import ValidationError from '../../errors/ValidationError';
import {IAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {Action, IData, IFile, IMatch, IValue} from '../../_types/import';
import {IQueryInfos} from '../../_types/queryInfos';
import {Operator} from '../../_types/record';
import {ITreeElement} from '../../_types/tree';
import {IValidateHelper} from '../helpers/validate';

export const SCHEMA_PATH = './import-schema.json';

export interface IImportExcelParams {
    data: string[][];
    library: string;
    mapping: Array<string | null>;
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

    const _matchesToFilters = (matches: IMatch[]): IRecordFiltersLight => {
        const filters = matches.reduce((m, acc) => m.concat(acc, {operator: Operator.AND}), []);
        filters.pop();

        return filters.map((m: IMatch) => ({field: m.attribute, value: m.value}));
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

            const dataToImport = [...data];

            const columnsCount = dataToImport.length ? dataToImport[0].length : 0;

            if (mapping.length !== columnsCount) {
                throw new ValidationError<IImportExcelParams>({mapping: Errors.INVALID_MAPPING});
            }

            // delete first row of columns name
            dataToImport.shift();

            for (const d of dataToImport) {
                const matches = key
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
                    data: d.reduce((rowData, cellData, i) => {
                        if (mapping[i] && mapping[i] !== 'id') {
                            rowData.push({
                                attribute: mapping[i],
                                values: [{value: String(cellData)}],
                                action: Action.REPLACE
                            });
                        }

                        return rowData;
                    }, []),
                    links: []
                });
            }

            return this.import(file, ctx);
        },
        async import(data: IFile, ctx: IQueryInfos): Promise<boolean> {
            const schema = await import(SCHEMA_PATH);

            validate(data, schema, {throwAll: true});

            // elements
            for (const e of data.elements) {
                await validateHelper.validateLibrary(e.library, ctx);

                let recordIds = await _getMatchRecords(e.library, e.matches, ctx);

                recordIds = recordIds.length ? recordIds : [(await recordDomain.createRecord(e.library, ctx)).id];

                for (const d of e.data) {
                    await _treatElement(e.library, d, recordIds, ctx);
                }

                for (const l of e.links) {
                    await _treatElement(e.library, l, recordIds, ctx);
                }
            }

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
