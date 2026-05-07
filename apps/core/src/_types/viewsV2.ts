// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IRecordFilterLight, type IRecordSortLight} from './record';
import {type ISystemTranslation} from './systemTranslation';

export enum ViewV2Types {
    LIST = 'list',
    CARDS = 'cards',
    TIMELINE = 'timeline',
}

export enum ViewV2Sizes {
    SMALL = 'SMALL',
    MEDIUM = 'MEDIUM',
    BIG = 'BIG',
}

export interface IViewV2Display {
    type: ViewV2Types;
    size?: ViewV2Sizes;
}

export interface IViewV2ValuesVersion {
    [treeId: string]: string;
}

/**
 * Stored view v2 entity, as persisted in ArangoDB and returned by the domain.
 */
export interface IViewV2 extends ICoreEntity {
    id: string;
    library: string;
    label: ISystemTranslation;
    display: IViewV2Display;
    shared: boolean;
    created_by: string;
    created_at: number;
    modified_at: number;
    attributes: string[];
    description?: ISystemTranslation;
    color?: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    valuesVersions?: IViewV2ValuesVersion;
}

/**
 * Domain create input. `library`, `label`, `display`, `shared` are mandatory; everything
 * else is optional and will be defaulted by the domain when missing.
 */
export interface IViewV2CreateInput {
    library: string;
    label: ISystemTranslation;
    display: IViewV2Display;
    shared: boolean;
    description?: ISystemTranslation;
    color?: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    valuesVersions?: IViewV2ValuesVersion;
    attributes?: string[];
}

/**
 * Domain update input. Only `id` is mandatory; every other field is optional and only
 * the provided ones are updated.
 */
export interface IViewV2UpdateInput {
    id: string;
    library?: string;
    label?: ISystemTranslation;
    display?: IViewV2Display;
    shared?: boolean;
    description?: ISystemTranslation;
    color?: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    valuesVersions?: IViewV2ValuesVersion;
    attributes?: string[];
}

export interface IViewV2ValuesVersionForGraphql {
    treeId: string;
    treeNode: {id: string};
}

/**
 * GraphQL-shaped create input: same as the domain input but `valuesVersions` arrives as
 * an array of `{treeId, treeNode}` pairs.
 */
export type IViewV2CreateInputFromGraphQL = Omit<IViewV2CreateInput, 'valuesVersions'> & {
    valuesVersions?: IViewV2ValuesVersionForGraphql[];
};

/**
 * GraphQL-shaped update input: same as the domain input with array-shaped `valuesVersions`.
 */
export type IViewV2UpdateInputFromGraphQL = Omit<IViewV2UpdateInput, 'valuesVersions'> & {
    valuesVersions?: IViewV2ValuesVersionForGraphql[];
};

export interface IViewV2FilterOptions extends ICoreEntityFilterOptions {
    created_by?: string;
    library?: string;
    type?: ViewV2Types;
}
