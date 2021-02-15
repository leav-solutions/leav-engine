// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordFiltersLight, IRecordSortLight} from 'domain/record/recordDomain';
import {ISystemTranslation} from './systemTranslation';

export enum ViewTypes {
    LIST = 'list',
    CARDS = 'cards',
    TIMELINE = 'timeline'
}

declare global {
    interface IView extends ICoreEntity {
        shared?: boolean;
        created_by?: string;
        created_at?: number;
        modified_at?: number;
        library?: string;
        description?: ISystemTranslation;
        color?: string;
        type: ViewTypes;
        filters?: IRecordFiltersLight;
        sort?: IRecordSortLight;
        settings: IViewSettings;
    }

    interface IViewSettingsNameVal {
        name: string;
        value: unknown;
    }

    type ViewFromGraphQL = Omit<IView, 'settings'> & {
        settings: IViewSettingsNameVal[];
    };

    // Settings values depends on view type. We do not validate it on server side,
    // considering it's frontend responsibility
    interface IViewSettings {
        [key: string]: unknown;
    }

    interface IViewFilterOptions extends ICoreEntityFilterOptions {
        created_by?: string;
        library?: string;
        type?: ViewTypes;
    }
}
