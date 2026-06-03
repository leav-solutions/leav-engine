export interface IE2EBaseConfig {
    baseUrl: string;
    testApiKey: string;
}

export const baseConfig: IE2EBaseConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:4001',
    testApiKey: process.env.TEST_API_KEY || 'e2e-playwright-test-api-key',
};
