import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export interface IDefaultPermissionHelper {
    getDefaultPermission: () => boolean;
}

export default function({config}: IDeps): IDefaultPermissionHelper {
    return {
        getDefaultPermission(): boolean {
            return config.permissions.default ?? true;
        }
    };
}
