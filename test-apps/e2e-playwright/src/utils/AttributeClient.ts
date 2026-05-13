import {GenericClient} from './GenericClient';
import {AttributeFormat, AttributeType, type AttributeInput} from '../_gqlTypes';

export class AttributeClient extends GenericClient {
    public async createAttribute(
        id: string,
        type: AttributeType,
        label: string,
        format?: AttributeFormat,
        required?: boolean,
        unique?: boolean,
        description?: string,
    ): Promise<void> {
        const payload: AttributeInput = {
            id,
            type,
            format,
            label: {en: label},
            required,
            unique,
            description: description ? {en: description} : null,
            readonly: false,
        };

        await this.sdk.SaveAttribute({attribute: payload});
        console.info(`Attribute ${label} created successfully!`);
    }

    public async createValuesListAttribute(id: string, label: string, values: string[]) {
        const payload: AttributeInput = {
            id,
            type: AttributeType.simple,
            format: AttributeFormat.text,
            label: {en: label},
            required: false,
            unique: false,
            readonly: false,
            values_list: {
                enable: true,
                values,
            },
        };

        await this.sdk.SaveAttribute({attribute: payload});
        console.info(`Attribute ${label} created successfully!`);
    }

    public async deleteAttribute(attributesIds: string[]) {
        for (const attributeId of attributesIds) {
            await this.sdk.DeleteAttribute({attributeId});
        }
    }
}
