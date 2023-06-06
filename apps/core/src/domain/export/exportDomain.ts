// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {UpdateTaskProgress} from 'domain/helpers/updateTaskProgress';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain, IRecordFilterLight} from 'domain/record/recordDomain';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import ExcelJS from 'exceljs';
import {i18n} from 'i18next';
import {pick} from 'lodash';
import path from 'path';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {IQueryInfos} from '../../_types/queryInfos';
import {IRecord} from '../../_types/record';
import {ITaskFuncParams, TaskPriority} from '../../_types/tasksManager';
import {IValue} from '../../_types/value';
import {IValidateHelper} from '../helpers/validate';

export interface IExportParams {
    library: string;
    attributes: string[];
    filters?: IRecordFilterLight[];
    ctx: IQueryInfos;
}

export interface IExportDomain {
    export(params: IExportParams, task?: ITaskFuncParams): Promise<string>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.tasksManager'?: ITasksManagerDomain;
    'core.domain.helpers.updateTaskProgress'?: UpdateTaskProgress;
    'core.utils'?: IUtils;
    translator?: i18n;
    config?: Config.IConfig;
}

export default function ({
    config = null,
    'core.domain.record': recordDomain = null,
    'core.domain.helpers.validate': validateHelper = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.tasksManager': tasksManager = null,
    'core.domain.helpers.updateTaskProgress': updateTaskProgress = null,
    'core.utils': utils = null,
    translator = null
}: IDeps = {}): IExportDomain {
    const _getFormattedValues = async (
        attribute: IAttribute,
        values: IValue[],
        ctx: IQueryInfos
    ): Promise<IValue[]> => {
        if (attribute.type === AttributeTypes.TREE) {
            values = values.map(v => ({
                ...v,
                value: v.value?.record
            }));
        }

        if (
            attribute.type === AttributeTypes.SIMPLE_LINK ||
            attribute.type === AttributeTypes.ADVANCED_LINK ||
            attribute.type === AttributeTypes.TREE
        ) {
            for (const [i, v] of values.entries()) {
                const recordIdentity = await recordDomain.getRecordIdentity(
                    {id: v.value.id, library: attribute.linked_library || v.value.library},
                    ctx
                );

                values[i].value = recordIdentity.label || v.value.id;
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
                res = Array.isArray(res) ? res.map(e => e.value.record) : res.value.record;
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                res = Array.isArray(res) ? res.map(e => e.value) : res.value;
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

        const attrProps = await attributeDomain.getAttributeProperties({id: attributes[0], ctx});

        const values = [];
        for (const elem of elements) {
            if (Array.isArray(elem)) {
                for (const e of elem) {
                    const value = await _extractRecordFieldValue(e, attrProps, attributes.length > 1, ctx);
                    if (value !== null) {
                        values.push(value);
                    }
                }
            } else {
                const value = await _extractRecordFieldValue(elem, attrProps, attributes.length > 1, ctx);
                if (value !== null) {
                    values.push(value);
                }
            }
        }

        return _getRecFieldValue(values, attributes.slice(1), ctx);
    };

    return {
        async export(params: IExportParams, task?: ITaskFuncParams): Promise<string> {
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
                        startAt: !!task.startAt ? task.startAt : Math.floor(Date.now() / 1000),
                        priority: TaskPriority.MEDIUM,
                        ...(!!task?.callbacks && {callbacks: task.callbacks})
                    },
                    ctx
                );

                return newTaskId;
            }

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
                const attrProps = await attributeDomain.getAttributeProperties({id: a.split('.').pop(), ctx});
                labels[a] = attrProps?.label[ctx?.lang] || attrProps?.label[config.lang.default] || attrProps.id;
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
                    const attrProps = await attributeDomain.getAttributeProperties({id: attr[attr.length - 1], ctx});
                    const value = await _getFormattedValues(attrProps, fieldValues.flat(Infinity) as IValue[], ctx);

                    // set value(s) and concat them if there are several
                    subset[attr.join('.')] = value.map(v => v.value).join(' | ');
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

            return task.id;
        }
    };
}
