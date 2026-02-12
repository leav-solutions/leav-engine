// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GenericClient} from './GenericClient';
import {AttributeFormats, AttributeTypes} from '../../../../apps/core/src/_types/attribute';

export class AttributeClient extends GenericClient {
    public async createAttribute(
        id: string,
        type: AttributeTypes,
        label: string,
        format?: AttributeFormats,
        required?: boolean,
        unique?: boolean,
        description?: string,
    ): Promise<void> {
        const query = `
            mutation SaveAttribute($attribute: AttributeInput!) {
                saveAttribute(attribute: $attribute) {
                    id
                }
            }
        `;

        const payload = {
            id,
            type,
            format,
            label: {en: label},
            required,
            unique,
            description: description ? {en: description} : null,
            readonly: false,
        };

        await this.makeGraphqlCall(query, {attribute: payload});
        console.info(`Attribute ${label} created successfully!`);
    }

    public async createValuesListAttribute(id: string, label: string, values: string[]) {
        await this.createAttribute(
            id,
            AttributeTypes.SIMPLE,
            label,
            AttributeFormats.TEXT,
            false,
            false,
            'description',
        );

        const query = `
            mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
                saveAttribute(attribute: $attrData) {
                    id
                }
            }
        `;

        const payload = {
            attrData: {
                id,
                values_list: {
                    enable: true,
                    values,
                },
            },
        };

        await this.makeGraphqlCall(query, payload);
    }

    public async deleteAttribute(attributesIds: string[]) {
        for (const attributeId of attributesIds) {
            const query = `
          mutation DeleteAttribute($attributeId: ID!) {
            deleteAttribute(id: $attributeId) {
              id
            }
          }
        `;
            const payload = {
                attributeId,
            };
            await this.makeGraphqlCall(query, payload);
        }
    }
}
