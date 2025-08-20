// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Log} from '@leav/utils';
import {ILogRepo} from 'infra/log/logRepo';
import {ILogFilters, ILogPagination, ILogSort} from '_types/log';
import {IQueryInfos} from '_types/queryInfos';
import {AdminPermissionsActions} from '../../_types/permissions';
import PermissionError from '../../errors/PermissionError';
import {IPermissionDomain} from 'domain/permission/permissionDomain';

export interface ILogDomain {
    getLogs: (
        params: {filters?: ILogFilters; sort?: ILogSort; pagination?: ILogPagination},
        ctx: IQueryInfos
    ) => Promise<Log[]>;
}

interface IDeps {
    'core.infra.log': ILogRepo;
    'core.domain.permission': IPermissionDomain;
}

export default function ({'core.infra.log': logRepo, 'core.domain.permission': permissionDomain}: IDeps): ILogDomain {
    return {
        async getLogs({pagination, filters, sort}, ctx) {
            // For now, do not allow non-admin users to access logs
            // Later, if a user interface can display logs, maybe add a permission to be setup in admin panel, like others
            const canAccessAllLogs = permissionDomain.isAdminOrSystemUser(ctx);
            if (!canAccessAllLogs) {
                throw new PermissionError(AdminPermissionsActions.ACCESS_LOGS);
            }

            const defaultSort: ILogSort = {field: 'time', order: 'desc'};
            const logs = await logRepo.getLogs({filters, sort: sort ?? defaultSort, pagination}, ctx);

            return logs;
        }
    };
}
