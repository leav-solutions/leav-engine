import {type ApplicationInput, ApplicationType} from '../_gqlTypes';
import {GenericClient} from './GenericClient';

export class ApplicationClient extends GenericClient {
    public async createApplication(applicationName: string): Promise<void> {
        const payload: ApplicationInput = {
            id: applicationName.replace(/-/g, '_'),
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
