// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {UpdateTaskProgress} from 'domain/helpers/updateTaskProgress';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import ExcelJS from 'exceljs';
import {i18n} from 'i18next';
import {pick} from 'lodash';
import path from 'path';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as Config from '../../_types/config';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import {ErrorTypes, Errors} from '../../_types/errors';
import {IQueryInfos} from '../../_types/queryInfos';
import {IRecord, IRecordFilterLight} from '../../_types/record';
import {ITaskFuncParams, TaskPriority, TaskType} from '../../_types/tasksManager';
import {IValue} from '../../_types/value';
import {IValidateHelper} from '../helpers/validate';
import {getValuesToDisplay} from '../../utils/helpers/getValuesToDisplay';
import LeavError from '../../errors/LeavError';

export interface IExportParams {
    library: string;
    attributes: string[];
    filters?: IRecordFilterLight[];
    ctx: IQueryInfos;
}

export interface IExportDomain {
    exportExcel(params: IExportParams, task?: ITaskFuncParams): Promise<string>;
    exportData(
        jsonMapping: string,
        elements: Array<{[libraryId: string]: string}>,
        ctx: IQueryInfos
    ): Promise<Array<{[mappingKey: string]: string}>>;
}

export interface IExportDomainDeps {
    'core.domain.record': IRecordDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.helpers.updateTaskProgress': UpdateTaskProgress;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.utils': IUtils;
    translator: i18n;
    config: Config.IConfig;
}

