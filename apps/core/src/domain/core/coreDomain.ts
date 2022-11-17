// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';

export interface ICoreDomain {
    getVersion(ctx: IQueryInfos): string;
}

export default function(): ICoreDomain {
    return {
        getVersion() {
            return process.env.npm_package_version ?? '';
        }
    };
}
