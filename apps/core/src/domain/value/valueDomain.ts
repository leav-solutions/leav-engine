// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {UpdateRecordLastModifFunc} from 'domain/helpers/updateRecordLastModif';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {IGetDefaultElementHelper} from 'domain/tree/helpers/getDefaultElement';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import * as Config from '_types/config';
import {IRecord} from '_types/record';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeTypes, IAttribute, ValueVersionMode} from '../../_types/attribute';
import {Errors, ErrorTypes} from '../../_types/errors';
import {EventAction} from '../../_types/event';
import {RecordAttributePermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import {IQueryInfos} from '../../_types/queryInfos';
import {IFindValueTree, IStandardValue, IValue, IValuesOptions} from '../../_types/value';
import {IActionsListDomain} from '../actionsList/actionsListDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IValidateHelper} from '../helpers/validate';
import {IRecordAttributePermissionDomain} from '../permission/recordAttributePermissionDomain';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import canSaveValue from './helpers/canSaveValue';
import findValue from './helpers/findValue';
import prepareValue from './helpers/prepareValue';
import saveOneValue from './helpers/saveOneValue';
import validateValue from './helpers/validateValue';
import {IDeleteValueParams} from './_types';

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
    }): Promise<IValue>;

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
    }): Promise<ISaveBatchValueResult>;

    deleteValue(params: IDeleteValueParams): Promise<IValue>;

    formatValue(params: {
        attribute: IAttribute;
        value: IValue;
        record: IRecord;
        library: string;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    runActionsList(
        listName: ActionsListEvents,
        value: IValue,
        attrProps: IAttribute,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ): Promise<IValue>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.recordAttribute'?: IRecordAttributePermissionDomain;
    'core.domain.permission.record'?: IRecordPermissionDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.helpers.updateRecordLastModif'?: UpdateRecordLastModifFunc;
    'core.domain.tree.helpers.elementAncestors'?: IElementAncestorsHelper;
    'core.domain.tree.helpers.getDefaultElement'?: IGetDefaultElementHelper;
    'core.domain.versionProfile'?: IVersionProfileDomain;
    'core.infra.record'?: IRecordRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
    'core.utils.logger'?: winston.Winston;
    'core.domain.tree'?: ITreeDomain;
}

const valueDomain = function ({
    config = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain = null,
    'core.domain.permission.record': recordPermissionDomain = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.domain.helpers.validate': validate = null,
    'core.domain.helpers.updateRecordLastModif': updateRecordLastModif = null,
    'core.domain.tree.helpers.elementAncestors': elementAncestors = null,
    'core.domain.tree.helpers.getDefaultElement': getDefaultElementHelper = null,
    'core.domain.versionProfile': versionProfileDomain = null,
    'core.infra.record': recordRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.value': valueRepo = null,
    'core.utils': utils = null,
    'core.utils.logger': logger = null
}: IDeps = {}): IValueDomain {
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
    const _runActionsList = async (
        listName: ActionsListEvents = ActionsListEvents.GET_VALUE,
        value: IValue,
        attrProps: IAttribute,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ) => {
        const processedValue = await (!!attrProps.actions_list && !!attrProps.actions_list?.[listName]
            ? actionsListDomain.runActionsList(attrProps.actions_list?.[listName], value, {
                  ...ctx,
                  attribute: attrProps,
                  recordId: record.id,
                  library,
                  value
              })
            : value);

        if (utils.isStandardAttribute(attrProps)) {
            (processedValue as IStandardValue).raw_value = value.value;
        }
        return processedValue;
    };

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

        if (attributeProps.readonly) {
            throw new ValidationError<IValue>({attribute: {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute}}});
        }

        let reverseLink: IAttribute;
        if (!!attributeProps.reverse_link) {
            reverseLink = await attributeDomain.getAttributeProperties({
                id: attributeProps.reverse_link as string,
                ctx
            });
        }

        // if simple attribute type
        let v: IValue;
        if (attributeProps.type === AttributeTypes.SIMPLE || attributeProps.type === AttributeTypes.SIMPLE_LINK) {
            v = (
                await valueRepo.getValues({
                    library,
                    recordId,
                    attribute: {...attributeProps, reverse_link: reverseLink},
                    ctx
                })
            ).pop();
        } else if (
            attributeProps.type === AttributeTypes.ADVANCED_LINK &&
            reverseLink?.type === AttributeTypes.SIMPLE_LINK
        ) {
            const values = await valueRepo.getValues({
                library,
                recordId,
                attribute: {...attributeProps, reverse_link: reverseLink},
                ctx
            });

            v = values.filter(val => val.value.id === value.value).pop();
        } else if (!!value?.id_value) {
            v = await valueRepo.getValueById({
                library,
                recordId,
                attribute: attributeProps,
                valueId: value.id_value,
                ctx
            });
        }

        if (!v) {
            throw new ValidationError({id: Errors.UNKNOWN_VALUE});
        }

        const actionsListRes =
            !!attributeProps.actions_list && !!attributeProps.actions_list.deleteValue
                ? await actionsListDomain.runActionsList(attributeProps.actions_list.deleteValue, v, {
                      attribute: attributeProps,
                      recordId,
                      library,
                      v
                  })
                : v;

        const res: IValue = await valueRepo.deleteValue({
            library,
            recordId,
            attribute: {...attributeProps, reverse_link: reverseLink},
            value: actionsListRes,
            ctx
        });

        // Make sure attribute is returned here
        res.attribute = attribute;

        await eventsManager.sendDatabaseEvent(
            {
                action: EventAction.VALUE_DELETE,
                data: {
                    libraryId: library,
                    recordId,
                    attributeId: attribute,
                    value: {old: actionsListRes}
                }
            },
            ctx
        );

        return res;
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
                    versionProfile.trees.map(
                        async (treeName: string): Promise<IFindValueTree> => {
                            const treeElem =
                                options?.version && options.version[treeName]
                                    ? options.version[treeName]
                                    : (await getDefaultElementHelper.getDefaultElement({treeId: treeName, ctx})).id;

                            const ancestors = (
                                await elementAncestors.getCachedElementAncestors({
                                    treeId: treeName,
                                    nodeId: treeElem,
                                    ctx
                                })
                            ).reverse(); // We want the leaves first

                            return {
                                name: treeName,
                                currentIndex: 0,
                                elements: ancestors
                            };
                        }
                    )
                );

                // Retrieve appropriate value among all values
                values = options?.forceGetAllValues ? allValues : findValue(trees, allValues);
            }

            // Runs actionsList
            values = values.length
                ? await Promise.all(
                      values.map(v =>
                          _runActionsList(ActionsListEvents.GET_VALUE, v, attr, {id: recordId}, library, ctx)
                      )
                  )
                : [
                      // Force running actionsList for actions that generate values (eg. calculation or inheritance)
                      await _runActionsList(
                          ActionsListEvents.GET_VALUE,
                          {value: null},
                          attr,
                          {id: recordId},
                          library,
                          ctx
                      )
                  ].filter(v => v?.value !== null);

            return values;
        },
        async saveValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});

            await validate.validateLibrary(library, ctx);
            const record = await validate.validateRecord(library, recordId, ctx);

            const valueChecksParams = {
                attributeProps,
                library,
                recordId,
                value,
                keepEmpty: false,
                infos: ctx
            };

            // Check permissions
            const {canSave, reason: forbiddenSaveReason, fields} = await canSaveValue({
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
            const valueToSave = await prepareValue({
                ...valueChecksParams,
                deps: {
                    actionsListDomain,
                    attributeDomain,
                    utils
                },
                ctx
            });

            const savedVal = await saveOneValue(
                library,
                recordId,
                attributeProps,
                valueToSave,
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

            await eventsManager.sendDatabaseEvent(
                {
                    action: EventAction.VALUE_SAVE,
                    data: {
                        libraryId: library,
                        recordId,
                        attributeId: attributeProps.id,
                        value: {new: savedVal}
                    }
                },
                ctx
            );

            await updateRecordLastModif(library, recordId, ctx);

            // Apply actions list on value
            let processedValue = await _runActionsList(
                ActionsListEvents.GET_VALUE,
                savedVal,
                attributeProps,
                record,
                library,
                ctx
            );

            // Apply formating
            processedValue = await this.formatValue({
                attribute: attributeProps,
                value: processedValue,
                record,
                library,
                ctx
            });

            return {...savedVal, ...processedValue};
        },
        async saveValueBatch({library, recordId, values, ctx, keepEmpty = false}): Promise<ISaveBatchValueResult> {
            await validate.validateLibrary(library, ctx);
            const record = await validate.validateRecord(library, recordId, ctx);

            const saveRes: ISaveBatchValueResult = await values.reduce(
                async (promPrevRes: Promise<ISaveBatchValueResult>, value: IValue): Promise<ISaveBatchValueResult> => {
                    const prevRes = await promPrevRes;
                    try {
                        if (value.value === null && !keepEmpty) {
                            const deletedVal = await _executeDeleteValue({
                                library,
                                value,
                                recordId,
                                attribute: value.attribute,
                                ctx
                            });

                            prevRes.values.push(deletedVal);

                            return prevRes;
                        }

                        const attributeProps = await attributeDomain.getAttributeProperties({id: value.attribute, ctx});

                        let reverseLink: IAttribute;
                        if (!!attributeProps.reverse_link) {
                            reverseLink = await attributeDomain.getAttributeProperties({
                                id: attributeProps.reverse_link as string,
                                ctx
                            });
                        }

                        const valueChecksParams = {
                            attributeProps,
                            library,
                            recordId,
                            value,
                            keepEmpty
                        };

                        // Check permissions
                        const {canSave, reason: forbiddenSaveReason} = await canSaveValue({
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
                                throw new ValidationError<IValue>({
                                    attribute: {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute: attributeProps.id}}
                                });
                            }

                            throw new PermissionError(
                                forbiddenSaveReason as RecordAttributePermissionsActions | RecordPermissionsActions
                            );
                        }

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
                        const valToSave = await prepareValue({
                            ...valueChecksParams,
                            deps: {
                                actionsListDomain,
                                attributeDomain,
                                utils
                            },
                            ctx
                        });

                        const savedVal =
                            !keepEmpty && !valToSave.value && !!valToSave.id_value
                                ? await valueRepo.deleteValue({
                                      library,
                                      recordId,
                                      attribute: {...attributeProps, reverse_link: reverseLink},
                                      value: valToSave,
                                      ctx
                                  })
                                : await saveOneValue(
                                      library,
                                      recordId,
                                      attributeProps,
                                      valToSave,
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

                        // TODO: get old value ?
                        await eventsManager.sendDatabaseEvent(
                            {
                                action: EventAction.VALUE_SAVE,
                                data: {
                                    libraryId: library,
                                    recordId,
                                    attributeId: attributeProps.id,
                                    value: {new: savedVal}
                                }
                            },
                            ctx
                        );

                        let processedValue = await _runActionsList(
                            ActionsListEvents.GET_VALUE,
                            savedVal,
                            attributeProps,
                            {id: recordId},
                            library,
                            ctx
                        );
                        processedValue = await this.formatValue({
                            attribute: attributeProps,
                            value: processedValue,
                            record,
                            library,
                            ctx
                        });

                        prevRes.values.push(processedValue);
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
                                ? utils.translateError(e.fields[value.attribute], ctx.lang)
                                : e.message,
                            input: value.value,
                            attribute: value.attribute
                        });
                    }

                    return prevRes;
                },
                Promise.resolve({values: [], errors: null})
            );

            if (saveRes.values.length) {
                await updateRecordLastModif(library, recordId, ctx);
            }

            return saveRes;
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            await validate.validateLibrary(library, ctx);
            await validate.validateRecord(library, recordId, ctx);

            return _executeDeleteValue({library, recordId, attribute, value, ctx});
        },
        async formatValue({attribute, value, record, library, ctx}) {
            let processedValue = {...value}; // Don't mutate given value

            const isLinkAttribute =
                attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;

            if (isLinkAttribute && attribute.linked_library) {
                const linkValue = processedValue.value
                    ? {...processedValue.value, library: processedValue.value.library ?? attribute.linked_library}
                    : null;
                processedValue = {...value, value: linkValue};
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
                                    ? await this.formatValue({
                                          attribute: metadataAttributeProps,
                                          value: {value: value.metadata?.[metadataField]},
                                          record,
                                          library,
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
        },
        runActionsList: _runActionsList
    };
};

export default valueDomain;
