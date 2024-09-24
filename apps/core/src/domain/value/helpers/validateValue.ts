// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {difference} from 'lodash';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {ErrorFieldDetail, Errors, IExtendedErrorMsg} from '../../../_types/errors';
import {IQueryInfos} from '../../../_types/queryInfos';
import {AttributeCondition} from '../../../_types/record';
import {IValue, IValueVersion} from '../../../_types/value';
import doesValueExist from './doesValueExist';

interface ILinkRecordValidationResult {
    isValid: boolean;
    reason?: Errors | IExtendedErrorMsg;
}

interface IValidateValueParams {
    attributeProps: IAttribute;
    value: IValue;
    library: string;
    recordId: string;
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
    value: IValue,
    attribute: IAttribute,
    deps: {attributeDomain: IAttributeDomain; recordRepo: IRecordRepo},
    ctx: IQueryInfos
): Promise<ILinkRecordValidationResult> => {
    const idAttrProps = await deps.attributeDomain.getAttributeProperties({id: 'id', ctx});
    let reverseLink: IAttribute;
    if (!!idAttrProps.reverse_link) {
        reverseLink = await deps.attributeDomain.getAttributeProperties({
            id: idAttrProps.reverse_link as string,
            ctx
        });
    }

    const records = await deps.recordRepo.find({
        libraryId: attribute.linked_library,
        filters: [
            {
                attributes: [{...idAttrProps, reverse_link: reverseLink}],
                condition: AttributeCondition.EQUAL,
                value: value.payload
            }
        ],
        ctx
    });

    return records.list.length
        ? {isValid: true}
        : {
              isValid: false,
              reason: {
                  msg: Errors.UNKNOWN_LINKED_RECORD,
                  vars: {record: value.payload, library: attribute.linked_library}
              }
          };
};

const _validateTreeLinkedRecord = async (
    value: IValue,
    attribute: IAttribute,
    deps: {attributeDomain: IAttributeDomain; recordRepo: IRecordRepo; treeRepo: ITreeRepo},
    ctx: IQueryInfos
): Promise<ILinkRecordValidationResult> => {
    const nodeId = value.payload;

    const isElementInTree = await deps.treeRepo.isNodePresent({
        treeId: attribute.linked_tree,
        nodeId,
        ctx
    });

    if (!isElementInTree) {
        return {
            isValid: false,
            reason: {msg: Errors.ELEMENT_NOT_IN_TREE, vars: {element: value.payload, tree: attribute.linked_tree}}
        };
    }

    return {isValid: true};
};

const _mustCheckLinkedRecord = (attribute: IAttribute): boolean => {
    const linkTypes = [AttributeTypes.ADVANCED_LINK, AttributeTypes.SIMPLE_LINK, AttributeTypes.TREE];

    return linkTypes.includes(attribute.type);
};

const _validateVersion = async (
    value: IValue,
    deps: {treeRepo: ITreeRepo},
    ctx: IQueryInfos
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
                ctx
            });

            if (!isPresent) {
                errors[treeName] = {
                    msg: Errors.ELEMENT_NOT_IN_TREE,
                    vars: {element: value.version[treeName], tree: treeName}
                };
            }
        }

        return errors;
    }, Promise.resolve({}));

    return badElements;
};

const _validateMetadata = (attribute: IAttribute, value: IValue): ErrorFieldDetail<IValue> => {
    const errors: ErrorFieldDetail<IValue> = {};
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

export default async (params: IValidateValueParams): Promise<ErrorFieldDetail<IValue>> => {
    let errors: ErrorFieldDetail<IValue> = {};
    const {attributeProps, value, library, recordId, deps, ctx} = params;
    const valueExists = doesValueExist(value, attributeProps);

    // Check if this value has already been registered for this attribute in this library
    if (typeof attributeProps.unique !== 'undefined' && attributeProps.unique) {
        const isValueUnique = await deps.valueRepo.isValueUnique({
            library,
            recordId,
            attribute: attributeProps,
            value,
            ctx
        });

        if (!isValueUnique) {
            errors[attributeProps.id] = Errors.VALUE_NOT_UNIQUE;
        }
    }

    // Check if value ID actually exists
    if (valueExists) {
        const existingVal = await deps.valueRepo.getValueById({
            library,
            recordId,
            attribute: attributeProps,
            valueId: value.id_value,
            ctx
        });

        if (existingVal === null) {
            errors.id_value = Errors.UNKNOWN_VALUE;
        }
    }

    if (!!value.version) {
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
                value: IValue,
                attribute: IAttribute,
                deps: any,
                ctx: IQueryInfos
            ) => Promise<ILinkRecordValidationResult>;
        } = {
            [AttributeTypes.SIMPLE_LINK]: _validateLinkedRecord,
            [AttributeTypes.ADVANCED_LINK]: _validateLinkedRecord,
            [AttributeTypes.TREE]: _validateTreeLinkedRecord
        };

        const isValidLink = await linkedRecordValidationHandler[attributeProps.type](value, attributeProps, deps, ctx);

        if (!isValidLink.isValid) {
            errors[attributeProps.id] = isValidLink.reason;
        }
    }

    return errors;
};
