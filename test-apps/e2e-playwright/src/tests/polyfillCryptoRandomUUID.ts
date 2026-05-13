import {test} from '@playwright/test';

test.beforeEach(async ({page}) => {
    // Fake implementation of crypto.randomUUID for http in gitlab-ci (http://leav_core:4001)
    // It is not possible to name gitlab-ci service with localhost or leav_core.localhost
    // Setup https is not an easy task
    await page.addInitScript(() => {
        if (typeof window.crypto.randomUUID === 'undefined') {
            window.crypto.randomUUID = () =>
                // @ts-ignore
                'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    // eslint-disable-next-line no-bitwise
                    const r = (Math.random() * 16) | 0;
                    // eslint-disable-next-line no-bitwise
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
        }
    });
});
