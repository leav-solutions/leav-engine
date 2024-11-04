// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListEvents} from '_types/actionsList';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {IValue} from '_types/value';

export interface IDeleteValueParams {
    library: string;
    recordId: string;
    attribute: string;
    value?: IValue;
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
