import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference, intersection} from 'lodash';
import {IUtils} from 'utils/utils';
import ValidationError, {ErrorFieldDetail} from '../../../errors/ValidationError';
import {ActionsListEvents} from '../../../_types/actionsList';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {getAllowedOutputTypes, getDefaultActionsList} from './attributeALHelper';

const _validateSettings = (
    attrData: IAttribute,
    deps: {
        utils: IUtils;
        treeRepo: ITreeRepo;
        config: any;
        attributeRepo: IAttributeRepo;
        actionsListDomain: IActionsListDomain;
    }
): ErrorFieldDetail<IAttribute> => {
    const errors: ErrorFieldDetail<IAttribute> = {};

    if (!deps.utils.validateID(attrData.id)) {
        errors.id = 'Invalid ID format: ' + attrData.id;
    }
    if (
        (attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.SIMPLE_LINK) &&
        attrData.multiple_values
    ) {
        errors.multiple_values = 'Multiple values not allowed for this attribute type';
    }

    return errors;
};

/**
 * Check if versions conf are valid
 *
 * @param attrData
 * @param deps
 */
const _validateVersionsConf = async (
    attrData: IAttribute,
    deps: {
        utils: IUtils;
        treeRepo: ITreeRepo;
        config: any;
        attributeRepo: IAttributeRepo;
        actionsListDomain: IActionsListDomain;
    }
): Promise<ErrorFieldDetail<IAttribute>> => {
    const errors: ErrorFieldDetail<IAttribute> = {};
    if (
        attrData.versions_conf &&
        attrData.versions_conf.versionable &&
        attrData.versions_conf.trees &&
        attrData.versions_conf.trees.length
    ) {
        const existingTrees = await deps.treeRepo.getTrees();
        const unknownTrees = difference(
            attrData.versions_conf.trees,
            existingTrees.list.map(a => a.id)
        );

        if (unknownTrees.length) {
            errors.versions_conf = `Unknown trees: ${unknownTrees.join(', ')}`;
        }
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
        const lastActionDetails = availableActions.find(a => a.name === lastAction.name);

        if (!intersection(lastActionDetails.output_types, allowedOutputTypes[event]).length) {
            inputTypeErrors[`actions_list.${event}`] = `Last action is invalid:
                        expected action with ouptput types including ${allowedOutputTypes[event]},
                        received ${lastActionDetails.output_types}`;
        }
    }

    return inputTypeErrors;
};

/**
 * Check if all required actions (flagged as system action) are present
 *
 * @param attrData
 */
const _validateRequiredActions = (attrData: IAttribute): ErrorFieldDetail<IAttribute> => {
    const requiredActionsErrors: ErrorFieldDetail<IAttribute> = {};
    if (!attrData.actions_list) {
        return requiredActionsErrors;
    }

    const defaultActions = getDefaultActionsList(attrData);
    const missingActions = [];
    for (const event of Object.keys(defaultActions)) {
        for (const defAction of defaultActions[event]) {
            if (
                defAction.is_system &&
                (!attrData.actions_list[event] || !attrData.actions_list[event].find(a => a.name === defAction.name))
            ) {
                missingActions.push(`${event} => ${defAction.name}`);
            }
        }
    }

    if (missingActions.length) {
        requiredActionsErrors.actions_list = `Missing required actions: ${missingActions.join(', ')}`;
    }

    return requiredActionsErrors;
};

/**
 * Check if metadata fields are valid
 * @param attrData
 * @param deps
 */
const _validateMetadataFields = async (
    attrData: IAttribute,
    deps: {attributeRepo: IAttributeRepo}
): Promise<ErrorFieldDetail<IAttribute>> => {
    const metadataFieldsErrors: ErrorFieldDetail<IAttribute> = {};
    // Check metadata fields
    if (attrData.metadata_fields?.length) {
        if (attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.SIMPLE_LINK) {
            throw new ValidationError({metadata_fields: 'Cannot save metadata on simple attribute'});
        }

        const metadatableAttrs = await deps.attributeRepo.getAttributes({
            filters: {type: [AttributeTypes.SIMPLE]},
            strictFilters: true
        });

        const invalidAttributes = difference(
            attrData.metadata_fields,
            metadatableAttrs.list.map(a => a.id)
        );

        if (invalidAttributes.length) {
            metadataFieldsErrors.metadata_fields = `Invalid attribute(s): ${invalidAttributes.join(', ')}`;
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
const _validateRequiredFields = (attrData: IAttribute, deps: {config: any}): ErrorFieldDetail<IAttribute> => {
    // Check required fields
    const requiredFieldsErrors: ErrorFieldDetail<IAttribute> = {};
    if (!attrData.type) {
        requiredFieldsErrors.type = "Attribute's type must be specified";
    }

    if ((attrData.type === AttributeTypes.SIMPLE || attrData.type === AttributeTypes.ADVANCED) && !attrData.format) {
        requiredFieldsErrors.format = "Attribute's format must be specified";
    }

    if (!attrData.label[deps.config.lang.default]) {
        requiredFieldsErrors.label = `Attribute's label for default language
            (${deps.config.lang.default}) must be specified`;
    }

    if (
        (attrData.type === AttributeTypes.SIMPLE_LINK || attrData.type === AttributeTypes.ADVANCED_LINK) &&
        !attrData.linked_library
    ) {
        requiredFieldsErrors.linked_library = `Attribute's linked library must be specified`;
    }

    if (attrData.type === AttributeTypes.TREE && !attrData.linked_tree) {
        requiredFieldsErrors.linked_tree = `Attribute's linked tree must be specified`;
    }

    return requiredFieldsErrors;
};

export const validateAttributeData = async (
    attrData: IAttribute,
    deps: {
        utils: IUtils;
        treeRepo: ITreeRepo;
        config: any;
        attributeRepo: IAttributeRepo;
        actionsListDomain: IActionsListDomain;
    }
): Promise<ErrorFieldDetail<IAttribute>> => {
    const validationFuncs = [
        _validateSettings(attrData, deps),
        _validateVersionsConf(attrData, deps),
        _validateRequiredFields(attrData, deps),
        _validateMetadataFields(attrData, deps),
        _validateInputType(attrData, deps),
        _validateRequiredActions(attrData)
    ];

    const validationRes = await Promise.all(validationFuncs);

    // Merge all errors into 1 object
    return validationRes.reduce((errors, res) => {
        return {...errors, ...res};
    }, {});
};
