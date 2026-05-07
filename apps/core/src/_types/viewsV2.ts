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
 * User-facing fields of a view v2 with their natural required/optional cardinality.
 * Source of truth for both the stored entity and the create/update inputs — every other
 * shape in this file is derived from it.
 */
interface IViewV2UserFields {
    library: string;
    label: ISystemTranslation;
    display: IViewV2Display;
    shared: boolean;
    attributes: string[];
    description?: ISystemTranslation;
    color?: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    valuesVersions?: IViewV2ValuesVersion;
}

/**
 * Server-managed fields, populated by the domain layer.
 */
interface IViewV2ServerFields {
    id: string;
    created_by: string;
    created_at: number;
    modified_at: number;
}

/**
 * Stored view v2 entity, as persisted in ArangoDB and returned by the domain.
 */
export type IViewV2 = IViewV2UserFields & IViewV2ServerFields;

/**
 * Domain create input: user fields, with `attributes` made optional (the domain
 * defaults it to `[]`).
 */
export type IViewV2CreateInput = Omit<IViewV2UserFields, 'attributes'> & {attributes?: string[]};

/**
 * Domain update input: only `id` is mandatory; every other user field is optional
 * and only the provided ones are updated.
 */
export type IViewV2UpdateInput = Pick<IViewV2ServerFields, 'id'> & Partial<IViewV2UserFields>;

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
