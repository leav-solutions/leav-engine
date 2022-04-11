// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISystemTranslation} from './systemTranslation';

export interface IApplication extends ICoreEntity {
    system?: boolean;
    description: ISystemTranslation;
    libraries: string[];
    color?: string;
    icon?: string;
    component: string;
    endpoint: string;
}
