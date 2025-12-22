interface IE2EConfig {
    baseUrl: string;
    auth: {
        user: string;
        password: string;
    };
}

const config: IE2EConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:4001',
    auth: {
        user: process.env.AUTH_USER || 'admin',
        password: process.env.AUTH_PASSWORD || 'admin',
    },
};

export default config;
