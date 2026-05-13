// Import the type from the constants module
import type * as ConstantsType from './constants';

describe('constants', () => {
    let constants: typeof ConstantsType;

    describe('with empty base URL', () => {
        beforeAll(() => {
            window.__global_base_url__ = '';
            window.__dynamic_base__ = '/app/admin';

            jest.resetModules();
            constants = require('./constants');
        });

        it('should set GLOBAL_BASE_URL without trailing slash', () => {
            expect(constants.GLOBAL_BASE_URL).toBe('');
        });

        it('should set APP_BASE_URL without trailing slash', () => {
            expect(constants.APP_BASE_URL).toBe('/app/admin');
        });

        it('should set APP_ENDPOINT to last segment of APP_BASE_URL', () => {
            expect(constants.APP_ENDPOINT).toBe('admin');
        });

        it('should set API_ENDPOINT correctly', () => {
            expect(constants.API_ENDPOINT).toBe('graphql');
        });

        it('should set ORIGIN_URL to window.location.origin', () => {
            expect(constants.ORIGIN_URL).toBe(window.location.origin);
        });

        it('should set WS_URL to correct protocol and host', () => {
            const expectedWsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
            expect(constants.WS_URL).toBe(expectedWsUrl);
        });
    });

    describe('with /campaigns-manager base URL', () => {
        beforeAll(() => {
            window.__global_base_url__ = '/campaigns-manager';
            window.__dynamic_base__ = '/campaigns-manager/app/admin';

            jest.resetModules();
            constants = require('./constants');
        });

        it('should set GLOBAL_BASE_URL without trailing slash', () => {
            expect(constants.GLOBAL_BASE_URL).toBe('/campaigns-manager');
        });

        it('should set APP_BASE_URL without trailing slash', () => {
            expect(constants.APP_BASE_URL).toBe('/campaigns-manager/app/admin');
        });

        it('should set APP_ENDPOINT to last segment of APP_BASE_URL', () => {
            expect(constants.APP_ENDPOINT).toBe('admin');
        });

        it('should set API_ENDPOINT correctly', () => {
            expect(constants.API_ENDPOINT).toBe('campaigns-manager/graphql');
        });

        it('should set ORIGIN_URL to window.location.origin', () => {
            expect(constants.ORIGIN_URL).toBe(window.location.origin);
        });

        it('should set WS_URL to correct protocol and host', () => {
            const expectedWsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
            expect(constants.WS_URL).toBe(expectedWsUrl);
        });
    });
});
