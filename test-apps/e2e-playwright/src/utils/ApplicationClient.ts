// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ApplicationInput, ApplicationType} from '../_gqlTypes';
import {GenericClient} from './GenericClient';

export class ApplicationClient extends GenericClient {
    public async createApplication(applicationName: string): Promise<void> {
        const payload: ApplicationInput = {
            id: applicationName,
            label: {
                en: applicationName + ' (en)',
                fr: applicationName + ' (fr)',
            },
            description: {},
            module: applicationName,
            type: ApplicationType.internal,
            endpoint: applicationName,
        };

        await this.sdk.SaveApplication({application: payload});
        console.info(`Application ${applicationName} created successfully!`);
    }
}
