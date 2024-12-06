// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ITreeNode, ITreeNodeWithRecord} from '../../types/trees';
import {SelectTreeNode} from '../SelectTreeNode';
import {KitButton, KitModal} from 'aristid-ds';

interface ISelectTreeNodeModalProps {
    treeId: string;
    selectedNodeKey?: string;
    isVisible: boolean;
    onSubmit: (treeNode: ITreeNode) => void;
    onClose: () => void;
    canSelectRoot?: boolean;
}

export const SelectTreeNodeModal: FunctionComponent<ISelectTreeNodeModalProps> = ({
    treeId,
    selectedNodeKey,
    onSubmit,
    isVisible,
    onClose,
    canSelectRoot = false
}) => {
    const {t} = useSharedTranslation();
    const [selectedNode, setSelectedNode] = useState<ITreeNode>({
        id: selectedNodeKey,
        key: selectedNodeKey,
        title: '',
        children: []
    });

    const _handleCancel = () => {
        onClose();
    };

    const _handleApply = () => {
        onSubmit(selectedNode);
        onClose();
    };

    const _onSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        setSelectedNode(!selected ? undefined : node);
    };

    return (
        <KitModal
            isOpen={isVisible}
            showCloseIcon
            onClose={_handleCancel}
            close={_handleCancel}
            onCancel={_handleCancel}
            title={t('tree-node-selection.title')}
            width="70rem"
            styles={{body: {maxHeight: '80vh', overflowY: 'auto'}}}
            centered
            footer={[
                <KitButton key="cancel" onClick={_handleCancel}>
                    {t('global.cancel')}
                </KitButton>,
                <KitButton type="primary" key="add" onClick={_handleApply}>
                    {t('global.apply')}
                </KitButton>
            ]}
            destroyOnClose
        >
            <SelectTreeNode
                treeId={treeId}
                onSelect={_onSelect}
                selectedNode={selectedNode?.key}
                canSelectRoot={canSelectRoot}
            />
        </KitModal>
    );
};
