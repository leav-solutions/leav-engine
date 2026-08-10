import {type SystemTranslation} from '_ui/types';
import {type RecordFilterInput} from '_ui/_gqlTypes';

export const DO_NOT_CHANGE = '__do_not_change__';

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

export type MassEditTargetNode = MassEditTreeNode & {id: string};

export type MassEditMappingChange = {
    before: string | null;
    after: string | typeof DO_NOT_CHANGE;
    occurrenceCount: number;
};

export type SetAttributeMapping = (mapping: MassEditMappingChange) => void;

export type SetAttributeMappingWithDependency = (
    mapping: MassEditMappingChange & {dependencyFilter: RecordFilterInput},
) => void;

export type DependencyValue = {
    key: string;
    label: string;
    dependencyFilter: RecordFilterInput;
    filtersWithDependency: RecordFilterInput[];
    dependencyAttributeId?: string;
    dependencyAttributeNodeId?: string;
};