export default function ({
    config,
    'core.domain.record': recordDomain,
    'core.domain.helpers.validate': validateHelper,
    'core.domain.attribute': attributeDomain,
    'core.domain.library': libraryDomain,
    'core.domain.tasksManager': tasksManager,
    'core.domain.helpers.updateTaskProgress': updateTaskProgress,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.utils': utils,
    translator
}: IExportDomainDeps): IExportDomain {
    const _getFormattedValues = async (
        attribute: IAttribute,
        values: IValue[],
        ctx: IQueryInfos
    ): Promise<IValue[]> => {
        if (attribute.type === AttributeTypes.TREE) {
            values = values.map(v => ({
                ...v,
                value: v.payload?.record
            }));
        }

        if (
            attribute.type === AttributeTypes.SIMPLE_LINK ||
            attribute.type === AttributeTypes.ADVANCED_LINK ||
            attribute.type === AttributeTypes.TREE
        ) {
            for (const [i, v] of values.entries()) {
                const recordIdentity = await recordDomain.getRecordIdentity(
                    {id: v.payload.id, library: attribute.linked_library || v.payload.library},
                    ctx
                );

                values[i].payload = recordIdentity.label || v.payload.id;
            }
        }

        return values;
    };

    const _extractRecordFieldValue = async (
        record: IRecord,
        attribute: IAttribute,
        asRecord: boolean,
        ctx: IQueryInfos
    ): Promise<IRecord | IRecord[] | IValue | IValue[] | null> => {
        let res = await recordDomain.getRecordFieldValue({
            library: record.library,
            record,
            attributeId: attribute.id,
            ctx
        });

        if (res !== null && asRecord) {
            if (attribute.type === AttributeTypes.TREE) {
                res = res.map(e => e.payload.record);
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                res = res.map(e => e.payload);
            }
        }

        return res;
    };

    const _getRecFieldValue = async (
        elements: Array<IValue | IValue[]> | Array<IRecord | IRecord[]>,
        attributes: string[],
        ctx: IQueryInfos
    ): Promise<Array<IValue | IValue[]>> => {
        if (!attributes.length) {
            return elements;
        }

        const attributeProps = await attributeDomain.getAttributeProperties({id: attributes[0], ctx});

        const values = [];
        for (const elem of elements) {
            if (Array.isArray(elem)) {
                for (const e of elem) {
                    const value = await _extractRecordFieldValue(e, attributeProps, attributes.length > 1, ctx);
                    if (value !== null) {
                        values.push(value);
                    }
                }
            } else {
                const value = await _extractRecordFieldValue(elem, attributeProps, attributes.length > 1, ctx);
                if (value !== null) {
                    values.push(value);
                }
            }
        }

        return _getRecFieldValue(values, attributes.slice(1), ctx);
    };

    const _getMappingKeysByLibrary = (mapping: Record<string, string>): Record<string, string[]> =>
        Object.entries(mapping).reduce((acc, [key, value]) => {
            const libraryId = value.split('.')[0];
            (acc[libraryId] ??= []).push(key);
            return acc;
        }, {});

    const _getInDepthValue = async (
        libraryId: string,
        recordId: string,
        nestedAttribute: string[],
        ctx: IQueryInfos
    ): Promise<string> => {
        const attributeProps = await attributeDomain.getAttributeProperties({id: nestedAttribute[0], ctx});

        const recordFieldValues = await recordDomain.getRecordFieldValue({
            library: libraryId,
            record: {id: recordId},
            attributeId: nestedAttribute[0],
            ctx
        });

        let value = getValuesToDisplay(recordFieldValues)[0]?.payload;

        if (typeof value === 'undefined' || value === null) {
            return '';
        }

        if (utils.isLinkAttribute(attributeProps)) {
            return _getInDepthValue(attributeProps.linked_library, value.id, nestedAttribute.slice(1), ctx);
        } else if (nestedAttribute.length > 1) {
            if (attributeProps.format === AttributeFormats.EXTENDED) {
                value = nestedAttribute.slice(1).reduce((acc, attr) => acc[attr], JSON.parse(value));
            } else {
                throw new LeavError(
                    ErrorTypes.VALIDATION_ERROR,
                    `Attribute "${attributeProps.id}" is not an extended or a link attribute, cannot access sub-attributes`
                );
            }
        } else if (attributeProps.format === AttributeFormats.DATE_RANGE) {
            value = `${value.from} - ${value.to}`;
        }

        return String(value);
    };

    return {
        async exportData(
            jsonMapping: string,
            recordsToExport: Array<{[libraryId: string]: string}>,
            ctx: IQueryInfos
        ): Promise<Array<{[mappingKey: string]: string}>> {
            const mapping = JSON.parse(jsonMapping) as Record<string, string>;
            const mappingKeysByLibrary = _getMappingKeysByLibrary(mapping);

            const getMappingRecordValues = async (keys: string[], libraryId: string, recordId: string) =>
                keys.reduce(async (acc, key) => {
                    const nestedAttributes = mapping[key].split('.').slice(1); // first element is the library id, we delete it
                    const value = await _getInDepthValue(libraryId, recordId, nestedAttributes, ctx);
                    return {...(await acc), [key]: value};
                }, Promise.resolve({}));

            return Promise.all(
                recordsToExport.map(e =>
                    Object.entries(e).reduce(
                        async (acc, [libraryId, recordId]) => ({
                            ...(await acc),
                            ...(await getMappingRecordValues(mappingKeysByLibrary[libraryId], libraryId, recordId))
                        }),
                        Promise.resolve({})
                    )
                )
            );
        },
        async exportExcel(params: IExportParams, task?: ITaskFuncParams): Promise<string> {
            const {library, attributes, filters, ctx} = params;

            if (typeof task?.id === 'undefined') {
                const newTaskId = uuidv4();

                await tasksManager.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.export_label', {lng: lang, library})}`;
                            return labels;
                        }, {}),
                        func: {
                            moduleName: 'domain',
                            subModuleName: 'export',
                            name: 'export',
                            args: params
                        },
                        role: {
                            type: TaskType.EXPORT
                        },
                        startAt: !!task.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                        priority: TaskPriority.MEDIUM,
                        ...(!!task?.callbacks && {callbacks: task.callbacks})
                    },
                    ctx
                );

                return newTaskId;
            }

            await eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.EXPORT_START,
                    topic: null,
                    metadata: {
                        params: {
                            attributes,
                            filters
                        }
                    }
                },
                ctx
            );

            const progress = {
                recordsNb: 0,
                position: 0,
                percent: 0
            };

            const _updateTaskProgress = async (increasePosition: number, translationKey?: string) => {
                progress.position += increasePosition;
                progress.percent = await updateTaskProgress(task.id, progress.percent, ctx, {
                    position: {
                        index: progress.position,
                        total: progress.recordsNb
                    },
                    ...(translationKey && {translationKey})
                });
            };

            // separate different depths
            const attrsSplited = attributes.map(a => a.split('.'));
            const firstAttributes = attrsSplited.map(a => a[0]);

            // Validations
            await validateHelper.validateLibrary(library, ctx);
            const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);
            const libraryAttributesIds = libraryAttributes.map(a => a.id);
            const invalidAttributes = firstAttributes.filter(a => !libraryAttributesIds.includes(a));
            if (invalidAttributes.length) {
                throw utils.generateExplicitValidationError(
                    'attributes',
                    {
                        msg: Errors.INVALID_ATTRIBUTES,
                        vars: {attributes: invalidAttributes.join(', ')}
                    },
                    ctx.lang
                );
            }

            await _updateTaskProgress(0, 'tasks.export_description.elements_retrieval');

            const records = await recordDomain.find({params: {library, filters}, ctx});

            progress.recordsNb = records.list.length;

            // Create Excel document
            const workbook = new ExcelJS.Workbook();

            // Set page
            const libAttributes = await libraryDomain.getLibraryProperties(library, ctx);
            const data = workbook.addWorksheet(
                libAttributes?.label[ctx?.lang] || libAttributes?.label[config.lang.default] || library
            );

            // Set columns
            const columns = [];
            const labels = {};
            for (const a of attributes) {
                columns.push({header: a, key: a});
                const attributeProps = await attributeDomain.getAttributeProperties({id: a.split('.').pop(), ctx});
                labels[a] =
                    attributeProps?.label[ctx?.lang] || attributeProps?.label[config.lang.default] || attributeProps.id;
            }

            data.columns = columns as ExcelJS.Column[];
            data.addRow(labels);

            for (const record of records.list) {
                // keep only attributes record to export
                const subset = pick(record, firstAttributes);

                for (const attr of attrsSplited) {
                    // get values of full path attribute
                    const fieldValues = await _getRecFieldValue([record], attr, ctx);

                    // get record label or id if last attribute of full path is a link or tree type
                    const attributeProps = await attributeDomain.getAttributeProperties({
                        id: attr[attr.length - 1],
                        ctx
                    });
                    const value = await _getFormattedValues(
                        attributeProps,
                        fieldValues.flat(Infinity) as IValue[],
                        ctx
                    );

                    // set value(s) and concat them if there are several
                    subset[attr.join('.')] = value.map(v => v.payload).join(' | ');
                }

                // Add subset object record on excel row document
                data.addRow(subset);

                await _updateTaskProgress(1, 'tasks.export_description.excel_writing');
            }

            const filename = `${library}_${new Date().toLocaleDateString().split('/').join('')}_${Date.now()}.xlsx`;

            await workbook.xlsx.writeFile(`${path.resolve(config.export.directory)}/${filename}`);

            // This is a public URL users will use to retrieve files.
            // It must match the route defined in the server.
            const url = `/${config.export.endpoint}/${filename}`;
            await tasksManager.setLink(task.id, {name: 'export file', url}, ctx);

            await eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.EXPORT_END,
                    topic: {
                        library
                    },
                    metadata: {
                        file: url,
                        params: {
                            attributes,
                            filters
                        }
                    }
                },
                ctx
            );

            return task.id;
        }
    };
}
