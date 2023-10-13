import {ILogRepo} from 'infra/log/logRepo';
import {ILogFilters, ILogPagination, ILogSort, Log} from '_types/log';
import {IQueryInfos} from '_types/queryInfos';

export interface ILogDomain {
    getLogs: (
        params: {filters?: ILogFilters; sort?: ILogSort; pagination?: ILogPagination},
        ctx: IQueryInfos
    ) => Promise<Log[]>;
}

interface IDeps {
    'core.infra.log'?: ILogRepo;
}

export default function({'core.infra.log': logRepo}: IDeps): ILogDomain {
    return {
        async getLogs({pagination, filters, sort}, ctx) {
            const defaultSort: ILogSort = {field: 'time', order: 'desc'};
            const logs = await logRepo.getLogs({filters, sort: sort ?? defaultSort, pagination}, ctx);
            return logs;
        }
    };
}
