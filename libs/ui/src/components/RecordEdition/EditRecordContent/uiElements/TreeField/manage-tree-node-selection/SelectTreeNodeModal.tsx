// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {SelectTreeNode} from '_ui/components/SelectTreeNode';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ITreeNodeWithRecord} from '_ui/types';
import {KitButton, KitModal} from 'aristid-ds';
import {FunctionComponent, useState} from 'react';
import {FaCheck} from 'react-icons/fa';

const SELECT_TREE_NODE_MODAL_HEIGHT = '563px';

const SELECT_TREE_NODE_MODAL_WIDTH = '656px';

interface ISelectTreeNodeModalProps {
    title: string;
    open: boolean;
    attribute: RecordFormAttributeTreeAttributeFragment;
    backendValues: RecordFormElementsValueTreeValue[];
    onConfirm: (selectedNodes: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
    className?: string;
}

export const SelectTreeNodeModal: FunctionComponent<ISelectTreeNodeModalProps> = ({
    title,
    open,
    attribute,
    backendValues,
    onConfirm,
    onClose,
    className
}) => {
    const {t} = useSharedTranslation();

    const [selectedNodes, setSelectedNode] = useState<ITreeNodeWithRecord[]>([]);

    const _handleOnSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        if (!attribute.multiple_values) {
            setSelectedNode(selected ? [node] : []);
            return;
        }

        if (selected) {
            setSelectedNode([...selectedNodes, node]);
        } else {
            setSelectedNode(selectedNodes.filter(selectedValue => selectedValue.id !== node.id));
        }
    };

    const _handleOnCheck = (selection: ITreeNodeWithRecord[]) => {
        setSelectedNode(selection.map(node => node).filter(node => !node?.disabled));
    };

    const _handleOnConfirm = () => {
        onConfirm(selectedNodes);
        onClose();
    };

    return (
        <KitModal
            className={className}
            width={SELECT_TREE_NODE_MODAL_WIDTH}
            height={SELECT_TREE_NODE_MODAL_HEIGHT}
            title={title}
            isOpen={open}
            close={onClose}
            footer={
                <>
                    <KitButton
                        icon={
                            // We can't used react-icons here because it's doesn't have the faXmark icon
                            <FontAwesomeIcon icon={faXmark} />
                        }
                        onClick={onClose}
                    >
                        {t('global.close')}
                    </KitButton>
                    <KitButton type="primary" icon={<FaCheck />} onClick={_handleOnConfirm}>
                        {t('global.confirm')}
                    </KitButton>
                </>
            }
            showCloseIcon
        >
            <SelectTreeNode
                treeId={attribute.linked_tree.id}
                selectedNodes={[
                    ...backendValues.map(value => value.treeValue.id),
                    ...selectedNodes.map(node => node.id)
                ]}
                disabledNodes={backendValues.map(value => value.treeValue.id)}
                onSelect={_handleOnSelect}
                onCheck={_handleOnCheck}
                checkable={attribute.multiple_values}
                multiple // We want to be able to set as selected in the tree components, the nodes that are already selected and the disabled nodes
                canSelectRoot
            />
        </KitModal>
    );
};
