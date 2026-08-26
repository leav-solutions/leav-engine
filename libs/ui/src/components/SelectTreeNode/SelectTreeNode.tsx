import {localizedTranslation} from '@leav/utils';
import {type FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
    useTreeDataQueryQuery,
} from '_ui/_gqlTypes';
import {ErrorDisplay} from '../..';
import useLang from '../../hooks/useLang/useLang';
import {type ITreeNodeWithRecord} from '../../types/trees';
import {SelectTreeNodeContent} from './SelectTreeNodeContent';
import {SelectTreeNodeContentSkeleton} from './SelectTreeNodeContentSkeleton';

interface ISelectTreeNodeProps {
    treeId: string;
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    selectedNodes?: string[];
    disabledNodes?: string[];
    selectableLibraries?: string[]; // all by default
    multiple?: boolean;
    checkStrictly?: boolean;
    checkable?: boolean;
    canSelectRoot?: boolean;
    showSelectChildrenButton?: boolean;
    showNodeTypeIcon?: boolean;
    /**
     * Opt out of the Apollo cache for the tree content, so each mount reflects the server. To be
     * enabled by callers whose own flow adds or removes nodes — otherwise a remount silently
     * replays the content read before that change.
     */
    refreshOnMount?: boolean;
}

export const SelectTreeNode: FunctionComponent<ISelectTreeNodeProps> = ({
    treeId,
    childrenAsRecordValuePermissionFilter,
    dependentValuesPermissionFilter,
    onSelect,
    onCheck,
    selectedNodes,
    disabledNodes,
    selectableLibraries,
    multiple = false,
    checkStrictly = true,
    checkable = false,
    canSelectRoot = false,
    showSelectChildrenButton = false,
    showNodeTypeIcon,
    refreshOnMount = false,
}) => {
    const {lang} = useLang();
    const {t} = useSharedTranslation();
    const {loading, error, data} = useTreeDataQueryQuery({
        variables: {treeId},
    });

    if (loading) {
        return <SelectTreeNodeContentSkeleton />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data?.trees.list[0]) {
        return <ErrorDisplay message={t('error.unknown_tree', {treeId})} />;
    }

    return (
        <SelectTreeNodeContent
            treeData={{id: treeId, label: localizedTranslation(data.trees.list[0].label, lang) || treeId}}
            childrenAsRecordValuePermissionFilter={childrenAsRecordValuePermissionFilter}
            dependentValuesPermissionFilter={dependentValuesPermissionFilter}
            onCheck={onCheck}
            onSelect={onSelect}
            multiple={multiple}
            checkable={checkable}
            checkStrictly={checkStrictly}
            selectedNodes={selectedNodes}
            disabledNodes={disabledNodes}
            canSelectRoot={canSelectRoot}
            selectableLibraries={selectableLibraries}
            showSelectChildrenButton={showSelectChildrenButton}
            showNodeTypeIcon={showNodeTypeIcon}
            refreshOnMount={refreshOnMount}
        />
    );
};
