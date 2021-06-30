// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal, Tree, Input} from 'antd';
import {useQuery} from '@apollo/client';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getTreeContentQuery, IRecordAndChildren} from '../../../graphQL/queries/trees/getTreeContentQuery';
import {ITree} from '../../../_types/types';
import {localizedLabel} from '../../../utils';
import {useLang} from '../../../hooks/LangHook/LangHook';

interface ISelectTreeNodeModalProps {
    tree: Pick<ITree, 'id' | 'label'>;
    selectedNodeKey?: string;
    visible: boolean;
    onSubmit: (treeNode: ITreeNode) => void;
    onClose: () => void;
}

export interface ITreeNode {
    title: string;
    key: string | null;
    children: ITreeNode[];
}

const _constructTreeContent = (data: IRecordAndChildren[]): ITreeNode[] => {
    return data.map(e => ({
        title: e.record.whoAmI.label || e.record.whoAmI.id,
        key: e.record.whoAmI.library.id + '/' + e.record.whoAmI.id,
        children: !!e.children ? _constructTreeContent(e.children) : []
    }));
};

const _getTreeNodeByKey = (key: string, treeContent: ITreeNode[]): ITreeNode => {
    for (const node of treeContent) {
        if (key === node.key) {
            return node;
        }

        const n = _getTreeNodeByKey(key, node.children);

        if (!!n) {
            return n;
        }
    }
};

export default function SelectTreeNodeModal({
    tree,
    selectedNodeKey,
    onSubmit,
    visible,
    onClose
}: ISelectTreeNodeModalProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();

    const rootNode: ITreeNode = {
        title: localizedLabel(tree.label, lang) || tree.id,
        key: tree.id,
        children: []
    };
    const [selectedNode, setSelectedNode] = useState<string>();
    const [treeContent, setTreeContent] = useState<ITreeNode[]>([]);

    // Retrieve tree content
    useQuery(getTreeContentQuery(100), {
        variables: {
            treeId: tree.id
        },
        onCompleted: data => {
            const formattedData = [{...rootNode, children: _constructTreeContent(data.treeContent)}];

            setTreeContent(formattedData);
            setSelectedNode(selectedNodeKey);
        }
    });

    const handleCancel = () => {
        onClose();
    };

    const handleApply = () => {
        if (typeof selectedNode === 'undefined') {
            onSubmit(selectedNode);
        } else {
            const node = _getTreeNodeByKey(selectedNode, treeContent);
            onSubmit(node);
        }

        onClose();
    };

    const onSelect = (_, e: {selected: boolean; node: any}) => {
        setSelectedNode(!e.selected ? undefined : e.node.key);
    };

    return (
        <Modal
            visible={visible}
            onCancel={handleCancel}
            title={t('tree-node-selection.title')}
            width="70rem"
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
            {treeContent.length && (
                <Tree
                    defaultExpandedKeys={[selectedNode]}
                    multiple={false}
                    selectable={true}
                    selectedKeys={[selectedNode]}
                    onSelect={onSelect}
                    treeData={treeContent}
                />
            )}
        </Modal>
    );
}
