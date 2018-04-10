import {IAttribute, AttributeTypes} from '../_types/attribute';
import {IValue} from '../_types/value';
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';

export interface IAttributeTypesRepo {
    getTypeRepo?(attribute: IAttribute): IAttributeTypeRepo;
}

/**
 * Define interface used for all attribute type specific files
 */
export interface IAttributeTypeRepo {
    /**
     * Create a new value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Update an existing value. Field "id" is expected on the value
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Delete an existing value. Field "id" is expected on the value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @param {}
     */
    deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Get all values for given record and attribute
     *
     * @param library
     * @param recordId
     * @param attribute
     * @return Array<{}>    Return an empty array if no value found
     */
    getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]>;

    /**
     * Return a specific value based on its ID. Field "id" is expect on the value
     *
     * @param library
     * @param recordId
     * @param attribute
     * @param value
     * @return {}   Return null if no value found
     */
    getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue>;

    /**
     * Return AQL query part to filter on this attribute. If will be concatenate with other filters and full query
     *
     * @param fieldName
     * @param index Position in full query filters
     * @param value Filter value
     */
    filterQueryPart(fieldName: string, index: number, value: string | number): AqlQuery;

    /**
     * Clear all values of given attribute. Can be used to cleanup values when an attribute is deleted for example.
     *
     * @param attribute
     * @return Promise<number> TRUE if operation succeed
     */
    clearAllValues(attribute: IAttribute): Promise<boolean>;
}

export const ATTRIB_COLLECTION_NAME = 'core_attributes';

export default function(
    attributeSimpleRepo: IAttributeTypeRepo | null = null,
    attributeSimpleLinkRepo: IAttributeTypeRepo | null = null,
    attributeAdvancedRepo: IAttributeTypeRepo | null = null,
    attributeAdvancedLinkRepo: IAttributeTypeRepo | null = null
): IAttributeTypesRepo {
    return {
        getTypeRepo(attribute) {
            let attrTypeRepo: IAttributeTypeRepo;
            switch (attribute.type) {
                case AttributeTypes.SIMPLE:
                    attrTypeRepo = attributeSimpleRepo;
                    break;
                case AttributeTypes.SIMPLE_LINK:
                    attrTypeRepo = attributeSimpleLinkRepo;
                    break;
                case AttributeTypes.ADVANCED:
                    attrTypeRepo = attributeAdvancedRepo;
                    break;
                case AttributeTypes.ADVANCED_LINK:
                    attrTypeRepo = attributeAdvancedLinkRepo;
                    break;
            }

            return attrTypeRepo;
        }
    };
}
