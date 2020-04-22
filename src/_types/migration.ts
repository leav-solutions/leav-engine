import {IQueryInfos} from '_types/queryInfos';

export interface IMigration {
    run(ctx: IQueryInfos): Promise<void>;
}
