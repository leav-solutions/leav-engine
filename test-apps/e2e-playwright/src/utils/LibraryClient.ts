// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GenericClient} from './GenericClient';

export class LibraryClient extends GenericClient {
    public async createLibrary(id: string, label: string, libAttributes: string[], settings?: any): Promise<void> {
        const query = `
            mutation SaveLibrary($library: LibraryInput!) {
                saveLibrary(library: $library) {
                    id
                }
            }
        `;

        const payload: any = {
            id,
            label: {
                en: label + ' (en)',
                fr: label + ' (fr)',
            },
            attributes: libAttributes || [],
        };

        if (settings) {
            payload.settings = settings;
        }

        await this.makeGraphqlCall(query, {library: payload});
        console.info(`Library ${libAttributes} created successfully!`);
    }

    public async deleteLibrary(librariesIds: string[]) {
        for (const libraryId of librariesIds) {
            const query = `
            mutation DeleteLibrary($libraryId: ID!) {
              deleteLibrary(id: $libraryId) {
                id
              }
            }
          `;
            const payload = {
                libraryId,
            };
            await this.makeGraphqlCall(query, payload);
        }
    }
}
