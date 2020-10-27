import {IConfig} from '_types/config';

export default (config: IConfig): boolean => {
    return config.permissions.default ?? true;
};
