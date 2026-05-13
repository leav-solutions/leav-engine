// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, localizedTranslation} from '@leav/utils';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type UpdateRecordLastModifFunc} from '../helpers/updateRecordLastModif';
import {type SendRecordUpdateEventHelper} from '../record/helpers/sendRecordUpdateEvent';
import {type IAutomationDomain} from '../automation/automationDomain';
import {type IElementAncestorsHelper} from '../tree/helpers/elementAncestors';
import {type IGetDefaultElementHelper} from '../tree/helpers/getDefaultElement';
import {type ITreeDomain} from '../tree/treeDomain';
import {type IVersionProfileDomain} from '../versionProfile/versionProfileDomain';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type ITreeRepo} from '../../infra/tree/treeRepo';
import {type IValueRepo} from '../../infra/value/valueRepo';
import {type IUtils} from '../../utils/utils';
import {type ILogger} from '@leav/logger';
import type * as Config from '../../_types/config';
import {type IRecordFilterLight, type IRecord} from '../../_types/record';
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
import {type IAttributeDependentValuesPermissionDomain} from '../permission/attributeDependentValuesPermissionDomain';
import {type IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import canSaveRecordValue, {IMMUTABLE_CORE_SYSTEM_ATTRIBUTE_IDS} from './helpers/canSaveRecordValue';
import findValue from './helpers/findValue';
import prepareValue from './helpers/prepareValue';
import postSaveValue from './helpers/postSaveValue';
import postDeleteValue from './helpers/postDeleteValue';
import saveOneValue from './helpers/saveOneValue';
import validateValue from './helpers/validateValue';
import {type IDeleteValueParams} from './_types';
import {type CreateRecordHelper} from '../record/helpers/createRecord';
import {type GetRecordIdentityHelper} from '../record/helpers/getRecordIdentity';
import {type GetRecordFieldValueHelper} from './helpers/getRecordFieldValue';
import {type GetValuesHelper} from './helpers/getValues';
import {type RunActionsListHelper} from './helpers/runActionsList';
import {type FormatValueHelper} from './helpers/formatValue';
import {type IfLibraryJoinLinkAttribute} from '../attribute/helpers/ifLibraryJoinLinkAttribute';
import {type IRecordInCreationBypassHelper} from '../permission/helpers/recordInCreationBypass';
import {type FindRecordsHelper} from '../record/helpers/findRecords';
import {type IAttributeWithRevLink} from '../../infra/attributeTypes/attributeTypesRepo';
import areValuesIdentical from './helpers/areValuesIdentical';
import {setMetadataRecordLabel} from './helpers/manageEventMetadata';

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
    'core.domain.automation': IAutomationDomain;
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
    'core.domain.record.helpers.getRecordIdentity': GetRecordIdentityHelper;
    'core.domain.value.helpers.getRecordFieldValue': GetRecordFieldValueHelper;
    'core.domain.value.helpers.getValues': GetValuesHelper;
    'core.domain.value.helpers.runActionsList': RunActionsListHelper;
    'core.domain.value.helpers.formatValue': FormatValueHelper;
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
    'core.domain.automation': automationDomain,
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
    'core.domain.record.helpers.getRecordIdentity': getRecordIdentity,
    'core.domain.value.helpers.getRecordFieldValue': getRecordFieldValueHelper,
    'core.domain.value.helpers.getValues': getValuesHelper,
    'core.domain.value.helpers.runActionsList': runActionsListHelper,
    'core.domain.value.helpers.formatValue': formatValueHelper,
    'core.domain.record.helpers.findRecords': findRecordsHelper,
    'core.domain.permission.helpers.recordInCreationBypass': recordInCreationBypassHelper,
    'core.domain.attribute.helpers.ifLibraryJoinLinkAttribute': ifLibraryJoinLinkAttribute,
    'core.domain.versionProfile': versionProfileDomain,
    'core.infra.record': recordRepo,
    'core.infra.tree': treeRepo,
    'core.infra.value': valueRepo,
    'core.utils': utils,
    'core.utils.logger': logger,
}: IValueDomainDeps): IValueDomain {
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
                        await saveValue({
                            library: joinLibId,
                            recordId: deletedValue.payload.id,
                            attribute: 'active',
                            value: {payload: false},
                            ctx,
                        });
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

    const _maybeGetLinkedRecordLabel = async (attribute: IAttribute, value: IValue, ctx: IQueryInfos) => {
        if (
            [AttributeTypes.SIMPLE_LINK, AttributeTypes.ADVANCED_LINK, AttributeTypes.TREE].includes(attribute.type) &&
            value?.payload
        ) {
            const linkedRecord =
                attribute.type === AttributeTypes.TREE
                    ? {
                          id: value.payload.record?.id,
                          library: value.payload.record?.library?.id,
                      }
                    : {id: value.payload.id, library: attribute.linked_library};

            if (linkedRecord.id && linkedRecord.library) {
                const recordProperties = await getRecordIdentity(linkedRecord, ctx);
                const rawRecordLabel = await recordProperties.getLabel?.();

                return rawRecordLabel !== null ? String(rawRecordLabel) : null;
            }
        }

        return null;
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
                // Fetch the linked record's label before deletion so it can be preserved in the event metadata.
                // This is especially useful when the linked record is later purged and its label would be unrecoverable.
                const recordLabel = await _maybeGetLinkedRecordLabel(attributeProps, actionsListResValue, ctx);

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
                        metadata: setMetadataRecordLabel(recordLabel),
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

            // Fetch the linked record's label so it can be preserved in the event metadata.
            // This is especially useful when the linked record is later purged and its label would be unrecoverable.
            const recordLabel = await _maybeGetLinkedRecordLabel(attribute, savedValue, ctx);

            await automationDomain.triggerRules({
                event: {
                    action: EventAction.VALUE_SAVE,
                    topic: {
                        library,
                        attribute: attribute.id,
                        record: {
                            id: record.id,
                            libraryId: library,
                        },
                    },
                },
                synchronous: true,
                ctx,
            });

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
                    metadata: setMetadataRecordLabel(recordLabel),
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
        let processedValues = await runActionsListHelper({
            listName: ActionsListEvents.GET_VALUE,
            values: [value],
            attribute,
            record,
            library,
            ctx,
        });

        processedValues = await Promise.all(
            processedValues.map(async processedValue => {
                const formattedValue = await formatValueHelper({
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

                        const resActionList = await runActionsListHelper({
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

    const _getRecordFieldValue = getRecordFieldValueHelper;

    return {
        getRecordFieldValue: _getRecordFieldValue,
        getValues: getValuesHelper,
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
        formatValue: formatValueHelper,
        async listDistinctValues({libraryId, attributeId, recordFilters, options, ctx}) {
            await validate.validateLibrary(libraryId, ctx);
            await validate.validateLibraryAttribute(libraryId, attributeId, ctx);

            const attribute = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

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

            const distinctValues = await valueRepo.listDistinctValues({
                library: libraryId,
                attribute: {...attribute, reverse_link: reverseLink},
                recordIds: records.list.map(r => r.id),
                options,
                ctx,
            });

            return (
                (await ifLibraryJoinLinkAttribute<IDistinctValue | void>(
                    attribute,
                    async (joinLibId, joinAttributeProps) => {
                        const joinRecordIds = distinctValues
                            .filter(v => v.value !== null)
                            .map(v => (v.value as IRecord).id);

                        if (!!joinAttributeProps.reverse_link) {
                            joinAttributeProps.reverse_link = await attributeDomain.getAttributeProperties({
                                id: joinAttributeProps.reverse_link as string,
                                ctx,
                            });
                        }

                        const targetDistinctValues = await valueRepo.listDistinctValues({
                            library: joinLibId,
                            attribute: joinAttributeProps as IAttributeWithRevLink,
                            recordIds: joinRecordIds,
                            options,
                            ctx,
                        });

                        // Replace or add null value count from source attribute to target attribute, to be able to return correct count of record without joined record
                        const nullValuesCount = distinctValues.find(v => v.value === null)?.count || 0;
                        const targetNullValues = targetDistinctValues.find(v => v.value === null);
                        if (targetNullValues) {
                            targetNullValues.count = nullValuesCount; // number of record without joined record
                        } else if (nullValuesCount) {
                            targetDistinctValues.push({
                                value: null,
                                count: nullValuesCount,
                            });
                        }

                        return targetDistinctValues;
                    },
                    ctx,
                )) || distinctValues
            );
        },
    };
};

export default valueDomain;
