import {IAttributeRepo, IAttributeFilterOptions} from 'infra/attributeRepo';
import {IAttribute} from '_types/attribute';

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

export default function(attributeRepo: IAttributeRepo): IAttributeDomain {
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

                if (attr.pop().system) {
                    throw new Error('Cannot delete system attribute');
                }

                return attributeRepo.deleteAttribute(id);
            } catch (e) {
                throw new Error('Delete attribute ' + e);
            }
        }
    };
}
