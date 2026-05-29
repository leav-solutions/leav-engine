import {baseConfig, type IE2EBaseConfig} from '@leav/e2e-test-utils';

interface IE2EConfig extends IE2EBaseConfig {
    auth: {
        username: string;
        password: string;
    };
}

const config: IE2EConfig = {
    ...baseConfig,
    auth: {
        username: process.env.AUTH_USER || 'admin',
        password: process.env.AUTH_PASSWORD || 'admin',
    },
};

export default config;
