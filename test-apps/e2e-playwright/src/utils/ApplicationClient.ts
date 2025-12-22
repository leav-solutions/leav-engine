// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GenericClient} from './GenericClient';

export class ApplicationClient extends GenericClient {
    public async createApplication(applicationName: string): Promise<void> {
        const query = `
            mutation SaveApplication($application: ApplicationInput!) {
                saveApplication(application: $application) {
                    endpoint
                    module
                    type
                    id
                }
            }
       `;

        const payload = {
            id: applicationName,
            label: {
                en: applicationName + ' (en)',
                fr: applicationName + ' (fr)',
            },
            description: {},
            module: applicationName,
            type: 'internal',
            endpoint: applicationName,
        };

        await this.makeGraphqlCall(query, {application: payload});
        console.info(`Application ${applicationName} created successfully!`);
    }
}
