import coreDomain from './coreDomain';

describe('CoreDomain', () => {
    test('getVersion', async () => {
        const originVersion = process.env.npm_package_version; // To restore it later
        process.env.npm_package_version = '42';

        const domain = coreDomain();

        expect(domain.getVersion()).toBe('42');

        process.env.npm_package_version = originVersion;
    });
});
