import {type IE2EUserParams} from './api/e2eUtils';

// Share config from global setup.
// See https://vitest.dev/config/globalsetup.html#globalsetup and https://vitest.dev/api/advanced/vitest.html#provide
// Inject data in globalSetup.ts with project.provide('key', value) and access it in tests with inject('key')
// Contrary to jest globalSetup, tests are not running in same process as globalSetup,
// so we need to provide data we want to share between them in this specific way.
declare module 'vitest' {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface ProvidedContext {
        guestUser: IE2EUserParams;
        nonAdminUser: IE2EUserParams;
        nonAdminGroupId: string;
        graphqlUrl: string;
    }
}
