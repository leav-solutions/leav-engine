// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import * as Config from '_types/config';
import {IRecord} from '_types/record';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes, IAttribute, ValueVersionMode} from '../../_types/attribute';
import {Errors, ErrorTypes} from '../../_types/errors';
import {EventType} from '../../_types/event';
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
import updateRecordLastModif from './helpers/updateRecordLastModif';
import validateValue from './helpers/validateValue';

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
    saveValueBatch({
        library,
        recordId,
        values,
        ctx,
        keepEmpty
    }: {
        library: string;
        recordId: string;
        values: IValue[];
        ctx: IQueryInfos;
        keepEmpty?: boolean;
    }): Promise<ISaveBatchValueResult>;

    deleteValue({
        library,
        recordId,
        attribute,
        value,
        ctx
    }: {
        library: string;
        recordId: string;
        attribute: string;
        value?: IValue;
        ctx: IQueryInfos;
    }): Promise<IValue>;

    formatValue({
        attribute,
        value,
        record,
        library,
        ctx
    }: {
        attribute: IAttribute;
        value: IValue;
        record: IRecord;
        library: string;
        ctx: IQueryInfos;
    }): Promise<IValue>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.domain.actionsList'?: IActionsListDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.recordAttribute'?: IRecordAttributePermissionDomain;
    'core.domain.permission.record'?: IRecordPermissionDomain;
    'core.infra.record'?: IRecordRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.value'?: IValueRepo;
    'core.utils'?: IUtils;
    'core.utils.logger'?: winston.Winston;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.tree.helpers.elementAncestors'?: IElementAncestorsHelper;
}

const valueDomain = function ({
    config = null,
    'core.domain.actionsList': actionsListDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission.recordAttribute': recordAttributePermissionDomain = null,
    'core.domain.permission.record': recordPermissionDomain = null,
    'core.infra.record': recordRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.value': valueRepo = null,
    'core.utils': utils = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.domain.helpers.validate': validate = null,
    'core.utils.logger': logger = null,
    'core.domain.tree.helpers.elementAncestors': elementAncestors = null
}: IDeps = {}): IValueDomain {
    /**
     * Run actions list on a value
     *
     * @param isLinkAttribute
     * @param value
     * @param attrProps
     * @param record
     * @param library
     * @param ctx
     */
    const _runActionsList = async (
        value: IValue,
        attrProps: IAttribute,
        record: IRecord,
        library: string,
        ctx: IQueryInfos
    ) => {
        return !!attrProps.actions_list && !!attrProps.actions_list.getValue
            ? actionsListDomain.runActionsList(attrProps.actions_list.getValue, value, {
                  ...ctx,
                  attribute: attrProps,
                  recordId: record.id,
                  library,
                  value
              })
            : value;
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

                // Get trees ancestors
                const trees: IFindValueTree[] = await Promise.all(
                    attr.versions_conf.trees.map(
                        async (treeName: string): Promise<IFindValueTree> => {
                            const treeElem =
                                options?.version && options.version[treeName]
                                    ? options.version[treeName]
                                    : await treeRepo.getDefaultElement({id: treeName, ctx});

                            const ancestors = await elementAncestors.getCachedElementAncestors({
                                treeId: treeName,
                                nodeId: treeElem,
                                ctx
                            });

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
                    recordAttributePermissionDomain
                }
            });

            if (!canSave) {
                if (Object.values(Errors).find(err => err === (forbiddenSaveReason as Errors))) {
                    throw new ValidationError<IValue>({attribute: Errors.READONLY_ATTRIBUTE});
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

            if (attributeProps.readonly) {
                validationErrors.attribute = {msg: Errors.READONLY_ATTRIBUTE, vars: {attribute: attributeProps.id}};
            }

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
                    actionsListDomain,
                    attributeDomain
                },
                ctx
            );

            // Apply actions list on value
            const processedValue = await this.formatValue({
                attribute: attributeProps,
                value: savedVal,
                record,
                library,
                ctx
            });

            await updateRecordLastModif(library, recordId, {recordRepo}, ctx);

            return {...savedVal, ...processedValue};
        },
        async saveValueBatch({library, recordId, values, ctx, keepEmpty = false}): Promise<ISaveBatchValueResult> {
            await validate.validateLibrary(library, ctx);
            const record = await validate.validateRecord(library, recordId, ctx);

            const saveRes: ISaveBatchValueResult = await values.reduce(
                async (promPrevRes: Promise<ISaveBatchValueResult>, value: IValue): Promise<ISaveBatchValueResult> => {
                    const prevRes = await promPrevRes;
                    try {
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
                                recordAttributePermissionDomain
                            }
                        });

                        if (!canSave) {
                            if (Object.values(Errors).find(err => err === (forbiddenSaveReason as Errors))) {
                                throw new ValidationError<IValue>({attribute: Errors.READONLY_ATTRIBUTE});
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
                                          actionsListDomain,
                                          attributeDomain
                                      },
                                      ctx
                                  );

                        // Apply actions list on value
                        const processedValue = await this.formatValue({
                            attribute: attributeProps,
                            value: savedVal,
                            record,
                            library,
                            ctx
                        });

                        prevRes.values.push(processedValue);

                        // TODO: get old value ?
                        await eventsManager.send(
                            {
                                type: EventType.VALUE_SAVE,
                                data: {
                                    libraryId: library,
                                    recordId,
                                    attributeId: attributeProps.id,
                                    value: {new: savedVal}
                                }
                            },
                            ctx
                        );
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
                await updateRecordLastModif(library, recordId, {recordRepo}, ctx);
            }

            return saveRes;
        },
        async deleteValue({library, recordId, attribute, value, ctx}): Promise<IValue> {
            await validate.validateLibrary(library, ctx);
            await validate.validateRecord(library, recordId, ctx);

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
                throw new ValidationError<IValue>({attribute: Errors.READONLY_ATTRIBUTE});
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
            } else if (!!value.id_value) {
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

            // delete value on elasticsearch
            await eventsManager.send(
                {
                    type: EventType.VALUE_DELETE,
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
        },
        async formatValue({attribute, value, record, library, ctx}) {
            let val = {...value}; // Don't mutate given value

            const isLinkAttribute =
                attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK;

            if (isLinkAttribute && attribute.linked_library) {
                const linkValue = {...val.value, library: attribute.linked_library};
                val = {...value, value: linkValue};
            }

            const processedValue: IValue =
                attribute.id !== 'id' && !!attribute.actions_list && !!attribute.actions_list.getValue
                    ? await _runActionsList(val, attribute, record, library, ctx)
                    : val;

            processedValue.attribute = attribute.id;

            if (utils.isStandardAttribute(attribute)) {
                (processedValue as IStandardValue).raw_value = val.value;
            }

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
        }
    };
};

export default valueDomain;
