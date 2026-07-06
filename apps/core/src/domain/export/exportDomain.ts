import {logger} from '@leav/logger';
import {EventAction} from '@leav/utils';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type UpdateTaskProgress} from '../helpers/updateTaskProgress';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type ITasksManagerDomain} from '../tasksManager/tasksManagerDomain';
import ExcelJS from 'exceljs';
import {type i18n} from 'i18next';
import {pick} from 'lodash';
import path from 'path';
import {type IUtils} from '../../utils/utils';
import * as crypto from 'node:crypto';
import type * as Config from '../../_types/config';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../_types/attribute';
import {Errors, ErrorTypes} from '../../_types/errors';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IRecordFilterLight} from '../../_types/record';
import {type ITaskFuncParams, TaskPriority, TaskType} from '../../_types/tasksManager';
import {type IValue} from '../../_types/value';
import {type IValidateHelper} from '../helpers/validate';
import LeavError from '../../errors/LeavError';
import {type INotificationDomain} from '../notification/notificationDomain';
import {type IExportProfileDomain} from './exportProfileDomain';

export interface IExportParams {
    library: string;
    profile: string;
    filters?: IRecordFilterLight[];
    ctx: IQueryInfos;
}

export interface IExportDomain {
    exportExcel(params: IExportParams, task?: ITaskFuncParams): Promise<string>;
}

