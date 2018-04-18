import {IAttributeRepo} from 'infra/attributeRepo';
import {IAttributeTypeRepo} from 'infra/attributeTypesRepo';
import {IAttribute, IAttributeFilterOptions, AttributeTypes} from '../_types/attribute';
import ValidationError from '../errors/ValidationError';

export interface IAttributeDomain {
    /**
     * Get attribute properties
     *
     * @param id
     * @returns Promise<{}>
     */
    getAttributeProperties?(id: string): Promise<IAttribute>;

    /**
     * Get attributes list, filtered or not
     *
     * @param filters
     * @returns Promise<[{}]>
     */
    getAttributes?(filters?: IAttributeFilterOptions): Promise<IAttribute[]>;

    /**
     * Save attribute.
     * If attribute doesn't exist => create a new one, otherwise update existing
     *
     * @param {} attrData
     * @return Promise<{}>  Saved attribute
     */
    saveAttribute?(attrData: IAttribute): Promise<IAttribute>;

    /**
     * Delete an attribute
     *
     * @param id
     */
    deleteAttribute?(id: string): Promise<IAttribute>;
}

export default function(attributeRepo: IAttributeRepo | null = null): IAttributeDomain {
    return {
        async getAttributeProperties(id: string): Promise<IAttribute> {
            const attrs = await attributeRepo.getAttributes({id});

            if (!attrs.length) {
                throw new ValidationError({id: 'Unknown attribute ' + id});
            }
            const props = attrs.pop();

            return props;
        },
        async getAttributes(filters?: IAttributeFilterOptions): Promise<IAttribute[]> {
            const attrs = await attributeRepo.getAttributes(filters);

            return attrs;
        },
        async saveAttribute(attrData: IAttribute): Promise<IAttribute> {
            // TODO: use internal getAttributes, and find a way to mock it in unit tests
            const attrs = await attributeRepo.getAttributes({id: attrData.id});

            const attr = attrs.length
                ? await attributeRepo.updateAttribute(attrData)
                : await attributeRepo.createAttribute(attrData);

            return attr;
        },
        async deleteAttribute(id: string): Promise<IAttribute> {
            // Get attribute
            const attr = await this.getAttributes({id});

            // Check if exists and can delete
            if (!attr.length) {
                throw new ValidationError({id: 'Unknown attribute ' + id});
            }

            const attrProps = attr.pop();

            if (attrProps.system) {
                throw new ValidationError({id: 'Cannot delete system attribute'});
            }

            return attributeRepo.deleteAttribute(attrProps);
        }
    };
}
