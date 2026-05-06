// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type SystemTranslation} from '_ui/types';
import {type RecordFilterInput, type SaveValueBulkMappingValueInput} from '_ui/_gqlTypes';

export type MassEditableAttribute = {
    id: string;
    label?: SystemTranslation;
    dependencies: Array<{id: string; label?: SystemTranslation; linkedTreeLibraryId: string}>;
    hasEmptyDependency: boolean;
    isSimpleWorkflow: boolean;
    isMonoDependencyWorkflow: boolean;
};

export type MassEditTreeNode = {
    id: string | null;
    label: string;
    color?: string | null;
};

export type SetAttributeMapping = (mapping: SaveValueBulkMappingValueInput & {occurrenceCount: number}) => void;

export type SetAttributeMappingWithDependency = (
    mapping: SaveValueBulkMappingValueInput & {occurrenceCount: number} & {dependencyFilter: RecordFilterInput},
) => void;

export type DependencyValue = {
    key: string;
    label: string;
    dependencyFilter: RecordFilterInput;
    filtersWithDependency: RecordFilterInput[];
    dependencyAttributeId?: string;
    dependencyAttributeNodeId?: string;
};
