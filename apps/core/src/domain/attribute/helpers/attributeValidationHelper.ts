// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference, intersection} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeTypes, IAttribute, IAttributeFilterOptions} from '../../../_types/attribute';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {getAllowedOutputTypes} from './attributeALHelper';

const _validateSettings = (
    attrData: IAttribute,
    deps: {
        utils: IUtils;
        treeRepo: ITreeRepo;
        config: any;
        attributeRepo: IAttributeRepo;
        actionsListDomain: IActionsListDomain;
    },
    ctx: IQueryInfos
): ErrorFieldDetail<IAttribute> => {
    const errors: ErrorFieldDetail<IAttribute> = {};

    if (!deps.utils.isIdValid(attrData.id)) {
        errors.id = Errors.INVALID_ID_FORMAT;
    }

    if (
        (attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.SIMPLE_LINK) &&
        attrData.multiple_values
    ) {
        errors.multiple_values = Errors.MULTIPLE_VALUES_NOT_ALLOWED;
    }

    if (attrData.type !== AttributeTypes.SIMPLE && typeof attrData.unique !== 'undefined') {
        errors.unique = Errors.UNIQUE_VALUE_NOT_ALLOWED;
    }

    return errors;
};

/**
 * Check if last actions's output type matches attribute allowed input type
 *
 * @param attrData
 */
const _validateInputType = (
    attrData: IAttribute,
    deps: {actionsListDomain: IActionsListDomain}
): ErrorFieldDetail<IAttribute> => {
    const inputTypeErrors: ErrorFieldDetail<IAttribute> = {};
    if (!attrData.actions_list) {
        return inputTypeErrors;
    }

    const availableActions = deps.actionsListDomain.getAvailableActions();
    const allowedOutputTypes = getAllowedOutputTypes(attrData);
    for (const event of Object.values(ActionsListEvents)) {
        if (!attrData.actions_list[event] || !attrData.actions_list[event].length) {
            continue;
        }

        const eventActions = attrData.actions_list[event];
        const lastAction = eventActions.slice(-1)[0];
        const lastActionDetails = availableActions.find(a => a.id === lastAction.id);

        if (!intersection(lastActionDetails.output_types, allowedOutputTypes[event]).length) {
            inputTypeErrors[`actions_list.${event}`] = {
                msg: Errors.INVALID_ACTION_TYPE,
                vars: {expected: allowedOutputTypes[event], received: lastActionDetails.output_types}
            };
        }
    }

    return inputTypeErrors;
};

/**
 * Check if all required actions (flagged as system action) are present
 *
 * @param attrData
 */
const _validateRequiredActions = (
    attrData: IAttribute,
    deps: {
        utils: IUtils;
    }
): ErrorFieldDetail<IAttribute> => {
    const requiredActionsErrors: ErrorFieldDetail<IAttribute> = {};
    if (!attrData.actions_list) {
        return requiredActionsErrors;
    }

    const defaultActions = deps.utils.getDefaultActionsList(attrData);
    const missingActions = [];
    for (const event of Object.keys(defaultActions)) {
        for (const defAction of defaultActions[event]) {
            if (
                defAction.is_system &&
                (!attrData.actions_list[event] || !attrData.actions_list[event].find(a => a.id === defAction.id))
            ) {
                missingActions.push(`${event} => ${defAction.id}`);
            }
        }
    }

    if (missingActions.length) {
        requiredActionsErrors.actions_list = {
            msg: Errors.MISSING_REQUIRED_ACTION,
            vars: {actions: missingActions.join(', ')}
        };
    }

    return requiredActionsErrors;
};

/**
 * Check if metadata fields are valid
 *
 * @param attrData
 * @param deps
 */
