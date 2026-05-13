import {type ActionsListEvents} from '../../_types/actionsList';
import {type IAttribute} from '../../_types/attribute';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IRecord} from '../../_types/record';
import {type IValue} from '../../_types/value';

export interface IDeleteValueParams {
    library: string;
    recordId: string;
    attribute: string;
    value?: IValue;
    skipActions?: boolean;
    ctx: IQueryInfos;
}

export interface IRunActionListParams {
    listName: ActionsListEvents;
    values: IValue[];
    attribute: IAttribute;
    record?: IRecord;
    library: string;
    ctx: IQueryInfos;
}
