// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogRepo} from '../../infra/log/logRepo';
import {mockLog} from '../../__tests__/mocks/log';
import {mockCtx} from '../../__tests__/mocks/shared';
import logDomain from './logDomain';
import {adminUserId} from '../../_constants/users';
import {type IPermissionDomain} from '../permission/permissionDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';

describe('logDomain', () => {
    const mockLogRepo: Mockify<ILogRepo> = {
        getLogs: jest.fn(),
    };
    const mockPermissionDomain: Mockify<IPermissionDomain> = {
        isAllowed: jest.fn(),
    };
    const mockRecordPermissionDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: jest.fn(),
    };

    beforeEach(() => {
        jest.resetAllMocks();
        mockLogRepo.getLogs.mockResolvedValue([mockLog]);
    });

    const _logDomain = logDomain({
        'core.infra.log': mockLogRepo as ILogRepo,
        'core.domain.permission': mockPermissionDomain as IPermissionDomain,
        'core.domain.permission.record': mockRecordPermissionDomain as IRecordPermissionDomain,
    });

    describe('getLogs', () => {
        test('Get logs from repo allow for admin user', async () => {
            mockPermissionDomain.isAllowed.mockResolvedValue(true);
            const logs = await _logDomain.getLogs(
                {},
                {
                    ...mockCtx,
                    userId: adminUserId,
                },
            );

            expect(logs).toEqual([mockLog]);
            expect(mockLogRepo.getLogs).toHaveBeenCalled();
            expect(mockPermissionDomain.isAllowed).toHaveBeenCalled();
        });

        test('Reject get logs for non admin user', async () => {
            mockPermissionDomain.isAllowed.mockResolvedValue(false);
            await expect(
                _logDomain.getLogs(
                    {},
                    {
                        ...mockCtx,
                        userId: '99999', // Non-admin user
                    },
                ),
            ).rejects.toThrow('Action forbidden');

            expect(mockLogRepo.getLogs).not.toHaveBeenCalled();
            expect(mockPermissionDomain.isAllowed).toHaveBeenCalled();
        });

        test('Get logs for a record from repo allow if user can access this record', async () => {
            mockRecordPermissionDomain.getRecordPermission.mockResolvedValue(true);
            const logs = await _logDomain.getLogs(
                {
                    filters: {
                        topic: {
                            record: {
                                id: 'recordId',
                                libraryId: 'libraryId',
                            },
                        },
                    },
                },
                {
                    ...mockCtx,
                    userId: '99999', // Non-admin user
                },
            );

            expect(logs).toEqual([mockLog]);
            expect(mockLogRepo.getLogs).toHaveBeenCalled();
            expect(mockPermissionDomain.isAllowed).not.toHaveBeenCalled();
            expect(mockRecordPermissionDomain.getRecordPermission).toHaveBeenCalled();
        });
    });
});
