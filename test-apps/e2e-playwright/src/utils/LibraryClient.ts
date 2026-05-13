import {type LibraryInput} from '../_gqlTypes';
import {GenericClient} from './GenericClient';

export class LibraryClient extends GenericClient {
    public async createLibrary(id: string, label: string, libAttributes: string[], settings?: any): Promise<void> {
        const payload: LibraryInput = {
            id,
            label: {
                en: label + ' (en)',
                fr: label + ' (fr)',
            },
            attributes: libAttributes || [],
            recordIdentityConf: {
                label: 'label',
                subLabel: null,
                preview: null,
                color: null,
                treeColorPreview: null,
            },
        };

        if (settings) {
            payload.settings = settings;
        }

        await this.sdk.SaveLibrary({library: payload});
        console.info(`Library ${libAttributes} created successfully!`);
    }

    public async deleteLibrary(librariesIds: string[]) {
        for (const libraryId of librariesIds) {
            await this.sdk.DeleteLibrary({libraryId});
        }
    }
}