export interface IExportDomainDeps {
    'core.domain.record': IRecordDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.helpers.updateTaskProgress': UpdateTaskProgress;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.notification': INotificationDomain;
    'core.domain.export.exportProfile': IExportProfileDomain;
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
    'core.domain.notification': notificationDomain,
    'core.domain.export.exportProfile': exportProfileDomain,
    'core.utils': utils,
    translator,
}: IExportDomainDeps): IExportDomain {
    /**
     * Decodes a string containing some HTML entities into their corresponding characters.
     * Those html string generated from https://github.com/ueberdosis/tiptap
     *
     * @remarks
     * The list of named entities handled in this function (`&amp;`, `&lt;`, `&gt;`)
     * is not exhaustive. HTML defines many more named entities (such as `&nbsp;`, `&copy;`, etc.)
     * that are not decoded by this function. For full HTML entity decoding, consider using a dedicated
     * library or extending this function to handle additional entities.
     */
    function decodeTipTapHtmlEntities(text: string): string {
        return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    const _getFormattedValues = async (
        attribute: IAttribute,
        values: IValue[],
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        if (attribute.type === AttributeTypes.TREE) {
            values = values.map(v => ({
                ...v,
                payload: v.payload?.record,
            }));
        }

        // Apply getLabel() for link attributes to get the linked entity's label
        if (
            attribute.type === AttributeTypes.SIMPLE_LINK ||
            attribute.type === AttributeTypes.ADVANCED_LINK ||
            attribute.type === AttributeTypes.TREE
        ) {
            for (const [i, v] of values.entries()) {
                const recordIdentity = await recordDomain.getRecordIdentity(
                    {id: v.payload.id, library: attribute.linked_library || v.payload.library},
                    ctx,
                );

                values[i].payload = (await recordIdentity.getLabel?.()) || v.payload.id;
            }
        }

        if (attribute.format === AttributeFormats.DATE_RANGE) {
            values = values.map(v => ({
                ...v,
                payload: JSON.stringify(v.payload),
            }));
        } else if (attribute.format === AttributeFormats.RICH_TEXT) {
            values = values.map(v => ({
                ...v,
                // Remove HTML tags and decode HTML entities for export
                payload: v.payload ? decodeTipTapHtmlEntities(v.payload.replace(/<\/?[^>]+(>|$)/g, '')) : '',
            }));
        } else if (attribute.format === AttributeFormats.BOOLEAN) {
            values = values.length ? values : [{payload: false}]; // we want to export false value if there is no value for a boolean attribute
        }

        return values;
    };

    const _extractAttributesAndColumnsFromProfile = async (
        profile: string | undefined,
        library: string,
        ctx: IQueryInfos,
    ): Promise<{attributes: string[]; columnLabels: string[]}> => {
        const columns = await exportProfileDomain.getColumnsFromProfileConfig(profile, library, ctx);
        const attributes = columns?.map(c => c.attribute);
        const columnLabels = columns?.map(c => c.columnLabel);

        if (!attributes || attributes.length === 0) {
            throw new LeavError(
                ErrorTypes.CUSTOM_CONFIG_ERROR,
                `No attributes provided for exportExcel function for library ${library}`,
            );
        }

        return {attributes, columnLabels};
    };

    return {
        async exportExcel(params: IExportParams, task?: ITaskFuncParams): Promise<string> {
            const {library, profile, filters, ctx} = params;

            // If we found a profile, extract attributes and column labels from it
            // This code has to be executed before the export, to notify the user if the profile is not valid
            const {attributes, columnLabels} = await _extractAttributesAndColumnsFromProfile(profile, library, ctx);

            if (typeof task?.id === 'undefined') {
                const newTaskId = crypto.randomUUID();

                logger.debug(`Creating export task "${newTaskId}" for library "${library}"`);
                await tasksManager.createTask(
                    {
                        id: newTaskId,
                        label: config.lang.available.reduce((labels, lang) => {
                            labels[lang] = `${translator.t('tasks.export_label', {lng: lang, library})}`;
                            return labels;
                        }, {}),
                        func: {
                            path: 'core.domain.export',
                            name: 'exportExcel',
                            args: params,
                        },
                        role: {
                            type: TaskType.EXPORT,
                        },
                        startAt: Math.floor(Date.now() / 1000),
                        priority: TaskPriority.MEDIUM,
                        ...(!!task?.callbacks && {callbacks: task.callbacks}),
                    },
                    ctx,
                );

                return newTaskId;
            }

            logger.debug(`Starting export of library "${library}" with task id "${task.id}"`);

            try {
                await eventsManagerDomain.sendDatabaseEvent<EventAction.EXPORT_START>(
                    {
                        action: EventAction.EXPORT_START,
                        topic: null,
                        metadata: {
                            params: {
                                attributes,
                                filters,
                            },
                        },
                    },
                    ctx,
                );

                const progress = {
                    recordsNb: 0,
                    position: 0,
                    percent: 0,
                };

                const _updateTaskProgress = async (increasePosition: number, translationKey?: string) => {
                    progress.position += increasePosition;
                    progress.percent = await updateTaskProgress(task.id, progress.percent, ctx, {
                        position: {
                            index: progress.position,
                            total: progress.recordsNb,
                        },
                        ...(translationKey && {translationKey}),
                    });
                };

                // separate different depths
                const attrsSplited = attributes.map(a => a.split('.'));
                const firstAttributes = attrsSplited.map(a => a[0]);

                // Validations
                await validateHelper.validateLibrary(library, ctx);
                const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);
                const libraryAttributesIds = libraryAttributes.map(a => a.id);
                // Filter out empty/null attributes before validation
                const invalidAttributes = firstAttributes.filter(
                    a => a && a !== '' && !libraryAttributesIds.includes(a),
                );
                if (invalidAttributes.length) {
                    throw utils.generateExplicitValidationError(
                        'attributes',
                        {
                            msg: Errors.INVALID_ATTRIBUTES,
                            vars: {attributes: invalidAttributes.join(', ')},
                        },
                        ctx.lang,
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
                    libAttributes?.label[ctx?.lang] || libAttributes?.label[config.lang.default] || library,
                );

                // Set columns
                const columns = [];
                const labels = {};

                for (const [index, a] of attributes.entries()) {
                    columns.push({header: columnLabels?.[index] || a, key: a});

                    // Skip API fetch for empty or null attributes
                    if (!a || a === '') {
                        labels[a] = columnLabels[index] || '';
                        continue;
                    }

                    const attributeProps = await attributeDomain.getAttributeProperties({id: a.split('.').pop(), ctx});
                    labels[a] =
                        attributeProps?.label[ctx?.lang] ||
                        attributeProps?.label[config.lang.default] ||
                        attributeProps.id;
                }

                data.columns = columns as ExcelJS.Column[];
                data.addRow(labels);

                for (const record of records.list) {
                    // keep only attributes record to export
                    const subset = pick(record, firstAttributes);

                    for (const attr of attrsSplited) {
                        const attrKey = attr.join('.');

                        // Skip API fetch for empty or null attributes
                        if (!attrKey || attrKey === '') {
                            subset[attrKey] = '';
                            continue;
                        }

                        try {
                            // get values of full path attribute
                            const fieldValues = await recordDomain.getRecordFieldValue({
                                library,
                                record,
                                attributePath: attrKey,
                                ctx,
                            });

                            // get record label or id if last attribute of full path is a link or tree type
                            const attributeProps = await attributeDomain.getAttributeProperties({
                                id: attr[attr.length - 1],
                                ctx,
                            });

                            const value = await _getFormattedValues(attributeProps, fieldValues, ctx);

                            // set value(s) and concat them if there are several
                            subset[attrKey] = value.map(v => v.payload).join(' | ');
                        } catch (error) {
                            logger.warn(
                                `Failed to extract and format value for attribute "${attrKey}" during export: ${error.message}`,
                                {error},
                            );
                            subset[attrKey] = translator.t('export.error_cell_value', {lng: ctx.lang});
                        }
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

                await eventsManagerDomain.sendDatabaseEvent<EventAction.EXPORT_END>(
                    {
                        action: EventAction.EXPORT_END,
                        topic: {
                            library,
                        },
                        metadata: {
                            file: url,
                            params: {
                                attributes,
                                filters,
                            },
                        },
                    },
                    ctx,
                );

                logger.debug(`Export of library "${library}" completed, file available at: ${url}`);

                await notificationDomain.createNotification(
                    {
                        content: {
                            level: 'success',
                            title: translator.t('notifications.export_complete_title', {lng: ctx.lang}),
                            message: translator.t('notifications.export_complete_message', {
                                lng: ctx.lang,
                                interpolation: {escapeValue: false},
                                date: new Date().toLocaleString(ctx.lang),
                            }),
                            attachments: [
                                {
                                    label: filename,
                                    url: config.server.publicUrl + url,
                                },
                            ],
                        },
                        metadata: {
                            priority: 'normal',
                            taskId: task.id,
                        },
                        recipients: {
                            userIds: [ctx.userId],
                            groupIds: [],
                        },
                        emitterUserId: ctx.userId,
                    },
                    ctx,
                );

                return task.id;
            } catch (error) {
                logger.error(`Export task "${task.id}" failed: ${error.message}`, {error});
                await notificationDomain.createNotification(
                    {
                        content: {
                            level: 'error',
                            title: translator.t('notifications.export_error_title', {lng: ctx.lang}),
                            message: translator.t('notifications.export_error_message', {
                                lng: ctx.lang,
                                interpolation: {escapeValue: false},
                                date: new Date().toLocaleString(ctx.lang),
                            }),
                        },
                        metadata: {
                            priority: 'normal',
                            taskId: task.id,
                        },
                        recipients: {
                            userIds: [ctx.userId],
                            groupIds: [],
                        },
                        emitterUserId: ctx.userId,
                    },
                    ctx,
                );

                throw error;
            }
        },
    };
}
