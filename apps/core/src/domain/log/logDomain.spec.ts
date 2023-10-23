// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILogRepo} from 'infra/log/logRepo';
import {mockLog} from '../../__tests__/mocks/log';
import {mockCtx} from '../../__tests__/mocks/shared';
import logDomain from './logDomain';

describe('logDomain', () => {
    describe('getLogs', () => {
        test('Get logs from repo', async () => {
            const mockLogRepo: Mockify<ILogRepo> = {
                getLogs: global.__mockPromise([mockLog])
            };

            const domain = logDomain({'core.infra.log': mockLogRepo as ILogRepo});

            const logs = await domain.getLogs({}, mockCtx);

            expect(logs).toEqual([mockLog]);
            expect(mockLogRepo.getLogs).toHaveBeenCalled();
        });
    });
});
