// Import the type from the constants module
import type * as ConstantsType from './constants';

describe('constants', () => {
    let constants: typeof ConstantsType;

    describe('with /campaigns-manager base URL', () => {
        beforeAll(async () => {
            window.__global_base_url__ = '/campaigns-manager';
            window.__dynamic_base__ = '/campaigns-manager/app/login';

            vi.resetModules();
            constants = await import('./constants');
        });

        it('should set GLOBAL_BASE_URL without trailing slash', () => {
            expect(constants.GLOBAL_BASE_URL).toBe('/campaigns-manager');
        });

        it('should set APP_BASE_URL without trailing slash', () => {
            expect(constants.APP_BASE_URL).toBe('/campaigns-manager/app/login');
        });
    });

    describe('with empty base URL', () => {
        beforeAll(async () => {
            window.__global_base_url__ = '';
            window.__dynamic_base__ = '/app/login';

            vi.resetModules();
            constants = await import('./constants');
        });

        it('should set GLOBAL_BASE_URL without trailing slash', () => {
            expect(constants.GLOBAL_BASE_URL).toBe('');
        });

        it('should set APP_BASE_URL without trailing slash', () => {
            expect(constants.APP_BASE_URL).toBe('/app/login');
        });
    });
});
