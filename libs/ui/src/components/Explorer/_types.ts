// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PropertyValueFragment, RecordIdentityFragment} from '_ui/_gqlTypes';
import {ReactElement} from 'react';

export interface IExplorerData {
    attributes: {
        [attributeId: string]: Override<AttributePropertiesFragment, {label: string}>;
    };
    records: IItemData[];
}

export interface IItemData {
    libraryId: string;
    key: string;
    itemId: string;
    whoAmI: Required<RecordIdentityFragment['whoAmI']>;
    propertiesById: {
        [attributeId: string]: PropertyValueFragment[];
    };
}

export interface IItemAction {
    callback: (item: IItemData) => void;
    icon: ReactElement;
    label: string;
    isDanger?: boolean;
}

export interface IPrimaryAction {
    callback: () => void;
    icon: ReactElement;
    label: string;
}

export type ActionHook<T = {}> = {isEnabled: boolean} & T;
