// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, IDateRangeValue, localizedTranslation} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {SendRecordUpdateEventHelper} from 'domain/record/helpers/sendRecordUpdateEvent';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {IGetDefaultElementHelper} from 'domain/tree/helpers/getDefaultElement';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import moment from 'moment';
import * as Config from '_types/config';
import {IRecord} from '_types/record';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute, ValueVersionMode} from '../../_types/attribute';
import {Errors, ErrorTypes} from '../../_types/errors';
import {RecordAttributePermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IFindValueTree, ILinkValue, IStandardValue, IValue, IValuesOptions} from '../../_types/value';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IValidateHelper} from '../helpers/validate';
import {IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import canSaveRecordValue from './helpers/canSaveRecordValue';
import findValue from './helpers/findValue';
import prepareValue from './helpers/prepareValue';
import saveOneValue from './helpers/saveOneValue';
import validateValue from './helpers/validateValue';
import {IDeleteValueParams, IRunActionListParams} from './_types';
import libraryDomain, {ILibraryDomain} from 'domain/library/libraryDomain';
import {ILibrary, LibraryBehavior} from '../../_types/library';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {DeleteRecordHelper} from 'domain/record/helpers/deleteRecord';

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
        ctx
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
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: string;
        value: IValue;
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
        values: IValue[];
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

    runActionsList(params: IRunActionListParams): Promise<IValue[]>;

    runActionsListAndFormatOnValue({
        library,
        value,
        ctx
    }: {
        library: string;
        value: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue[]>;
}

export interface IValueDomainDeps {
    config: Config.IConfig;
    'core.domain.actionsList': IActionsListDomain;
    'core.domain.attribute': IAttributeDomain;
    // 'core.domain.library': ILibraryDomain;
    // 'core.domain.record': IRecordDomain;
    'core.domain.permission.recordAttribute': IRecordAttributePermissionDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.helpers.updateRecordLastModif': UpdateRecordLastModifFunc;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.domain.tree.helpers.getDefaultElement': IGetDefaultElementHelper;
    'core.domain.record.helpers.sendRecordUpdateEvent': SendRecordUpdateEventHelper;
    'core.domain.record.helpers.deleteRecord': DeleteRecordHelper;
    'core.domain.versionProfile': IVersionProfileDomain;
    'core.infra.record': IRecordRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.value': IValueRepo;
    'core.utils': IUtils;
    'core.utils.logger': winston.Winston;
    'core.domain.tree': ITreeDomain;
}

const valueDomain = function ({
    config,
    'core.domain.actionsList': actionsListDomain,
    'core.domain.attribute': attributeDomain,
    // 'core.domain.library': libraryDomain,
    // 'core.domain.record': recordDomain, // not possible, cycling deps
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.eventsManager': eventsManager,
    'core.domain.helpers.validate': validate,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.helpers.updateRecordLastModif': updateRecordLastModif,
    'core.domain.tree.helpers.elementAncestors': elementAncestors,
    'core.domain.tree.helpers.getDefaultElement': getDefaultElementHelper,
    'core.domain.record.helpers.sendRecordUpdateEvent': sendRecordUpdateEvent,
    'core.domain.record.helpers.deleteRecord': deleteRecordHelper,
    'core.domain.versionProfile': versionProfileDomain,
    'core.infra.record': recordRepo,
    'core.infra.tree': treeRepo,
    'core.infra.value': valueRepo,
    'core.utils': utils,
    'core.utils.logger': logger
}: IValueDomainDeps): IValueDomain {
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
    const _runActionsList: IValueDomain['runActionsList'] = async ({
        listName,
        values,
        attribute: attrProps,
        record,
        library,
        ctx
    }) => {
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
                          library
                      })
                    : valuesToProcess;
            return processedValues;
        } catch (e) {
            // If ValidationError, add some context about value to the error and throw it again
            if (e.type === ErrorTypes.VALIDATION_ERROR) {
                e.context = {
                    attribute: attrProps.id,
                    values,
                    recordId: record?.id
                };
            }
            throw e;
        }
    };

    const _formatValue = async ({
        attribute,
        value,
        ctx
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
                            ctx
                        });

                        allValues[metadataField] =
                            typeof value.metadata?.[metadataField] !== 'undefined'
                                ? await _formatValue({
                                      attribute: metadataAttributeProps,
                                      value: {payload: value.metadata?.[metadataField]},
                                      ctx
                                  })
                                : null;
                    } catch (err) {
                        logger.error(err);
                        allValues[metadataField] = null;
                    }

                    return allValues;
                },
                Promise.resolve({})
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
            ctx
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
        if (attribute.type === AttributeTypes.SIMPLE || attribute.type === AttributeTypes.SIMPLE_LINK) {
            v = (
                await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: {...attribute, reverse_link: reverseLink},
                    ctx
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
                ctx
            });

            v = values.filter(val => val.payload.id === value.payload).pop();
        } else if (!!value?.id_value) {
            v = await valueRepo.getValueById({
                library,
                recordId,
                attribute,
                valueId: value.id_value,
                ctx
            });
        }

        return v;
    }

    const _executeDeleteValue = async ({library, recordId, attribute, value, ctx}: IDeleteValueParams) => {
        // Check permission
        const canUpdateRecord = await recordPermissionDomain.getRecordPermission({
            action: RecordPermissionsActions.EDIT_RECORD,
            userId: ctx.userId,
            library,
            recordId,
            ctx
        });

        if (!canUpdateRecord) {
            throw new PermissionError(RecordPermissionsActions.EDIT_RECORD);
        }

        const isAllowedToDelete = await recordAttributePermissionDomain.getRecordAttributePermission(
            RecordAttributePermissionsActions.EDIT_VALUE,
            ctx.userId,
            attribute,
            library,
            recordId,
            ctx
        );

        if (!isAllowedToDelete) {
            throw new PermissionError(RecordAttributePermissionsActions.EDIT_VALUE);
        }

        const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});

        let reverseLink: IAttribute;
        if (!!attributeProps.reverse_link) {
            reverseLink = await attributeDomain.getAttributeProperties({
                id: attributeProps.reverse_link as string,
                ctx
            });
        }

        const isRequired =
            attributeProps.required &&
            (!attributeProps.multiple_values ||
                (await _isLastValue({
                    attribute: attributeProps,
                    library,
                    recordId,
                    ctx,
                    reverseLink
                })));

        const attributeLabel =
            typeof attributeProps.label === 'string'
                ? attributeProps.label
                : localizedTranslation(attributeProps.label, [ctx.lang]);

        if (attributeProps.readonly) {
            throw new ValidationError<IValue>({
                [attribute]: {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute: attributeLabel}}
            });
        } else if (isRequired) {
            throw new ValidationError<IValue>({
                [attribute]: {
                    msg: Errors.REQUIRED_ATTRIBUTE,
                    vars: {attribute: attributeLabel}
                }
            });
        }

        const existingValue: IValue = await _getExistingValue({
            value,
            attribute: attributeProps,
            library,
            recordId,
            reverseLink,
            ctx
        });

        if (!existingValue) {
            throw new ValidationError({id: Errors.UNKNOWN_VALUE});
        }

        const actionsListRes = !!attributeProps.actions_list?.deleteValue
            ? await actionsListDomain.runActionsList(attributeProps.actions_list.deleteValue, [existingValue], {
                  ...ctx,
                  attribute: attributeProps,
                  recordId,
                  library
              })
            : [existingValue];

        const deletedValues = await Promise.all(
            actionsListRes.map(async actionsListResValue => {
                const deletedValue = await valueRepo.deleteValue({
                    library,
                    recordId,
                    attribute: {...attributeProps, reverse_link: reverseLink},
                    value: actionsListResValue,
                    ctx
                });

                // Make sure attribute is returned here
                deletedValue.attribute = attribute;

                await eventsManager.sendDatabaseEvent(
                    {
                        action: EventAction.VALUE_DELETE,
                        topic: {
                            library,
                            record: {
                                id: recordId,
                                libraryId: library
                            },
                            attribute: attributeProps.id
                        },
                        before: actionsListRes
                    },
                    ctx
                );

                sendRecordUpdateEvent({id: recordId, library}, [{attribute, value: deletedValue}], ctx);

                return deletedValue;
            })
        );

        return deletedValues;
    };

    const _executeSaveValue = async (
        library: string,
        record: IRecord,
        attribute: IAttribute,
        value: IValue,
        ctx: IQueryInfos
    ) => {
        const valueBefore = await _getExistingValue({
            value,
            attribute,
            library,
            recordId: record.id,
            ctx
        });

        const valueBeforeToCheck =
            utils.isLinkAttribute(attribute) || utils.isTreeAttribute(attribute)
                ? {...valueBefore, value: valueBefore?.payload?.id}
                : valueBefore;
        const areValuesIdentical = utils.areValuesIdentical(valueBeforeToCheck, value);

        // If values are identical, don't save it again. Consider DB value as saved value
        let savedValue: IValue;
        if (areValuesIdentical) {
            savedValue = valueBefore;
        } else {
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
                    versionProfileDomain
                },
                ctx
            );
        }

        const processedValues = await _runActionsListAndFormatValue(library, attribute, savedValue, ctx, record);

        if (!areValuesIdentical) {
            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.VALUE_SAVE,
                    topic: {
                        library,
                        record: {
                            id: record.id,
                            libraryId: library
                        },
                        attribute: attribute.id
                    },
                    before: valueBefore,
                    after: savedValue
                },
                ctx
            );
        }

        return {values: processedValues, areValuesIdentical};
    };

    const _runActionsListAndFormatValue = async (
        library: string,
        attribute: IAttribute,
        value: IValue,
        ctx: IQueryInfos,
        record: IRecord = null
    ) => {
        let processedValues = await _runActionsList({
            listName: ActionsListEvents.GET_VALUE,
            values: [value],
            attribute,
            record,
            library,
            ctx
        });

        processedValues = await Promise.all(
            processedValues.map(async processedValue => {
                const formattedValue = await _formatValue({
                    attribute,
                    value: processedValue,
                    ctx
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
                            ctx
                        });

                        const resActionList = await _runActionsList({
                            listName: ActionsListEvents.GET_VALUE,
                            values: [formattedValue.metadata[metadataField] as IStandardValue],
                            attribute: metadataAttributeProps,
                            record,
                            library,
                            ctx
                        });
                        formattedValue.metadata[metadataField] = resActionList[0];
                    }
                }
                return formattedValue;
            })
        );

        return processedValues;
    };

    return {
        async getValues({library, recordId, attribute, options, ctx}): Promise<IValue[]> {
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
                    version: attr?.versions_conf?.versionable ? options.version : null
                };

                values = await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: {...attr, reverse_link: reverseLink},
                    forceGetAllValues: false,
                    options: getValOptions,
                    ctx
                });
            } else {
                // Get all values, no matter the version.
                const allValues: IValue[] = await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: {...attr, reverse_link: reverseLink},
                    forceGetAllValues: true,
                    options,
                    ctx
                });
                const versionProfile = await versionProfileDomain.getVersionProfileProperties({
                    id: attr.versions_conf.profile,
                    ctx
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
                                      ctx
                                  })
                              ).reverse() // We want the leaves first
                            : [];

                        return {
                            name: treeName,
                            currentIndex: 0,
                            elements: ancestors
                        };
                    })
                );

                // Retrieve appropriate value among all values
                values = options?.forceGetAllValues ? allValues : findValue(trees, allValues);
            }

            // Runs actionsList
            const actionsListRes = await _runActionsList({
                listName: ActionsListEvents.GET_VALUE,
                values,
                attribute: attr,
                record: {id: recordId},
                library,
                ctx
            });

            return actionsListRes;
        },
        async saveValue({library, recordId, attribute, value, ctx}): Promise<IValue[]> {

            console.log('saveValue :>> ', JSON.stringify({library, recordId, attribute, value}, null, 2));
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
                infos: ctx
            };

            if (attributeProps.readonly) {
                throw new ValidationError<IValue>({
                    attribute: {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute: attributeProps.id}}
                });
            }

            // Check permissions
            const {
                canSave,
                reason: forbiddenSaveReason,
                fields
            } = await canSaveRecordValue({
                ...valueChecksParams,
                ctx,
                deps: {
                    recordPermissionDomain,
                    recordAttributePermissionDomain,
                    config
                }
            });

            if (!canSave) {
                if (Object.values(Errors).find(err => err === (forbiddenSaveReason as Errors))) {
                    throw new ValidationError<IValue>({attribute: {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute}}});
                }

                throw new PermissionError(
                    forbiddenSaveReason as RecordAttributePermissionsActions | RecordPermissionsActions,
                    fields
                );
            }


            // use getCoreEntityById


            // if (attributeProps.type === AttributeTypes.ADVANCED_LINK) {
            //     const linkedLibid = attributeProps.linked_library; // structure_item
            //     const linkedLibProps = await libraryDomain.getLibraryProperties(linkedLibid, ctx);
            //     if (linkedLibProps.behavior === LibraryBehavior.JOIN && linkedLibProps.mandatoryAttribute) {
            //         // create SI
            //         // get
            //         console.log('Create link with join library', library, linkedLibid);
            //         const newJoinBackLink: ILinkValue = {
            //                 attribute: linkedLibProps.mandatoryAttribute, // structure item thematic
            //                 payload: {
            //                     id: (value as ILinkValue).payload.id
            //                     // library: linkedLibid

            //                 }
            //                 // id_value // needed ?
            //             };
            //         const res = await recordDomain.createRecord({
            //             library: linkedLibid,
            //             values: [newJoinBackLink],
            //             verifyRequiredAttributes: true,
            //             ctx
            //         });

            //         console.log('res :>> ', JSON.stringify(res, null, 2));

            //         // this.saveValue({
            //         //     library: linkedLibid,
            //         //     recordId: linkedLibProps.default_record,
            //         //     attribute: attributeProps.id,
            //         //     value: {
            //         //         ...value,
            //         //         payload: {
            //         //             ...value.payload,
            //         //             library: linkedLibid
            //         //         }
            //         //     },
            //         //     ctx
            //         // })
            //     }
            // }

            // Validate value
            const validationErrors = await validateValue({
                ...valueChecksParams,
                attributeProps,
                deps: {
                    attributeDomain,
                    recordRepo,
                    valueRepo,
                    treeRepo
                },
                ctx
            });

            if (Object.keys(validationErrors).length) {
                throw new ValidationError<IValue>(validationErrors);
            }

            // Prepare value
            const valuesToSave = await prepareValue({
                ...valueChecksParams,
                deps: {
                    actionsListDomain,
                    attributeDomain,
                    utils
                },
                ctx
            });

            const {allSavedValues, areValuesIdentical} = await valuesToSave.reduce(
                async (promiseAcc, valueToSave) => {
                    const acc = await promiseAcc;
                    const {values: savedValues, areValuesIdentical: identicalValues} = await _executeSaveValue(
                        library,
                        record,
                        attributeProps,
                        valueToSave,
                        ctx
                    );

                    if (!identicalValues) {
                        acc.areValuesIdentical = false;
                    }

                    acc.allSavedValues.push(...savedValues);
                    return acc;
                },
                Promise.resolve({allSavedValues: [], areValuesIdentical: true})
            );

            if (!areValuesIdentical) {
                await updateRecordLastModif(library, recordId, ctx);
                allSavedValues.forEach(async savedValue => {
                    sendRecordUpdateEvent(record, [{attribute, value: savedValue}], ctx);
                });
            }

            return allSavedValues;
        },
        async saveValueBatch({
            library,
            recordId,
            values,
            ctx,
            keepEmpty = false,
            skipPermission = false
        }): Promise<ISaveBatchValueResult> {
            console.log('saveValueBatch :>> ', JSON.stringify({library, recordId, values}, null, 2));
            await validate.validateLibrary(library, ctx);

            for (const value of values) {
                await validate.validateLibraryAttribute(library, value.attribute, ctx);
            }

            const record = await validate.validateRecord(library, recordId, ctx);

            const saveRes: ISaveBatchValueResult = await values.reduce(
                async (promPrevRes: Promise<ISaveBatchValueResult>, value: IValue): Promise<ISaveBatchValueResult> => {
                    const prevRes = await promPrevRes;
                    try {
                        const attributeProps = await attributeDomain.getAttributeProperties({id: value.attribute, ctx});

                        if (value.payload === null && !keepEmpty) {

                            const deletedValues = await _executeDeleteValue({
                                library,
                                value,
                                recordId,
                                attribute: value.attribute,
                                ctx
                            });

                            prevRes.values.push(...deletedValues);

                            if (attributeProps.linked_library) {
                                const joinLibId = attributeProps.linked_library; // structure_item
                                const joinLibProps = await getCoreEntityById<ILibrary>('library', joinLibId, ctx);

                                if (joinLibProps.behavior === LibraryBehavior.JOIN && joinLibProps.mandatoryAttribute) {
                                    const joinAttributeProps = await attributeDomain.getAttributeProperties({id: joinLibProps.mandatoryAttribute, ctx});
                                    if (joinAttributeProps.type === AttributeTypes.SIMPLE_LINK || (joinAttributeProps.type === AttributeTypes.TREE && joinAttributeProps.multiple_values === false)) { // TODO  || joinAttributeProps.type === AttributeTypes.ADVANCED_LINK without multiple_values

                                        await Promise.all(deletedValues.map(async deletedValue => {
                                            // should we unlink record attributes, or done in deleteRecordHelper ?

                                            const deleteJoinRecord = await deleteRecordHelper(joinLibId, deletedValue.payload.id, ctx);
                                            console.log('deleted join record :>> ', JSON.stringify(deleteJoinRecord, null, 2));
                                        }));
                                    }
                                }
                            }

                            return prevRes;
                        }


                        // here check attributeProps.linked_library is join library

                        if (attributeProps.linked_library) {
                            const joinLibId = attributeProps.linked_library; // structure_item
                            const joinLibProps = await getCoreEntityById<ILibrary>('library', joinLibId, ctx);

                            console.log('joinLibId :>> ', joinLibId);
                            console.log('joinLibProps :>> ', JSON.stringify(joinLibProps, null, 2));
                            if (joinLibProps.behavior === LibraryBehavior.JOIN && joinLibProps.mandatoryAttribute) {
                                const joinAttributeProps = await attributeDomain.getAttributeProperties({id: joinLibProps.mandatoryAttribute, ctx});
                                if (joinAttributeProps.type === AttributeTypes.SIMPLE_LINK || (joinAttributeProps.type === AttributeTypes.TREE && joinAttributeProps.multiple_values === false)) { // TODO  || joinAttributeProps.type === AttributeTypes.ADVANCED_LINK without multiple_values
                                    // use recoardDomain.createRecord (cyclie dep ?)
                                    const joinRecordData = {
                                        created_at: moment().unix(),
                                        created_by: String(ctx.userId),
                                        modified_at: moment().unix(),
                                        modified_by: String(ctx.userId),
                                        active: true
                                        // [joinLibProps.mandatoryAttribute]: value.payload // saveValue instead ?
                                    };
                                    console.log('Create join record in join library', joinLibId);
                                    const joinRec = await recordRepo.createRecord({
                                        libraryId: joinLibId,
                                        recordData: joinRecordData,
                                        ctx
                                    });
                                    await eventsManager.sendDatabaseEvent(
                                        {
                                            action: EventAction.RECORD_SAVE,
                                            topic: {
                                                record: {
                                                    id: joinRec.id,
                                                    libraryId: joinRec.library
                                                }
                                            },
                                            after: joinRec
                                        },
                                        ctx
                                    );
                                    console.log('Created join record :>> ', JSON.stringify(joinRec, null, 2));
                                    const joinVal = await this.saveValue({
                                        library: joinLibId,
                                        recordId: joinRec.id,
                                        attribute: joinLibProps.mandatoryAttribute,
                                        value: {
                                            payload: value.payload // simple link from join record to "thematic"
                                        },
                                        ctx
                                    });
                                    console.log('joinVal :>> ', JSON.stringify(joinVal, null, 2));

                                    value.payload = joinRec.id;
                                }
                            }
                        }
                        const valueChecksParams = {
                            attributeProps,
                            library,
                            recordId,
                            value,
                            keepEmpty
                        };

                        if (attributeProps.readonly) {
                            throw new ValidationError<IValue>({
                                attribute: {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute: attributeProps.id}}
                            });
                        }

                        // Check permissions
                        if (!skipPermission) {
                            const {canSave, reason: forbiddenSaveReason} = await canSaveRecordValue({
                                ...valueChecksParams,
                                ctx,
                                deps: {
                                    recordPermissionDomain,
                                    recordAttributePermissionDomain,
                                    config
                                }
                            });

                            if (!canSave) {
                                throw new PermissionError(
                                    forbiddenSaveReason as RecordAttributePermissionsActions | RecordPermissionsActions
                                );
                            }
                        }

                        console.log('validateValue :>> ', JSON.stringify({...valueChecksParams, attributeProps}, null, 2));
                        // Validate value
                        const validationErrors = await validateValue({
                            ...{...valueChecksParams, attributeProps},
                            deps: {
                                attributeDomain,
                                recordRepo,
                                valueRepo,
                                treeRepo
                            },
                            ctx
                        });

                        if (Object.keys(validationErrors).length) {
                            throw new ValidationError<IValue>(validationErrors);
                        }

                        // Prepare value
                        const valuesToSave = await prepareValue({
                            ...valueChecksParams,
                            deps: {
                                actionsListDomain,
                                attributeDomain,
                                utils
                            },
                            ctx
                        });
                        console.log('valuesToSave :>> ', JSON.stringify(valuesToSave, null, 2));

                        const saveResult = await valuesToSave.reduce<Promise<IValue[]>>(async (acc, valueToSave) => {
                            const prevAcc = await acc;
                            const savedValues =
                                !keepEmpty && !valueToSave.payload && !!valueToSave.id_value
                                    ? await _executeDeleteValue({
                                          library,
                                          value: valueToSave,
                                          recordId,
                                          attribute: valueToSave.attribute,
                                          ctx
                                      })
                                    : (await _executeSaveValue(library, record, attributeProps, valueToSave, ctx))
                                          .values;

                            prevAcc.push(...savedValues);
                            return prevAcc;
                        }, Promise.resolve([]));

                        prevRes.values.push(...saveResult);
                    } catch (e) {
                        console.error('Error while saving value', e);
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
                            input: value.payload,
                            attribute: value.attribute
                        });
                    }

                    return prevRes;
                },
                Promise.resolve({values: [], errors: null})
            );

            if (saveRes.values.length) {
                await updateRecordLastModif(library, recordId, ctx);
                sendRecordUpdateEvent(
                    record,
                    saveRes.values.map(savedValue => ({
                        attribute: savedValue.attribute,
                        value: savedValue
                    })),
                    ctx
                );
            }

            return saveRes;
        },
        async deleteValue({library, recordId, attribute, value, ctx}) {
            await validate.validateLibrary(library, ctx);
            await validate.validateRecord(library, recordId, ctx);
            return _executeDeleteValue({library, recordId, attribute, value, ctx});
        },
        async runActionsListAndFormatOnValue({library, value, ctx}) {
            const attributeProps = await attributeDomain.getAttributeProperties({id: value.attribute, ctx});

            if (attributeProps.format === AttributeFormats.DATE_RANGE) {
                value.payload = JSON.parse(value.payload) as IDateRangeValue;
            }

            //TODO: When we will adapt Tree attribute to design-system, we will have to adapt this part (like we did for link)
            if (utils.isLinkAttribute(attributeProps)) {
                value.payload = {
                    id: value.payload
                };
            }

            return _runActionsListAndFormatValue(library, attributeProps, value, ctx);
        },
        formatValue: _formatValue,
        runActionsList: _runActionsList
    };
};

export default valueDomain;
