// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILogRepo} from 'infra/log/logRepo';
import {mockLog} from '../../__tests__/mocks/log';
import {mockCtx} from '../../__tests__/mocks/shared';
import logDomain from './logDomain';
import {adminUserId} from '../../_constants/users';

describe('logDomain', () => {
    describe('getLogs', () => {
        test('Get logs from repo allow for admin user', async () => {
            const mockLogRepo: Mockify<ILogRepo> = {
                getLogs: global.__mockPromise([mockLog])
            };

            const domain = logDomain({
                'core.infra.log': mockLogRepo as ILogRepo
            });

            const logs = await domain.getLogs(
                {},
                {
                    ...mockCtx,
                    userId: adminUserId
                }
            );

            expect(logs).toEqual([mockLog]);
            expect(mockLogRepo.getLogs).toHaveBeenCalled();
        });

        test('Reject get logs for non admin user', async () => {
            const mockLogRepo: Mockify<ILogRepo> = {
                getLogs: global.__mockPromise([mockLog])
            };

            const domain = logDomain({
                'core.infra.log': mockLogRepo as ILogRepo
            });

            await expect(
                domain.getLogs(
                    {},
                    {
                        ...mockCtx,
                        userId: '99999' // Non-admin user
                    }
                )
            ).rejects.toThrow('Action forbidden');

            expect(mockLogRepo.getLogs).not.toHaveBeenCalled();
        });
    });
});