const _validateMetadataFields = async (
    attrData: IAttribute,
    deps: {attributeRepo: IAttributeRepo},
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<IAttribute>> => {
    const metadataFieldsErrors: ErrorFieldDetail<IAttribute> = {};
    // Check metadata fields
    if (attrData.metadata_fields?.length) {
        if (attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.SIMPLE_LINK) {
            throw new ValidationError({metadata_fields: Errors.CANNOT_SAVE_METADATA});
        }

        const filters: IAttributeFilterOptions = {type: [AttributeTypes.SIMPLE]};
        const metadatableAttrs = await deps.attributeRepo.getAttributes({
            params: {
                filters,
                strictFilters: true
            },
            ctx
        });

        const invalidAttributes = difference(
            attrData.metadata_fields,
            metadatableAttrs.list.map(a => a.id)
        );

        if (invalidAttributes.length) {
            metadataFieldsErrors.metadata_fields = {
                msg: Errors.INVALID_ATTRIBUTES,
                vars: {attributes: invalidAttributes.join(', ')}
            };
        }

        return metadataFieldsErrors;
    }
};

/**
 * Check if attribute has are required fields based on its type and format
 *
 * @param attrData
 * @param deps
 */
const _validateId = (attrData: IAttribute, deps: {config: any}): ErrorFieldDetail<IAttribute> => {
    // Check required fields

    const idFieldErrors: ErrorFieldDetail<IAttribute> = {};

    const attributeForbiddenId = ['whoAmI', 'property'];

    if (attributeForbiddenId.indexOf(attrData.id) > -1) {
        idFieldErrors.id = Errors.FORBIDDEN_ID;
    }

    return idFieldErrors;
};

/**
 * Check if attribute has are required fields based on its type and format
 *
 * @param attrData
 * @param deps
 */
const _validateRequiredFields = (attrData: IAttribute, deps: {config: any}): ErrorFieldDetail<IAttribute> => {
    // Check required fields

    const requiredFieldsErrors: ErrorFieldDetail<IAttribute> = {};

    if (!attrData.type) {
        requiredFieldsErrors.type = Errors.REQUIRED_ATTRIBUTE_TYPE;
    }

    if ((attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.ADVANCED) && !attrData.format) {
        requiredFieldsErrors.format = Errors.REQUIRED_ATTRIBUTE_FORMAT;
    }

    if (!attrData.label[deps.config.lang.default]) {
        requiredFieldsErrors.label = {msg: Errors.REQUIRED_ATTRIBUTE_LABEL, vars: {lang: deps.config.lang.default}};
    }

    if (
        (attrData.type === AttributeTypes.SIMPLE_LINK || attrData.type === AttributeTypes.ADVANCED_LINK) &&
        !attrData.linked_library
    ) {
        requiredFieldsErrors.linked_library = Errors.REQUIRED_ATTRIBUTE_LINKED_LIBRARY;
    }

    if (attrData.type === AttributeTypes.TREE && !attrData.linked_tree) {
        requiredFieldsErrors.linked_tree = Errors.REQUIRED_ATTRIBUTE_LINKED_TREE;
    }

    return requiredFieldsErrors;
};

/**
 * Check if attribute has are required fields based on its type and format
 *
 * @param attrData
 * @param deps
 */
const _validateVersionProfile = async (
    attrData: IAttribute,
    deps: {versionProfileDomain: IVersionProfileDomain},
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<IAttribute>> => {
    if (!attrData?.versions_conf?.profile) {
        return {};
    }

    const versionProfileErrors: ErrorFieldDetail<IAttribute> = {};

    const versionProfile = await deps.versionProfileDomain.getVersionProfiles({
        params: {filters: {id: attrData.versions_conf.profile}},
        ctx
    });

    if (!versionProfile.list.length) {
        versionProfileErrors.versions_conf = {
            msg: Errors.UNKNOWN_VERSION_PROFILE,
            vars: {profile: attrData.versions_conf.profile}
        };
    }

    return versionProfileErrors;
};

export const validateAttributeData = async (
    attrData: IAttribute,
    deps: {
        utils: IUtils;
        treeRepo: ITreeRepo;
        config: any;
        attributeRepo: IAttributeRepo;
        actionsListDomain: IActionsListDomain;
        versionProfileDomain: IVersionProfileDomain;
    },
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<IAttribute>> => {
    const validationFuncs = [
        _validateSettings(attrData, deps, ctx),
        _validateRequiredFields(attrData, deps),
        _validateId(attrData, deps),
        _validateMetadataFields(attrData, deps, ctx),
        _validateInputType(attrData, deps),
        _validateRequiredActions(attrData, deps),
        _validateVersionProfile(attrData, deps, ctx)
    ];

    const validationRes = await Promise.all(validationFuncs);

    // Merge all errors into 1 object
    return validationRes.reduce((errors, res) => {
        return {...errors, ...res};
    }, {});
};
