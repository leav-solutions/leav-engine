// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {SystemTranslation} from '../../types/scalars';
import {ITreeNode, ITreeNodeWithRecord} from '../../types/trees';
import {SelectTreeNode} from '../SelectTreeNode';

interface ISelectTreeNodeModalProps {
    tree: {id: string; label?: SystemTranslation | null};
    selectedNodeKey?: string;
    visible: boolean;
    onSubmit: (treeNode: ITreeNode) => void;
    onClose: () => void;
    canSelectRoot?: boolean;
}

export default function SelectTreeNodeModal({
    tree,
    selectedNodeKey,
    onSubmit,
    visible,
    onClose,
    canSelectRoot = false
}: ISelectTreeNodeModalProps): JSX.Element {
    const {t} = useSharedTranslation();
    const [selectedNode, setSelectedNode] = useState<ITreeNode>({
        id: selectedNodeKey,
        key: selectedNodeKey,
        title: '',
        children: []
    });

    const handleCancel = () => {
        onClose();
    };

    const handleApply = () => {
        onSubmit(selectedNode);
        onClose();
    };

    const onSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        setSelectedNode(!selected ? undefined : node);
    };

    return (
        <Modal
            open={visible}
            onCancel={handleCancel}
            title={t('tree-node-selection.title')}
            width="70rem"
            styles={{body: {maxHeight: '80vh', overflowY: 'auto'}}}
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('global.cancel')}
                </Button>,
                <Button type="primary" key="add" onClick={handleApply}>
                    {t('global.apply')}
                </Button>
            ]}
            destroyOnClose
        >
            <SelectTreeNode
                tree={tree}
                onSelect={onSelect}
                selectedNode={selectedNode?.key}
                canSelectRoot={canSelectRoot}
            />
        </Modal>
    );
}
