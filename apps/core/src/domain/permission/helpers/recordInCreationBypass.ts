// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CORE_IN_CREATION_BY, type IRecord} from '../../../_types/record';
import {type IQueryInfos} from '../../../_types/queryInfos';

export interface IRecordInCreationByPassHelper {
    recordInCreationByPass: (record: IRecord, ctx: IQueryInfos) => boolean;
}

export default function (): IRecordInCreationByPassHelper {
    return {
        recordInCreationByPass: (record: IRecord, ctx: IQueryInfos): boolean =>
            !record.active && typeof record[CORE_IN_CREATION_BY] !== ctx.userId
    };
}
