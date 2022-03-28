// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockCtx} from '../../__tests__/mocks/shared';
import coreDomain from './coreDomain';

jest.mock('../../../package.json', () => ({
    version: '42'
}));

describe('CoreDomain', () => {
    test('getVersion', async () => {
        const domain = coreDomain();

        expect(domain.getVersion(mockCtx)).toBe('42');
    });
});
