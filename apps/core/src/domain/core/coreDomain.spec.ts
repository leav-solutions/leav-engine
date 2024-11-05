// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
