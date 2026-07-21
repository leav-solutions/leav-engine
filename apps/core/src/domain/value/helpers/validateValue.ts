import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IValueRepo} from '../../../infra/value/valueRepo';
import {difference} from 'lodash';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {type ErrorFieldDetail, Errors, type IExtendedErrorMsg} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type ISaveLinkValue, type ISaveTreeValue, type ISaveValue, type IValueVersion} from '../../../_types/value';
import doesValueExist from './doesValueExist';

interface ILinkRecordValidationResult {
    isValid: boolean;
    reason?: Errors | IExtendedErrorMsg;
}

interface IValidateValueParams {
    attributeProps: IAttribute;
    value: ISaveValue;
    library: string;
    recordId?: string;
    infos?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        attributeDomain: IAttributeDomain;
        recordRepo: IRecordRepo;
        valueRepo: IValueRepo;
        treeRepo: ITreeRepo;
    };
    ctx: IQueryInfos;
}

const _validateLinkedRecord = async (
    value: ISaveLinkValue,
    attribute: IAttribute,
    deps: {attributeDomain: IAttributeDomain; recordRepo: IRecordRepo},
    ctx: IQueryInfos,
): Promise<ILinkRecordValidationResult> => {
    if (typeof value.payload !== 'string') {
        throw new Error('Link attribute value must be a string representing the linked record ID.');
    }
    const record = await deps.recordRepo.getRecord({
        libraryId: attribute.linked_library,
        recordId: value.payload,
        ctx,
    });

    return record
        ? {isValid: true}
        : {
              isValid: false,
              reason: {
                  msg: Errors.UNKNOWN_LINKED_RECORD,
                  vars: {record: value.payload, library: attribute.linked_library},
              },
          };
};

const _validateTreeLinkedRecord = async (
    value: ISaveTreeValue,
    attribute: IAttribute,
    deps: {attributeDomain: IAttributeDomain; recordRepo: IRecordRepo; treeRepo: ITreeRepo},
    ctx: IQueryInfos,
): Promise<ILinkRecordValidationResult> => {
    if (typeof value.payload !== 'string') {
        throw new Error('Tree attribute value must be a string representing the linked node ID.');
    }

    const nodeId = value.payload;
    const isElementInTree = await deps.treeRepo.isNodePresent({
        treeId: attribute.linked_tree,
        nodeId,
        ctx,
    });

    if (!isElementInTree) {
        return {
            isValid: false,
            reason: {msg: Errors.NODE_NOT_IN_TREE, vars: {nodeId: value.payload, treeId: attribute.linked_tree}},
        };
    }

    return {isValid: true};
};

const _mustCheckLinkedRecord = (attribute: IAttribute): boolean => {
    const linkTypes = [AttributeTypes.ADVANCED_LINK, AttributeTypes.SIMPLE_LINK, AttributeTypes.TREE];

    return linkTypes.includes(attribute.type);
};

const _validateVersion = async (
    value: ISaveValue,
    deps: {treeRepo: ITreeRepo},
    ctx: IQueryInfos,
): Promise<ErrorFieldDetail<IValueVersion>> => {
    const trees = Object.keys(value.version);
    const existingTrees = await deps.treeRepo.getTrees({ctx});
    const existingTreesIds = existingTrees.list.map(t => t.id);

    const badElements: ErrorFieldDetail<IValueVersion> = await trees.reduce(async (prevErrors, treeName) => {
        // As our reduce function is async, we must wait for previous iteration to resolve
        const errors = await prevErrors;

        if (!existingTreesIds.includes(treeName)) {
            errors[treeName] = {msg: Errors.UNKNOWN_VERSION_TREE, vars: {tree: treeName}};
            return errors;
        }

        if (value.version[treeName] !== null) {
            const isPresent = await deps.treeRepo.isNodePresent({
                treeId: treeName,
                nodeId: value.version[treeName],
                ctx,
            });

            if (!isPresent) {
                errors[treeName] = {
                    msg: Errors.NODE_NOT_IN_TREE,
                    vars: {nodeId: value.version[treeName], treeId: treeName},
                };
            }
        }

        return errors;
    }, Promise.resolve({}));

    return badElements;
};

