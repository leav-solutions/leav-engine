// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, localizedTranslation} from '@leav/utils';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {type SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {type IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {type IGetDefaultElementHelper} from 'domain/tree/helpers/getDefaultElement';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import {type IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {type IRecordRepo} from 'infra/record/recordRepo';
import {type ITreeRepo} from 'infra/tree/treeRepo';
import {type IValueRepo} from 'infra/value/valueRepo';
import {type IUtils} from 'utils/utils';
import {type ILogger} from '@leav/logger';
import type * as Config from '_types/config';
import {type IRecordFilterLight, type IRecord} from '_types/record';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes, type IAttribute, ValueVersionMode} from '../../_types/attribute';
import {type ErrorFieldDetail, Errors, ErrorTypes} from '../../_types/errors';
import {
    AttributeDependentValuesPermissionsActions,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {
    type IValueVersion,
    type IFindValueTree,
    type ISaveValue,
    type IStandardValue,
    type IValue,
    type IValuesOptions,
    type IDistinctValue,
} from '../../_types/value';
import {type IActionsListDomain} from '../actionsList/actionsListDomain';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IValidateHelper} from '../helpers/validate';
import {type IAttributeDependentValuesPermissionDomain} from 'domain/permission/attributeDependentValuesPermissionDomain';
import {type IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import canSaveRecordValue, {IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS} from './helpers/canSaveRecordValue';
import findValue from './helpers/findValue';
import prepareValue from './helpers/prepareValue';
import postSaveValue from './helpers/postSaveValue';
import postDeleteValue from './helpers/postDeleteValue';
import saveOneValue from './helpers/saveOneValue';
import validateValue from './helpers/validateValue';
import {type IDeleteValueParams, type IRunActionListParams} from './_types';
import {type DeleteRecordHelper} from 'domain/record/helpers/deleteRecord';
import {type CreateRecordHelper} from 'domain/record/helpers/createRecord';
import {type IfLibraryJoinLinkAttribute} from '../attribute/helpers/ifLibraryJoinLinkAttribute';
import {type IRecordInCreationBypassHelper} from '../permission/helpers/recordInCreationBypass';
import {type FindRecordsHelper} from 'domain/record/helpers/findRecords';
import areValuesIdentical from './helpers/areValuesIdentical';

export interface ISaveBatchValueError {
    type: string;
    message: string;
    input: string;
    attribute: string;
}

export interface ISaveBatchValueResult {
    values: IValue[];
    errors: ISaveBatchValueError[];
}

export interface IValueDomain {
    /**
     * Call DB to get the value of an attribute.
     * Prefer to use `recordDomain.getRecordFieldValue()` which is more optimized in certain situations.
     *
     * @param {Object} params
     * @param params.library
     * @param params.recordId
     * @param params.attribute
     * @param params.options
     * @param params.ctx
     */
    getValues({
        library,
        recordId,
        attribute,
        options,
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: string;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;

    /**
     * Save value takes one value as parameter, apply all actions that can return multiple values and return them
     * @example [inheritance, calculation, etc].
     */
    saveValue({
        library,
        recordId,
        attribute,
        value,
        ctx,
    }: {
        library: string;
        recordId: string;
        attribute: string;
        value: ISaveValue;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;

    /**
     * Save multiple values independently (possibly different attributes or versions).
     * If one of the value must not be saved (invalid value or user doesn't have permissions), no value is saved at all
     *
     * keepEmpty If false, empty values will be deleted (or not saved)
     */
    saveValueBatch(params: {
        library: string;
        recordId: string;
        values: ISaveValue[];
        ctx: IQueryInfos;
        keepEmpty?: boolean;
        skipPermission?: boolean;
    }): Promise<ISaveBatchValueResult>;

    deleteValue(params: IDeleteValueParams): Promise<IValue[]>;

    formatValue(params: {
        attribute: IAttribute;
        value: IValue;
        record: IRecord;
        library: string;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    /**
     * Get the value of targeted attribute with actions applied on it including metadata.
     *
     * Avoid requesting DB if attribute already found in `record` param.
     *
     * @param {Object} params
     * @param params.library
     * @param params.record Could be emulated with only `{ id: <real_id> }`
     * @param params.attributeId
     * @param params.options
     * @param params.ctx
     */
    getRecordFieldValue(params: {
        library: string;
        record: IRecord;
        attributeId: string;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;

    listDistinctValues({
        libraryId,
        attributeId,
        recordFilters,
        options,
        ctx,
    }: {
        libraryId: string;
        attributeId: string;
        recordFilters: IRecordFilterLight[];
        options?: {version?: IValueVersion};
        ctx: IQueryInfos;
    }): Promise<IDistinctValue>;
}

export interface IValueDomainDeps {
    config: Config.IConfig;
    'core.domain.actionsList': IActionsListDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.permission.attributeDependentValues': IAttributeDependentValuesPermissionDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.helpers.updateRecordLastModif': UpdateRecordLastModifFunc;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.domain.tree.helpers.getDefaultElement': IGetDefaultElementHelper;
    'core.domain.record.helpers.sendRecordUpdateEvent': SendRecordUpdateEventHelper;
    'core.domain.record.helpers.createRecord': CreateRecordHelper;
    'core.domain.record.helpers.deleteRecord': DeleteRecordHelper;
    'core.domain.record.helpers.findRecords': FindRecordsHelper;
    'core.domain.permission.helpers.recordInCreationBypass': IRecordInCreationBypassHelper;
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': IfLibraryJoinLinkAttribute;
    'core.domain.versionProfile': IVersionProfileDomain;
    'core.infra.record': IRecordRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.value': IValueRepo;
    'core.utils': IUtils;
    'core.utils.logger': ILogger;
    'core.domain.tree': ITreeDomain;
}

const valueDomain = function ({
    config,
    'core.domain.actionsList': actionsListDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.permission.attributeDependentValues': attributeDependentValuesPermissionDomain,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.eventsManager': eventsManager,
    'core.domain.helpers.validate': validate,
    'core.domain.helpers.updateRecordLastModif': updateRecordLastModif,
    'core.domain.tree.helpers.elementAncestors': elementAncestors,
    'core.domain.tree.helpers.getDefaultElement': getDefaultElementHelper,
    'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent,
    'core.domain.record.helpers.createRecord': createRecordHelper,
    'core.domain.record.helpers.findRecords': findRecordsHelper,
    'core.domain.permission.helpers.recordInCreationBypass': recordInCreationBypassHelper,
    'core.domain.record.helpers.deleteRecord': deleteRecordHelper,
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': ifLibraryJoinLinkAttribute,
    'core.domain.versionProfile': versionProfileDomain,
    'core.infra.record': recordRepo,
    'core.infra.tree': treeRepo,
    'core.infra.value': valueRepo,
    'core.utils': utils,
    'core.utils.logger': logger,
}: IValueDomainDeps): IValueDomain {
    /**
     * Extract value from record if it's available (attribute simple), or fetch it from DB
     *
     * @param record
     * @param attribute
     * @param library
     * @param options
     * @param ctx
     */
    const _extractRecordValue = async (
        record: IRecord,
        attribute: IAttribute,
        library: string,
        options: IValuesOptions,
        ctx: IQueryInfos,
    ): Promise<IValue[]> => {
        let values: IValue[];

        if (attribute.id && typeof record[attribute.id] !== 'undefined') {
            // Format attribute field into simple value
            values = [
                {
                    payload:
                        attribute.type === AttributeTypes.SIMPLE_LINK && typeof record[attribute.id] === 'string'
                            ? {id: record[attribute.id]}
                            : record[attribute.id],
                },
            ];

            // Apply actionsList
            values = await _runActionsList({
                listName: ActionsListEvents.GET_VALUE,
                values,
                attribute,
                record,
                library,
                ctx,
            });
        } else {
            values = await _getValues({
                library,
                recordId: record.id,
                attribute: attribute.id,
                options,
                ctx,
            });
        }

        return values;
    };

    /**
     * Run actions list on a value
     *
     * @param listName
     * @param value
     * @param attrProps
     * @param record
     * @param library
     * @param ctx
     */
    const _runActionsList = async ({
        listName,
        values,
        attribute: attrProps,
        record,
        library,
        ctx,
    }: IRunActionListParams) => {
        const valuesToProcess = utils.isStandardAttribute(attrProps)
            ? values.map(value => ({...value, raw_payload: value.payload}))
            : values;

        try {
            const processedValues =
                !!attrProps.actions_list?.[listName] && values !== null
                    ? await actionsListDomain.runActionsList(attrProps.actions_list[listName], valuesToProcess, {
                          ...ctx,
                          attribute: attrProps,
                          recordId: record?.id,
                          library,
                          actionEvent: listName,
                      })
                    : valuesToProcess;
            return processedValues;
        } catch (e) {
            // If ValidationError, add some context about value to the error and throw it again
            if (e.type === ErrorTypes.VALIDATION_ERROR) {
                e.context = {
                    attribute: attrProps.id,
                    values,
                    recordId: record?.id,
                };
            }
            throw e;
        }
    };

    const _formatValue = async ({
        attribute,
        value,
        ctx,
    }: {
        attribute: IAttribute;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue> => {
        let processedValue = {...value}; // Don't mutate given value

        if (utils.isLinkAttribute(attribute)) {
            const linkValue = processedValue.payload
                ? {...processedValue.payload, library: processedValue.payload.library ?? attribute.linked_library}
                : null;
            processedValue = {...value, payload: linkValue};
        }

        processedValue.attribute = attribute.id;

        // Format metadata values as well
        if ((attribute.metadata_fields ?? []).length) {
            const metadataValuesFormatted = await attribute.metadata_fields.reduce(
                async (allValuesProm, metadataField) => {
                    const allValues = await allValuesProm;
                    try {
                        const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                            id: metadataField,
                            ctx,
                        });

                        allValues[metadataField] =
                            typeof value.metadata?.[metadataField] !== 'undefined'
                                ? await _formatValue({
                                      attribute: metadataAttributeProps,
                                      value: {payload: value.metadata?.[metadataField]},
                                      ctx,
                                  })
                                : null;
                    } catch (err) {
                        logger.error(`Error formatting metadata field ${metadataField} : ${err.stack}`);
                        allValues[metadataField] = null;
                    }

                    return allValues;
                },
                Promise.resolve({}),
            );
            processedValue.metadata = metadataValuesFormatted;
        }

        return processedValue;
    };

    async function _isLastValue(params: {
        attribute: IAttribute;
        library: string;
        recordId: string;
        reverseLink?: IAttribute;
        ctx: IQueryInfos;
    }): Promise<boolean> {
        const {attribute, library, recordId, reverseLink, ctx} = params;

        const values = await valueRepo.getValues({
            library,
            recordId,
            attribute: {...attribute, reverse_link: reverseLink},
            ctx,
        });

        return values.length === 1;
    }

    async function _getExistingValue(params: {
        value: IValue;
        attribute: IAttribute;
        library: string;
        recordId: string;
        reverseLink?: IAttribute;
        ctx: IQueryInfos;
    }): Promise<IValue> {
        const {value, attribute, library, recordId, reverseLink, ctx} = params;

        let v: IValue;
        if (attribute.multiple_values === false) {
            v = (
                await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: {...attribute, reverse_link: reverseLink},
                    ctx,
                })
            ).pop();
        } else if (
            attribute.type === AttributeTypes.ADVANCED_LINK &&
            reverseLink?.type === AttributeTypes.SIMPLE_LINK
        ) {
            const values = await valueRepo.getValues({
                library,
                recordId,
                attribute: {...attribute, reverse_link: reverseLink},
                ctx,
            });

            v = values.filter(val => val.id_value === value.id_value).pop();
        } else if (!!value?.id_value) {
            v = await valueRepo.getValueById({
                library,
                recordId,
                attribute,
                valueId: value.id_value,
                ctx,
            });
        }

        return v;
    }

    const _maybeCreateJoinRecord = async (
        validationErrors: ErrorFieldDetail<IValue>,
        attributeProps: IAttribute,
        value: IValue,
        ctx: IQueryInfos,
    ): Promise<string | void> => {
        const errorType: Errors = validationErrors[attributeProps.id]?.msg;
        if (errorType === Errors.UNKNOWN_LINKED_RECORD || errorType === Errors.NODE_NOT_IN_TREE) {
            return ifLibraryJoinLinkAttribute(
                attributeProps,
                async (joinLibId: string, joinAttributeProps: IAttribute) => {
                    const joinRecord = await createRecordHelper({
                        library: joinLibId,
                        ctx,
                        active: true,
                    });

                    logger.debug(
                        `Created join record ${joinRecord.id} on library ${joinLibId} for attribute ${attributeProps.id}`,
                    );
                    await saveValue({
                        library: joinLibId,
                        recordId: joinRecord.id,
                        attribute: joinAttributeProps.id,
                        value: {
                            // simple link from join record to "thematic"
                            // or tree link from join record to "category" node
                            payload: value.payload,
                        },
                        ctx,
                    });

                    return joinRecord.id;
                },
                ctx,
            );
        }
    };

    const _maybeDeleteJoinRecord = async (
        attributeProps: IAttribute,
        deletedValues: IValue[],
        ctx: IQueryInfos,
    ): Promise<void> =>
        ifLibraryJoinLinkAttribute(
            attributeProps,
            async (joinLibId: string) => {
                await Promise.all(
                    deletedValues.map(async deletedValue => {
                        const deleteJoinRecord = await deleteRecordHelper(joinLibId, deletedValue.payload.id, ctx);
                        logger.debug(
                            `Deleted join record ${deleteJoinRecord.id} on library ${joinLibId} for attribute ${attributeProps.id}`,
                        );
                    }),
                );
            },
            ctx,
        );

    const _maybeDeactivateLinkedRecord = async (
        attributeProps: IAttribute,
        reverseLink: IAttribute | undefined,
        deletedValues: IValue[],
        ctx: IQueryInfos,
    ): Promise<void> => {
        if (attributeProps.type === AttributeTypes.ADVANCED_LINK && reverseLink?.type === AttributeTypes.SIMPLE_LINK) {
            await saveValue({
                library: attributeProps.linked_library,
                recordId: deletedValues[0].payload.id,
                attribute: 'active',
                value: {payload: false},
                ctx,
            });
        }
    };

    const _executeDeleteValue = async ({library, recordId, attribute, value, skipActions, ctx}: IDeleteValueParams) => {
        if (IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS.includes(attribute)) {
            throw new ValidationError<IValue>({
                attribute: {msg: Errors.IMMUTABLE_CORE_SYSTEM_ATTRIBUTE, vars: {attribute}},
            });
        }

        // Check permission
        const canUpdateRecord = await recordPermissionDomain.getRecordPermission({
            action: RecordPermissionsActions.EDIT_RECORD,
            library,
            recordId,
            ctx,
        });

        if (!canUpdateRecord) {
            throw new PermissionError(RecordPermissionsActions.EDIT_RECORD);
        }

        const isAllowedToDelete = await recordAttributePermissionDomain.getRecordAttributePermission(
            RecordAttributePermissionsActions.EDIT_VALUE,
            attribute,
            library,
            recordId,
            ctx,
        );

        if (!isAllowedToDelete) {
            throw new PermissionError(RecordAttributePermissionsActions.EDIT_VALUE);
        }

        const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});

        if (attributeProps.type === AttributeTypes.TREE) {
            const canModifyToValue =
                await attributeDependentValuesPermissionDomain.getAttributeDependentValuesPermission({
                    action: AttributeDependentValuesPermissionsActions.SET_VALUE,
                    attributeId: attributeProps.id,
                    recordLibrary: library,
                    recordId,
                    valueNodeId: null,
                    ctx,
                });

            if (!canModifyToValue) {
                throw new PermissionError(AttributeDependentValuesPermissionsActions.SET_VALUE);
            }
        }

        let reverseLink: IAttribute | undefined;
        if (!!attributeProps.reverse_link) {
            reverseLink = await attributeDomain.getAttributeProperties({
                id: attributeProps.reverse_link as string,
                ctx,
            });
        }

        const attributeIsLinkedToLibrary =
            (await attributeDomain.getAttributeLibraries({attributeId: attribute, ctx})).find(l => l.id === library) !==
            undefined;

        if (attributeIsLinkedToLibrary) {
            const deletingLastValue =
                !attributeProps.multiple_values ||
                (await _isLastValue({
                    attribute: attributeProps,
                    library,
                    recordId,
                    ctx,
                    reverseLink,
                }));

            const attributeLabel =
                typeof attributeProps.label === 'string'
                    ? attributeProps.label
                    : localizedTranslation(attributeProps.label, [ctx.lang]);

            const inCreationBypass = await recordInCreationBypassHelper.recordInCreationBypassById(
                library,
                recordId,
                ctx,
            );

            if (attributeProps.required && !inCreationBypass && deletingLastValue) {
                throw new ValidationError<IValue>({
                    [attribute]: {
                        msg: Errors.REQUIRED_ATTRIBUTE,
                        vars: {attribute: attributeLabel},
                    },
                });
            }
        }

        const existingValue: IValue = await _getExistingValue({
            value,
            attribute: attributeProps,
            library,
            recordId,
            reverseLink,
            ctx,
        });

        if (value && !existingValue) {
            throw new ValidationError({id: Errors.UNKNOWN_VALUE});
        } else if (!existingValue) {
            // there is no values on this attribute, we have nothing to do.
            return [];
        }

        const actionsListRes =
            !skipActions && !!attributeProps.actions_list?.deleteValue
                ? await actionsListDomain.runActionsList(attributeProps.actions_list.deleteValue, [existingValue], {
                      ...ctx,
                      attribute: attributeProps,
                      recordId,
                      library,
                      actionEvent: ActionsListEvents.DELETE_VALUE,
                  })
                : [existingValue];

        const deletedValues = await Promise.all(
            actionsListRes.map(async actionsListResValue => {
                const deletedValue = await valueRepo.deleteValue({
                    library,
                    recordId,
                    attribute: {...attributeProps, reverse_link: reverseLink},
                    value: actionsListResValue,
                    ctx,
                });

                if (!deletedValue) {
                    return existingValue; // In case deleteValue return null (ex: for tree attribute), may happened with concurrent deletion of same value (to atomic operation of _execDeleteValue)
                }

                try {
                    !skipActions &&
                        (await postDeleteValue({
                            attribute: attributeProps,
                            value: deletedValue,
                            libraryId: library,
                            recordId,
                            deps: {actionsListDomain, attributeDomain, utils},
                            ctx,
                        }));
                } catch (error) {
                    logger.error(
                        `Error executing post-delete actions on attribute ${attributeProps.id} record ${recordId}: ${error.stack}`,
                    );
                }

                // Make sure attribute is returned here
                deletedValue.attribute = attribute;

                await eventsManager.sendDatabaseEvent<EventAction.VALUE_DELETE>(
                    {
                        action: EventAction.VALUE_DELETE,
                        topic: {
                            library,
                            record: {
                                id: recordId,
                                libraryId: library,
                            },
                            attribute: attributeProps.id,
                        },
                        before: deletedValue,
                    },
                    ctx,
                );

                sendRecordUpdateEvent({id: recordId, library}, [{attribute, value: deletedValue}], ctx);

                return deletedValue;
            }),
        );

        await _maybeDeactivateLinkedRecord(attributeProps, reverseLink, deletedValues, ctx);

        await _maybeDeleteJoinRecord(attributeProps, deletedValues, ctx);

        return deletedValues;
    };

    const _executeSaveValue = async (
        library: string,
        record: IRecord,
        attribute: IAttribute,
        value: ISaveValue,
        ctx: IQueryInfos,
    ) => {
        const valueBefore = await _getExistingValue({
            value,
            attribute,
            library,
            recordId: record.id,
            ctx,
        });

        const identicalValue = valueBefore !== undefined ? areValuesIdentical(attribute, valueBefore, value) : false;

        // If value is identical, don't save it again. Consider DB value as saved value
        let savedValue: IValue;
        if (identicalValue) {
            savedValue = valueBefore;
        } else {
            value = valueBefore?.id_value ? {...value, id_value: valueBefore.id_value} : value;

            savedValue = await saveOneValue(
                library,
                record.id,
                attribute,
                value,
                {
                    valueRepo,
                    recordRepo,
                    treeRepo,
                    getDefaultElementHelper,
                    actionsListDomain,
                    attributeDomain,
                    versionProfileDomain,
                },
                ctx,
            );

            try {
                await postSaveValue({
                    attribute,
                    value,
                    libraryId: library,
                    recordId: record.id,
                    deps: {actionsListDomain, attributeDomain, utils},
                    ctx,
                });
            } catch (error) {
                logger.error(
                    `Error executing post-save actions on attribute ${attribute.id} record ${record.id}: ${error.stack}`,
                );
            }

            await eventsManager.sendDatabaseEvent<EventAction.VALUE_SAVE>(
                {
                    action: EventAction.VALUE_SAVE,
                    topic: {
                        library,
                        record: {
                            id: record.id,
                            libraryId: library,
                        },
                        attribute: attribute.id,
                    },
                    before: valueBefore,
                    after: savedValue,
                },
                ctx,
            );

            if (valueBefore) {
                // a new join record was create in saveBalue/saveValueBatch, need to remove older if any
                await _maybeDeleteJoinRecord(attribute, [valueBefore], ctx);
            }
        }

        const processedValues = await _runActionsListAndFormatValue(library, attribute, savedValue, ctx, record);

        return {values: processedValues, identicalValue};
    };

    const _runActionsListAndFormatValue = async (
        library: string,
        attribute: IAttribute,
        value: IValue,
        ctx: IQueryInfos,
        record: IRecord = null,
    ) => {
        let processedValues = await _runActionsList({
            listName: ActionsListEvents.GET_VALUE,
            values: [value],
            attribute,
            record,
            library,
            ctx,
        });

        processedValues = await Promise.all(
            processedValues.map(async processedValue => {
                const formattedValue = await _formatValue({
                    attribute,
                    value: processedValue,
                    ctx,
                });

                // Runs actionsList on metadata values as well
                if (attribute.metadata_fields?.length && formattedValue.metadata) {
                    for (const metadataField of attribute.metadata_fields) {
                        if (
                            formattedValue.metadata[metadataField] === null ||
                            typeof formattedValue.metadata[metadataField] === 'undefined'
                        ) {
                            continue;
                        }

                        const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                            id: metadataField,
                            ctx,
                        });

                        const resActionList = await _runActionsList({
                            listName: ActionsListEvents.GET_VALUE,
                            values: [formattedValue.metadata[metadataField] as IStandardValue],
                            attribute: metadataAttributeProps,
                            record,
                            library,
                            ctx,
                        });
                        formattedValue.metadata[metadataField] = resActionList[0];
                    }
                }
                return formattedValue;
            }),
        );

        return processedValues;
    };

    // Extracted to allow within this closure. Would have been better if we could use _executeSaveValue directly.
    // May be future refactoring to move common code from saveValue, saveValueBatch and recordDomain.createRecord into helper module
    const saveValue: IValueDomain['saveValue'] = async ({
        library,
        recordId,
        attribute,
        value,
        ctx,
    }): Promise<IValue[]> => {
        await validate.validateLibrary(library, ctx);
        const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});
        await validate.validateLibraryAttribute(library, attribute, ctx);
        const record = await validate.validateRecord(library, recordId, ctx);

        const valueChecksParams = {
            attributeProps,
            library,
            recordId,
            value,
            keepEmpty: false,
            infos: ctx,
        };

        // Check permissions
        const {
            canSave,
            reason: forbiddenSaveReason,
            fields,
        } = await canSaveRecordValue({
            ...valueChecksParams,
            ctx,
            deps: {
                attributeDependentValuesPermissionDomain,
                recordPermissionDomain,
                recordAttributePermissionDomain,
                config,
            },
        });

        if (!canSave) {
            if (Object.values(Errors).find(err => err === (forbiddenSaveReason as Errors))) {
                throw new ValidationError<IValue>({attribute: {msg: forbiddenSaveReason, vars: {attribute}}});
            }

            throw new PermissionError(
                forbiddenSaveReason as RecordAttributePermissionsActions | RecordPermissionsActions,
                fields,
            );
        }

        // Prepare value using pre-save actions
        const preparedValues = await prepareValue({
            ...valueChecksParams,
            deps: {
                actionsListDomain,
                attributeDomain,
                utils,
            },
            ctx,
        });

        await Promise.all(
            preparedValues.map(async preparedValue => {
                const validationErrors = await validateValue({
                    ...valueChecksParams,
                    value: preparedValue,
                    attributeProps,
                    deps: {
                        attributeDomain,
                        recordRepo,
                        valueRepo,
                        treeRepo,
                    },
                    ctx,
                });

                if (Object.keys(validationErrors).length) {
                    // If we cannot find linked record or tree element, try to create join record if attribute is a link to join behavior library
                    const joinRecordPayload = await _maybeCreateJoinRecord(
                        validationErrors,
                        attributeProps,
                        preparedValue,
                        ctx,
                    );

                    if (joinRecordPayload) {
                        preparedValue.payload = joinRecordPayload;
                    } else {
                        throw new ValidationError<IValue>(validationErrors);
                    }
                }
            }),
        );

        const {allSavedValues, identicalValues} = await preparedValues.reduce(
            async (promiseAcc, valueToSave) => {
                const acc = await promiseAcc;
                const {values: savedValues, identicalValue} = await _executeSaveValue(
                    library,
                    record,
                    attributeProps,
                    valueToSave,
                    ctx,
                );

                if (!identicalValue) {
                    acc.identicalValues = false;
                }

                acc.allSavedValues.push(...savedValues);
                return acc;
            },
            Promise.resolve({allSavedValues: [], identicalValues: true}),
        );

        if (!identicalValues) {
            await updateRecordLastModif(library, recordId, ctx);
            allSavedValues.forEach(savedValue => {
                sendRecordUpdateEvent(record, [{attribute, value: savedValue}], ctx);
            });
        }

        return allSavedValues;
    };

    const _getValues = async ({library, recordId, attribute, options, ctx}): Promise<IValue[]> => {
        await validate.validateLibrary(library, ctx);
        await validate.validateRecord(library, recordId, ctx);

        const attr = await attributeDomain.getAttributeProperties({id: attribute, ctx});

        let reverseLink: IAttribute;
        if (!!attr.reverse_link) {
            reverseLink = await attributeDomain.getAttributeProperties({id: attr.reverse_link as string, ctx});
        }

        let values: IValue[];
        if (
            !attr.versions_conf ||
            !attr.versions_conf.versionable ||
            attr.versions_conf.mode === ValueVersionMode.SIMPLE
        ) {
            const getValOptions = {
                ...options,
                version: attr?.versions_conf?.versionable ? options.version : null,
            };

            values = await valueRepo.getValues({
                library,
                recordId,
                attribute: {...attr, reverse_link: reverseLink},
                forceGetAllValues: false,
                options: getValOptions,
                ctx,
            });
        } else {
            // Get all values, no matter the version.
            const allValues: IValue[] = await valueRepo.getValues({
                library,
                recordId,
                attribute: {...attr, reverse_link: reverseLink},
                forceGetAllValues: true,
                options,
                ctx,
            });
            const versionProfile = await versionProfileDomain.getVersionProfileProperties({
                id: attr.versions_conf.profile,
                ctx,
            });

            // Get trees ancestors
            const trees: IFindValueTree[] = await Promise.all(
                versionProfile.trees.map(async (treeName: string): Promise<IFindValueTree> => {
                    const treeElem =
                        options?.version?.[treeName] ??
                        (await getDefaultElementHelper.getDefaultElement({treeId: treeName, ctx}))?.id;

                    const ancestors = treeElem
                        ? (
                              await elementAncestors.getCachedElementAncestors({
                                  treeId: treeName,
                                  nodeId: treeElem,
                                  ctx,
                              })
                          ).reverse() // We want the leaves first
                        : [];

                    return {
                        name: treeName,
                        currentIndex: 0,
                        elements: ancestors,
                    };
                }),
            );

            // Retrieve appropriate value among all values
            values = options?.forceGetAllValues ? allValues : findValue(trees, allValues);
        }

        return options?.skipActions
            ? values
            : _runActionsList({
                  listName: ActionsListEvents.GET_VALUE,
                  values,
                  attribute: attr,
                  record: {id: recordId},
                  library,
                  ctx,
              });
    };

    const _getRecordFieldValue = async (params: {
        library: string;
        record: IRecord;
        attributeId: string;
        options?: IValuesOptions;
        ctx: IQueryInfos;
    }): Promise<IValue[]> => {
        const {library, record, attributeId, options, ctx} = params;

        const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);

        if (!libraryAttributes.map(a => a.id).includes(attributeId)) {
            throw new ValidationError({
                [attributeId]: {msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY, vars: {attribute: attributeId, library}},
            });
        }

        const perm = await recordAttributePermissionDomain.getRecordAttributePermission(
            RecordAttributePermissionsActions.ACCESS_ATTRIBUTE,
            attributeId,
            library,
            record.id,
            ctx,
        );

        if (!perm) {
            return [];
        }

        const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
        let values = await _extractRecordValue(record, attrProps, library, options, ctx);

        const hasNoValue = values.length === 0;
        if (hasNoValue) {
            values = [
                {
                    payload: null,
                },
            ];
        }

        let formattedValues = await Promise.all(
            values.map(async v => {
                const formattedValue = await _formatValue({
                    attribute: attrProps,
                    value: v,
                    ctx,
                });

                if (attrProps.metadata_fields && formattedValue.metadata) {
                    for (const metadataField of attrProps.metadata_fields) {
                        if (!formattedValue.metadata[metadataField]) {
                            continue;
                        }

                        const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                            id: metadataField,
                            ctx,
                        });

                        const computedMetadata = await _runActionsList({
                            listName: ActionsListEvents.GET_VALUE,
                            attribute: metadataAttributeProps,
                            library,
                            values: [formattedValue.metadata[metadataField] as IStandardValue],
                            ctx,
                        });

                        formattedValue.metadata[metadataField] = computedMetadata[0];
                    }
                }

                return formattedValue;
            }),
        );

        // sort of flatMap cause _formatRecordValue can return multiple values for 1 input val (think heritage)
        formattedValues = formattedValues.reduce((acc, v) => {
            if (Array.isArray(v.payload)) {
                acc = [
                    ...acc,
                    ...v.payload.map(vpart => ({
                        value: vpart,
                        attribute: v.attribute,
                    })),
                ];
            } else {
                acc.push(v);
            }
            return acc;
        }, []);

        if (hasNoValue) {
            // remove null values or values that do not represent a record
            formattedValues = formattedValues.filter(
                v =>
                    v.payload !== null &&
                    typeof v.payload !== 'undefined' &&
                    typeof v.payload === 'object' &&
                    v.payload.hasOwnProperty('id') &&
                    v.payload.hasOwnProperty('library'),
            );
        }

        return formattedValues;
    };

    return {
        getRecordFieldValue: _getRecordFieldValue,
        getValues: _getValues,
        saveValue,
        async saveValueBatch({
            library,
            recordId,
            values,
            ctx,
            keepEmpty = false,
            skipPermission = false,
        }): Promise<ISaveBatchValueResult> {
            await validate.validateLibrary(library, ctx);

            for (const value of values) {
                await validate.validateLibraryAttribute(library, value.attribute, ctx);
            }

            const record = await validate.validateRecord(library, recordId, ctx);

            const saveRes: ISaveBatchValueResult = await values.reduce(
                async (
                    promPrevRes: Promise<ISaveBatchValueResult>,
                    value: ISaveValue,
                ): Promise<ISaveBatchValueResult> => {
                    const prevRes = await promPrevRes;
                    try {
                        if (value.payload == null && !keepEmpty) {
                            const deletedValues = await _executeDeleteValue({
                                library,
                                value,
                                recordId,
                                attribute: value.attribute,
                                ctx,
                            });

                            prevRes.values.push(...deletedValues);

                            return prevRes;
                        }

                        const attributeProps = await attributeDomain.getAttributeProperties({id: value.attribute, ctx});

                        const valueChecksParams = {
                            attributeProps,
                            library,
                            recordId,
                            value,
                            keepEmpty,
                        };

                        // Check permissions
                        if (!skipPermission) {
                            const {canSave, reason: forbiddenSaveReason} = await canSaveRecordValue({
                                ...valueChecksParams,
                                ctx,
                                deps: {
                                    attributeDependentValuesPermissionDomain,
                                    recordPermissionDomain,
                                    recordAttributePermissionDomain,
                                    config,
                                },
                            });

                            if (!canSave) {
                                throw new PermissionError(
                                    forbiddenSaveReason as RecordAttributePermissionsActions | RecordPermissionsActions,
                                );
                            }
                        }

                        const preparedValues = await prepareValue({
                            ...valueChecksParams,
                            deps: {
                                actionsListDomain,
                                attributeDomain,
                                utils,
                            },
                            ctx,
                        });

                        await Promise.all(
                            preparedValues.map(async preparedValue => {
                                const validationErrors = await validateValue({
                                    ...valueChecksParams,
                                    value: preparedValue,
                                    attributeProps,
                                    deps: {
                                        attributeDomain,
                                        recordRepo,
                                        valueRepo,
                                        treeRepo,
                                    },
                                    ctx,
                                });

                                if (Object.keys(validationErrors).length) {
                                    // If we cannot find linked record or tree element, try to create join record if attribute is a link to join behavior library
                                    const joinRecordPayload = await _maybeCreateJoinRecord(
                                        validationErrors,
                                        attributeProps,
                                        preparedValue,
                                        ctx,
                                    );

                                    if (joinRecordPayload) {
                                        preparedValue.payload = joinRecordPayload;
                                    } else {
                                        throw new ValidationError<IValue>(validationErrors);
                                    }
                                }
                            }),
                        );

                        const saveResult = await preparedValues.reduce<Promise<IValue[]>>(async (acc, valueToSave) => {
                            const prevAcc = await acc;
                            const savedValues =
                                !keepEmpty && !valueToSave.payload && !!valueToSave.id_value
                                    ? await _executeDeleteValue({
                                          library,
                                          value: valueToSave,
                                          recordId,
                                          attribute: valueToSave.attribute,
                                          ctx,
                                      })
                                    : (await _executeSaveValue(library, record, attributeProps, valueToSave, ctx))
                                          .values;

                            prevAcc.push(...savedValues);
                            return prevAcc;
                        }, Promise.resolve([]));

                        prevRes.values.push(...saveResult);
                    } catch (e) {
                        if (
                            !e.type ||
                            (e.type !== ErrorTypes.VALIDATION_ERROR && e.type !== ErrorTypes.PERMISSION_ERROR)
                        ) {
                            utils.rethrow(e);
                        }

                        if (!Array.isArray(prevRes.errors)) {
                            prevRes.errors = [];
                        }

                        prevRes.errors.push({
                            type: e.type,
                            message: e?.fields?.[value.attribute]
                                ? !e.isCustomMessage
                                    ? utils.translateError(e.fields[value.attribute], ctx.lang)
                                    : e.fields[value.attribute]
                                : e.message,
                            input: value.payload as string,
                            attribute: value.attribute,
                        });
                    }

                    return prevRes;
                },
                Promise.resolve({values: [], errors: null}),
            );

            if (saveRes.values.length) {
                await updateRecordLastModif(library, recordId, ctx);
                sendRecordUpdateEvent(
                    record,
                    saveRes.values.map(savedValue => ({
                        attribute: savedValue.attribute,
                        value: savedValue,
                    })),
                    ctx,
                );
            }

            return saveRes;
        },
        async deleteValue({library, recordId, attribute, value, skipActions, ctx}) {
            await validate.validateLibrary(library, ctx);
            await validate.validateRecord(library, recordId, ctx);
            return _executeDeleteValue({library, recordId, attribute, value, skipActions, ctx});
        },
        formatValue: _formatValue,
        async listDistinctValues({libraryId, attributeId, recordFilters, options, ctx}) {
            await validate.validateLibrary(libraryId, ctx);
            await validate.validateLibraryAttribute(libraryId, attributeId, ctx);

            const attribute = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

            if (
                ![AttributeTypes.TREE, AttributeTypes.ADVANCED_LINK, AttributeTypes.SIMPLE_LINK].includes(
                    attribute.type,
                )
            ) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.UNSUPPORTED_ATTRIBUTE_TYPE,
                        vars: {attributeType: attribute.type},
                    },
                });
            }
            // If the attribute has an actions list to get value, we cannot retrieve distinct values with listDistinctValues
            // In that case, we should use getRecordFieldValue for each record instead and aggregate the results, which is less efficient
            // May be check only excelCalculation or inheritanceCalculation actions because theirs are not idempotent !
            // https://gitlab.aristid.com/dev/leav/leav/-/merge_requests/1351#note_193389
            if (attribute.actions_list?.getValue?.length) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.UNSUPPORTED_ATTRIBUTE_WITH_ACTIONS,
                        vars: {},
                    },
                });
            }

            let reverseLink: IAttribute | undefined;
            if (!!attribute.reverse_link) {
                reverseLink = await attributeDomain.getAttributeProperties({
                    id: attribute.reverse_link as string,
                    ctx,
                });
            }

            const records = await findRecordsHelper({
                params: {
                    library: libraryId,
                    filters: recordFilters,
                    options: {version: options?.version},
                    retrieveInactive: false,
                    withCount: false,
                },
                ctx,
            });

            return valueRepo.listDistinctValues({
                library: libraryId,
                attribute: {...attribute, reverse_link: reverseLink},
                recordIds: records.list.map(r => r.id),
                options,
                ctx,
            });
        },
    };
};

export default valueDomain;
