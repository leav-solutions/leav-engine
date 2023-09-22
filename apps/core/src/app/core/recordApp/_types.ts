// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {IValue, IValueVersionFromGql} from '_types/value';

export type ICreateRecordValue = Override<
    Omit<IValue, 'version'>,
    {
        metadata: Array<{
            name: string;
            value: string;
        }>;
    }
>;

export interface ICreateRecordParams {
    library: string;
    data?: {
        values: ICreateRecordValue[];
        version: IValueVersionFromGql;
    };
}
