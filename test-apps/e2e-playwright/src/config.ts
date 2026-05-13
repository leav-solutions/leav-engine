interface IE2EConfig {
    baseUrl: string;
    auth: {
        username: string;
        password: string;
    };
    testApiKey: string;
}

const config: IE2EConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:4001',
    auth: {
        username: process.env.AUTH_USER || 'admin',
        password: process.env.AUTH_PASSWORD || 'admin',
    },
    testApiKey: process.env.TEST_API_KEY || 'e2e-playwright-test-api-key',
};

export default config;
