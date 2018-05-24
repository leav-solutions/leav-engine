import {IAttributeRepo} from 'infra/attributeRepo';
import attributeTypesRepo, {IAttributeTypeRepo} from 'infra/attributeTypesRepo';
import {IAttribute, IAttributeFilterOptions, AttributeTypes, AttributeFormats} from '../_types/attribute';
import ValidationError from '../errors/ValidationError';
import {IActionsListConfig, ActionsListEvents, ActionsListIOTypes} from '../_types/actionsList';

export interface IAttributeDomain {
    /**
     * Get attribute properties
     *
     * @param id
     * @returns Promise<{}>
     */
    getAttributeProperties(id: string): Promise<IAttribute>;

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

export default function(attributeRepo: IAttributeRepo | null = null): IAttributeDomain {
    function _getDefaultActionsList(attribute: IAttribute): IActionsListConfig {
        // TODO: save defaults action on attribute creation

        switch (attribute.format) {
            case AttributeFormats.DATE:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'toNumber',
                            isSystem: true
                        },
                        {
                            name: 'validateFormat',
                            isSystem: true
                        }
                    ]
                };
            case AttributeFormats.ENCRYPTED:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'validateFormat',
                            isSystem: true
                        },
                        {
                            name: 'encrypt',
                            isSystem: true
                        }
                    ],
                    [ActionsListEvents.GET_VALUE]: [
                        {
                            name: 'toBoolean',
                            isSystem: true
                        }
                    ]
                };
            case AttributeFormats.EXTENDED:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'parseJSON',
                            isSystem: true
                        },
                        {
                            name: 'validateFormat',
                            isSystem: true
                        },
                        {
                            name: 'toJSON',
                            isSystem: true
                        }
                    ]
                };
            default:
                return {
                    [ActionsListEvents.SAVE_VALUE]: [
                        {
                            name: 'validateFormat',
                            isSystem: true
                        }
                    ]
                };
        }
    }

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
            // TODO: Validate attribute data (linked library, linked tree...)

            const attrs = await attributeRepo.getAttributes({id: attrData.id});
            const isExistingAttr = !!attrs.length;

            const attrToSave = {...attrData};
            attrToSave.actions_list =
                !isExistingAttr && typeof attrToSave.actions_list === 'undefined'
                    ? _getDefaultActionsList(attrData)
                    : attrToSave.actions_list;

            const attr = isExistingAttr
                ? await attributeRepo.updateAttribute(attrToSave)
                : await attributeRepo.createAttribute(attrToSave);

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
