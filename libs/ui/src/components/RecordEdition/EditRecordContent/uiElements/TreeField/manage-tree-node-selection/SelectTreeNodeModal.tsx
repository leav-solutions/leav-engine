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
import _ from 'lodash';
import {FunctionComponent, useState} from 'react';
import {FaCheck} from 'react-icons/fa';

const SELECT_TREE_NODE_MODAL_HEIGHT = '563px';

const SELECT_TREE_NODE_MODAL_WIDTH = '656px';

type SelectTreeNodeModalBackendValue =
    | RecordFormElementsValueTreeValue
    | {
          treeValue: {
              id: string;
          };
      };

type SelectTreeNodeModalAttribute =
    | RecordFormAttributeTreeAttributeFragment
    | {
          multiple_values: boolean;
          linked_tree: {
              id: string;
          };
      };

interface ISelectTreeNodeModalProps {
    title: string;
    open: boolean;
    attribute: SelectTreeNodeModalAttribute;
    backendValues: SelectTreeNodeModalBackendValue[];
    /**
     * If tree, initial node (backendValues) will be unselectable
     * By default, they are not
     *
     * Would be much better to invert this property to disallowInitialNodeDeselection for instance
     * But need to review upper usage
     */
    allowInitialNodeDeselection?: boolean;
    onConfirm: (selectedNodes: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
    className?: string;
}

export const SelectTreeNodeModal: FunctionComponent<ISelectTreeNodeModalProps> = ({
    title,
    open,
    attribute,
    backendValues,
    allowInitialNodeDeselection = false,
    onConfirm,
    onClose,
    className
}) => {
    const {t} = useSharedTranslation();

    const [selectedNodes, setSelectedNode] = useState<ITreeNodeWithRecord[]>([]);
    // Use intermediate state to store backend node ids for initial props inject,
    // reset after first _handleOnSelect/_handleOnCheck to avoid adding backend values to selected nodes again and again
    // Another solution would be to inject backendValues with compatible ITreeNodeWithRecord type to set selectedNodes initial state
    const [tmpBackendNodeIds, setTmpBackendNodeIds] = useState<string[] | undefined>(backendValues.map(value => value.treeValue.id));

    const _handleOnSelect = (node: ITreeNodeWithRecord, selected: boolean) => {
        setTmpBackendNodeIds(undefined);
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
        setTmpBackendNodeIds(undefined);
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
                selectedNodes={tmpBackendNodeIds || selectedNodes.map(node => node.id)}
                disabledNodes={!allowInitialNodeDeselection && backendValues.map(value => value.treeValue.id) || []}
                onSelect={_handleOnSelect}
                onCheck={_handleOnCheck}
                checkable={attribute.multiple_values}
                multiple // We want to be able to set as selected in the tree components, the nodes that are already selected and the disabled nodes
                canSelectRoot
            />
        </KitModal>
    );
};
