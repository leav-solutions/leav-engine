// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';

interface IDeps {
    config: IConfig;
}

export interface IDefaultPermissionHelper {
    getDefaultPermission: () => boolean;
}

export default function ({config}: IDeps): IDefaultPermissionHelper {
    return {
        getDefaultPermission(): boolean {
            return config.permissions.default ?? true;
        }
    };
}