const _validateMetadata = (attribute: IAttribute, value: ISaveValue): ErrorFieldDetail<ISaveValue | void> => {
    const errors: ErrorFieldDetail<ISaveValue> = {};
    if (!value.metadata) {
        return;
    }

    // Check fields
    const valueMetaFields = Object.keys(value.metadata);
    const unknownFields = difference(valueMetaFields, attribute.metadata_fields);
    if (unknownFields.length) {
        errors.metadata = {msg: Errors.UNKNOWN_METADATA_FIELDS, vars: {fields: unknownFields.join(', ')}};
    }

    return errors;
};

const DELETE_HTML_TAGS_REGEX = /<\/?[^<>]+>/g;

export default async (params: IValidateValueParams): Promise<ErrorFieldDetail<ISaveValue>> => {
    let errors: ErrorFieldDetail<ISaveValue> = {};
    const {attributeProps, value, library, recordId, deps, ctx} = params;
    const valueExists = doesValueExist(value, attributeProps);

    // Verify character limit
    if (
        [AttributeFormats.TEXT, AttributeFormats.RICH_TEXT].includes(attributeProps.format) &&
        attributeProps.character_limit
    ) {
        if (typeof value.payload !== 'string') {
            throw new Error('Text attribute value must be a string.');
        }
        const text =
            attributeProps.format === AttributeFormats.RICH_TEXT
                ? value.payload.replace(DELETE_HTML_TAGS_REGEX, '')
                : value.payload;

        if (text.length > attributeProps.character_limit) {
            errors[attributeProps.id] = Errors.VALUE_EXCEEDS_CHARACTER_LIMIT;
        }
    }

    // Check if this value has already been registered for this attribute in this library execept for the given record
    if (typeof attributeProps.unique !== 'undefined' && attributeProps.unique) {
        const isValueUsed = await deps.valueRepo.isValueUsed({
            library,
            excludedRecordId: recordId,
            attribute: attributeProps,
            value,
            ctx,
        });

        if (isValueUsed) {
            errors[attributeProps.id] = Errors.VALUE_NOT_UNIQUE;
        }
    }

    // Check if value ID actually exists
    if (valueExists && recordId) {
        const existingVal = await deps.valueRepo.getValueById({
            library,
            recordId,
            attribute: attributeProps,
            valueId: value.id_value,
            ctx,
        });

        if (existingVal === null) {
            errors.id_value = Errors.UNKNOWN_VALUE;
        }
    }

    if (value.version) {
        const badElements = await _validateVersion(value, deps, ctx);
        if (Object.keys(badElements).length) {
            for (const badVersion of Object.keys(badElements)) {
                errors[`version.${badVersion}`] = badElements[badVersion];
            }
        }
    }

    const metadataErrors = _validateMetadata(attributeProps, params.value);
    errors = {...errors, ...metadataErrors};

    if (_mustCheckLinkedRecord(attributeProps) && value.payload !== null) {
        const linkedRecordValidationHandler: {
            [type: string]: (
                value: ISaveLinkValue | ISaveTreeValue,
                attribute: IAttribute,
                deps: any,
                ctx: IQueryInfos,
            ) => Promise<ILinkRecordValidationResult>;
        } = {
            [AttributeTypes.SIMPLE_LINK]: _validateLinkedRecord,
            [AttributeTypes.ADVANCED_LINK]: _validateLinkedRecord,
            [AttributeTypes.TREE]: _validateTreeLinkedRecord,
        };

        const isValidLink = await linkedRecordValidationHandler[attributeProps.type](
            value as ISaveLinkValue | ISaveTreeValue,
            attributeProps,
            deps,
            ctx,
        );

        if (!isValidLink.isValid) {
            errors[attributeProps.id] = isValidLink.reason;
        }
    }

    if (Object.keys(errors).length > 0) {
        errors.attribute = attributeProps.id;
    }

    return errors;
};
