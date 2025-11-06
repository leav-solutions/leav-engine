// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogRepo} from 'infra/log/logRepo';
import {type ILogFilters, type ILogPagination, type ILogResponse, type ILogSort, Log} from '_types/log';
import {type IQueryInfos} from '_types/queryInfos';
import {AdminPermissionsActions, RecordPermissionsActions} from '../../_types/permissions';
import PermissionError from '../../errors/PermissionError';
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type IRecordPermissionDomain} from 'domain/permission/recordPermissionDomain';

export interface ILogDomain {
    getLogs: (
        params: {filters?: ILogFilters; sort?: ILogSort; pagination?: ILogPagination},
        ctx: IQueryInfos,
    ) => Promise<ILogResponse>;
}

interface IDeps {
    'core.infra.log': ILogRepo;
    'core.domain.permission': IPermissionDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
}

export default function ({
    'core.infra.log': logRepo,
    'core.domain.permission': permissionDomain,
    'core.domain.permission.record': recordPermissionDomain,
}: IDeps): ILogDomain {
    return {
        async getLogs({pagination, filters, sort}, ctx) {
            if (filters?.topic?.record && filters.topic.record.id && filters.topic.record.libraryId) {
                // Ensure the user can access the record
                const canAccessRecord = await recordPermissionDomain.getRecordPermission({
                    action: RecordPermissionsActions.ACCESS_RECORD,
                    recordId: filters.topic.record.id,
                    library: filters.topic.record.libraryId,
                    userId: ctx.userId,
                    ctx,
                });
                if (!canAccessRecord) {
                    throw new PermissionError(RecordPermissionsActions.ACCESS_RECORD);
                }
            } else {
                // For any other request not related to a specific record
                // For now, do not allow non-admin users to access logs
                // Later, if a user interface can display logs, maybe add a permission to be setup in admin panel, like others
                const canAccessAllLogs = permissionDomain.isAdminOrSystemUser(ctx);
                if (!canAccessAllLogs) {
                    throw new PermissionError(AdminPermissionsActions.ACCESS_LOGS);
                }
            }

            const defaultSort: ILogSort = {field: 'time', order: 'desc'};
            return logRepo.getLogs({filters, sort: sort ?? defaultSort, pagination}, ctx);
        },
    };
}
