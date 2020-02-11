import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {difference} from 'lodash';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {ErrorFieldDetail, Errors, IExtendedErrorMsg} from '../../../_types/errors';
import {IQueryInfos} from '../../../_types/queryInfos';
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
    recordId: number;
    infos?: IQueryInfos;
    keepEmpty: boolean;
    deps: {
        attributeDomain: IAttributeDomain;
        recordRepo: IRecordRepo;
        valueRepo: IValueRepo;
        treeRepo: ITreeRepo;
    };
}

const _validateLinkedRecord = async (
    value: IValue,
    attribute: IAttribute,
    deps: {attributeDomain: IAttributeDomain; recordRepo: IRecordRepo}
): Promise<ILinkRecordValidationResult> => {
    const idAttrProps = await deps.attributeDomain.getAttributeProperties('id');
    const records = await deps.recordRepo.find(attribute.linked_library, [
        {
            attribute: idAttrProps,
            value: value.value
        }
    ]);

    return records.list.length
        ? {isValid: true}
        : {
              isValid: false,
              reason: {
                  msg: Errors.UNKNOWN_LINKED_RECORD,
                  vars: {record: value.value, library: attribute.linked_library}
              }
          };
};

const _validateTreeLinkedRecord = async (
    value: IValue,
    attribute: IAttribute,
    deps: {attributeDomain: IAttributeDomain; recordRepo: IRecordRepo; treeRepo: ITreeRepo}
): Promise<ILinkRecordValidationResult> => {
    const idAttrProps = await deps.attributeDomain.getAttributeProperties('id');
    const [library, recordId] = value.value.split('/');
    const records = await deps.recordRepo.find(library, [
        {
            attribute: idAttrProps,
            value: recordId
        }
    ]);

    if (!records.list.length) {
        return {
            isValid: false,
            reason: {
                msg: Errors.UNKNOWN_LINKED_RECORD,
                vars: {record: recordId, library}
            }
        };
    }

    const isElementInTree = await deps.treeRepo.isElementPresent(attribute.linked_tree, {library, id: recordId});

    if (!isElementInTree) {
        return {
            isValid: false,
            reason: {msg: Errors.ELEMENT_NOT_IN_TREE, vars: {element: value.value, tree: attribute.linked_tree}}
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
    deps: {treeRepo: ITreeRepo}
): Promise<ErrorFieldDetail<IValueVersion>> => {
    const trees = Object.keys(value.version);
    const existingTrees = await deps.treeRepo.getTrees();
    const existingTreesIds = existingTrees.list.map(t => t.id);

    const badElements: ErrorFieldDetail<IValueVersion> = await trees.reduce(async (prevErrors, treeName) => {
        // As our reduce function is async, we must wait for previous iteration to resolve
        const errors = await prevErrors;

        if (!existingTreesIds.includes(treeName)) {
            errors[treeName] = {msg: Errors.UNKNOWN_VERSION_TREE, vars: {tree: treeName}};
            return errors;
        }

        const isPresent = await deps.treeRepo.isElementPresent(treeName, value.version[treeName]);
        if (!isPresent) {
            errors[treeName] = {
                msg: Errors.ELEMENT_NOT_IN_TREE,
                vars: {element: `${value.version[treeName].library}/${value.version[treeName].id}`, tree: treeName}
            };
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
    const {attributeProps, value, library, recordId, deps} = params;
    const valueExists = doesValueExist(value, attributeProps);

    // Check if value ID actually exists
    if (valueExists) {
        const existingVal = await deps.valueRepo.getValueById(library, recordId, attributeProps, value);
        if (existingVal === null) {
            errors.id_value = Errors.UNKNOWN_VALUE;
        }
    }

    if (!!value.version) {
        const badElements = await _validateVersion(value, deps);
        if (Object.keys(badElements).length) {
            for (const badVersion of Object.keys(badElements)) {
                errors[`version.${badVersion}`] = badElements[badVersion];
            }
        }
    }

    const metadataErrors = _validateMetadata(params.attributeProps, params.value);
    errors = {...errors, ...metadataErrors};

    if (_mustCheckLinkedRecord(attributeProps)) {
        const linkedRecordValidationHandler: {
            [type: string]: (value: IValue, attribute: IAttribute, deps: any) => Promise<ILinkRecordValidationResult>;
        } = {
            [AttributeTypes.SIMPLE_LINK]: _validateLinkedRecord,
            [AttributeTypes.ADVANCED_LINK]: _validateLinkedRecord,
            [AttributeTypes.TREE]: _validateTreeLinkedRecord
        };

        const isValidLink = await linkedRecordValidationHandler[attributeProps.type](value, attributeProps, deps);

        if (!isValidLink.isValid) {
            errors[attributeProps.id] = isValidLink.reason;
        }
    }

    return errors;
};
