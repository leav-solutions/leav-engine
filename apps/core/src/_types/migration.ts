import {type IQueryInfos} from './queryInfos';

export interface IMigration {
    run(ctx: IQueryInfos): Promise<void>;
}
