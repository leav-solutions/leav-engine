// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {FunctionComponent} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useTreeDataQueryQuery} from '_ui/_gqlTypes';
import {ErrorDisplay} from '../..';
import useLang from '../../hooks/useLang';
import {ITreeNodeWithRecord} from '../../types/trees';
import {SelectTreeNodeContent} from './SelectTreeNodeContent';
import {Skeleton} from 'antd';

interface ISelectTreeNodeProps {
    treeId: string;
    selectedNode?: string;
    onSelect: (node: ITreeNodeWithRecord, selected: boolean) => void;
    onCheck?: (selection: ITreeNodeWithRecord[]) => void;
    multiple?: boolean;
    canSelectRoot?: boolean;
    selectableLibraries?: string[]; // all by default
}

export const SelectTreeNode: FunctionComponent<ISelectTreeNodeProps> = ({
    treeId,
    onSelect,
    onCheck,
    selectedNode,
    multiple = false,
    canSelectRoot = false,
    selectableLibraries
}) => {
    const {lang} = useLang();
    const {t} = useSharedTranslation();
    const {loading, error, data} = useTreeDataQueryQuery({
        variables: {treeId}
    });

    if (loading) {
        return <Skeleton.Input />; //TODO: use DS when export of KitSkeleton is fixed
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data?.trees.list[0]) {
        return <ErrorDisplay message={t('error.unknown_tree', {treeId})} />;
    }

    const label = localizedTranslation(data.trees.list[0].label, lang) || treeId;

    return (
        <SelectTreeNodeContent
            treeData={{id: treeId, label}}
            onCheck={onCheck}
            onSelect={onSelect}
            multiple={multiple}
            selectedNode={selectedNode}
            canSelectRoot={canSelectRoot}
            selectableLibraries={selectableLibraries}
        />
    );
};
