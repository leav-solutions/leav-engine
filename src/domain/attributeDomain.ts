import {IAttributeRepo, IAttributeFilterOptions} from 'infra/attributeRepo';
import {ISystemTranslation} from 'domain/coreDomain';

export interface IAttribute {
    id: string;
    system?: boolean;
    label?: ISystemTranslation;
    type: AttributeTypes;
    format?: AttributeFormats;
}

export enum AttributeTypes {
    LINK = 'link',
    INDEX = 'index',
    STANDARD = 'standard'
}

export enum AttributeFormats {
    TEXT = 'text',
    NUMERIC = 'numeric'
}

export interface IAttributeDomain {
    /**
     * Get attributes list, filtered or not
     *
     * @param filters
     * @returns Promise<[{}]>
     */
    getAttributes(filters?: IAttributeFilterOptions): Promise<IAttribute[]>;

    /**
     * Save attribute.
     * If attribute doesn't exist => create a new one, otherwise update existing
     *
     * @param {} attrData
     * @return Promise<{}>  Saved attribute
     */
    saveAttribute(attrData: IAttribute): Promise<IAttribute>;

    /**
     * Delete an attribute
     *
     * @param id
     */
    deleteAttribute(id: string): Promise<IAttribute>;
}

export default function(attributeRepo: IAttributeRepo): IAttributeDomain {
    return {
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
