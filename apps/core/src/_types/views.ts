// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordFilterLight, IRecordSortLight} from './record';
import {ISystemTranslation} from './systemTranslation';

export enum ViewTypes {
    LIST = 'list',
    CARDS = 'cards',
    TIMELINE = 'timeline'
}

export enum ViewSizes {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    BIG = 'BIG'
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
        display?: IViewDisplay;
        filters?: IRecordFilterLight[];
        sort?: IRecordSortLight;
        valuesVersions?: IViewValuesVersion;
        settings: IViewSettings;
    }

    interface IViewDisplay {
        type: ViewTypes;
        size: ViewSizes;
    }

    interface IViewSettingsNameVal {
        name: string;
        value: unknown;
    }

    type ViewFromGraphQL = Omit<IView, 'valuesVersions' | 'settings'> & {
        valuesVersions: IViewValuesVersionForGraphql[];
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

    interface IViewValuesVersion {
        [treeId: string]: string;
    }

    interface IViewValuesVersionForGraphql {
        treeId: string;
        treeNode: {id: string};
    }
}
