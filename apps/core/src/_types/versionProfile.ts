import {type IGetCoreEntitiesParams} from './shared';
import {type ISystemTranslation} from './systemTranslation';

export interface IVersionProfile {
    id: string;
    label: ISystemTranslation;
    description?: ISystemTranslation;
    trees: string[];
}

/**
 * Accepted fields to filter version profiles list
 */
export interface IVersionProfileFilterOptions extends ICoreEntityFilterOptions {
    trees?: string;
}

export interface IGetCoreVersionProfileParams extends IGetCoreEntitiesParams {
    filters?: IVersionProfileFilterOptions;
}
