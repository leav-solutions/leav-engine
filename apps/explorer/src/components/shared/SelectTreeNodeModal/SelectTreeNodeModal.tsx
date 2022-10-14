// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ISystemTranslation, ITreeNode, ITreeNodeWithRecord} from '../../../_types/types';
import SelectTreeNode from '../SelectTreeNode';

interface ISelectTreeNodeModalProps {
    tree: {id: string; label?: ISystemTranslation | null};
    selectedNodeKey?: string;
    visible: boolean;
    onSubmit: (treeNode: ITreeNode) => void;
    onClose: () => void;
}

export default function SelectTreeNodeModal({
    tree,
    selectedNodeKey,
    onSubmit,
    visible,
    onClose
}: ISelectTreeNodeModalProps): JSX.Element {
    const {t} = useTranslation();
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
            visible={visible}
            onCancel={handleCancel}
            title={t('tree-node-selection.title')}
            width="70rem"
            bodyStyle={{maxHeight: '80vh', overflowY: 'auto'}}
            centered
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    {t('global.cancel')}
                </Button>,
                <PrimaryBtn key="add" onClick={handleApply}>
                    {t('global.apply')}
                </PrimaryBtn>
            ]}
            destroyOnClose
        >
            <SelectTreeNode tree={tree} onSelect={onSelect} selectedNode={selectedNode.key} />
        </Modal>
    );
}
