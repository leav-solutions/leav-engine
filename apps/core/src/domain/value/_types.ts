// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {IValue} from '_types/value';

export interface IDeleteValueParams {
    library: string;
    recordId: string;
    attribute: string;
    value?: IValue;
    ctx: IQueryInfos;
}
