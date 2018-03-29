import {IAttributeRepo, IAttributeTypeRepo} from 'infra/attributeRepo';
import {IAttribute, IAttributeFilterOptions, AttributeTypes} from '../_types/attribute';

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

    getTypeRepo(attribute: IAttribute): IAttributeTypeRepo;
}

export default function(
    attributeRepo: IAttributeRepo,
    attributeSimpleRepo: IAttributeTypeRepo | null = null,
    attributeSimpleLinkRepo: IAttributeTypeRepo | null = null,
    attributeAdvancedRepo: IAttributeTypeRepo | null = null,
    attributeAdvancedLinkRepo: IAttributeTypeRepo | null = null
): IAttributeDomain {
    return {
        async getAttributeProperties(id: string): Promise<IAttribute> {
            try {
                const attrs = await attributeRepo.getAttributes({id});

                if (!attrs.length) {
                    throw new Error('Unknown attribute ' + id);
                }
                const props = attrs.pop();

                return props;
            } catch (e) {
                throw new Error('Attribute properties: ' + e);
            }
        },
        async getAttributes(filters?: IAttributeFilterOptions): Promise<IAttribute[]> {
            const attrs = await attributeRepo.getAttributes(filters);

            return attrs;
        },
        async saveAttribute(attrData: IAttribute): Promise<IAttribute> {
            try {
                // TODO: use internal getAttributes, and find a way to mock it in unit tests
                const attrs = await attributeRepo.getAttributes({id: attrData.id});

                const attr = attrs.length
                    ? await attributeRepo.updateAttribute(attrData)
                    : await attributeRepo.createAttribute(attrData);

                return attr;
            } catch (e) {
                throw new Error('Save attribute ' + e);
            }
        },
        async deleteAttribute(id: string): Promise<IAttribute> {
            try {
                // Get attribute
                const attr = await this.getAttributes({id});

                // Check if exists and can delete
                if (!attr.length) {
                    throw new Error('Unknown attribute');
                }

                const attrProps = attr.pop();

                if (attrProps.system) {
                    throw new Error('Cannot delete system attribute');
                }

                const typeRepo = this.getTypeRepo(attrProps);

                return attributeRepo.deleteAttribute(attrProps, typeRepo);
            } catch (e) {
                throw new Error('Delete attribute ' + e);
            }
        },
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
