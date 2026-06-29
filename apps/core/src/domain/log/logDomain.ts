import {type ILogRepo} from '../../infra/log/logRepo';
import {type ILogFilters, type ILogPagination, type ILogResponse, type ILogSort} from '../../_types/log';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AdminPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import PermissionError from '../../errors/PermissionError';
import {type IPermissionDomain} from '../permission/permissionDomain';
import {type IRecordPermissionDomain} from '../permission/recordPermissionDomain';

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
                    ctx,
                });
                if (!canAccessRecord) {
                    throw new PermissionError(RecordPermissionsActions.ACCESS_RECORD);
                }
            } else {
                const canAccessAllLogs = await permissionDomain.isAllowed({
                    type: PermissionTypes.ADMIN,
                    action: AdminPermissionsActions.ACCESS_LOGS,
                    ctx,
                });

                if (!canAccessAllLogs) {
                    throw new PermissionError(AdminPermissionsActions.ACCESS_LOGS);
                }
            }

            const defaultSort: ILogSort = {field: 'time', order: 'desc'};
            return logRepo.getLogs({filters, sort: sort ?? defaultSort, pagination}, ctx);
        },
    };
}
