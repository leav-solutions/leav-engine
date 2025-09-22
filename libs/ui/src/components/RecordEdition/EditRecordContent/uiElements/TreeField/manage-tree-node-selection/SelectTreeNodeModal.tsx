// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useState} from 'react';
import {FaCheck} from 'react-icons/fa';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitModal} from 'aristid-ds';
import {type ChildrenAsRecordValuePermissionFilterInput, type RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {SelectTreeNode} from '_ui/components/SelectTreeNode';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ITreeNodeWithRecord} from '_ui/types';

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
    onConfirm: (selectedNodes: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    className?: string;
}

export const SelectTreeNodeModal: FunctionComponent<ISelectTreeNodeModalProps> = ({
    title,
    open,
    attribute,
    backendValues,
    onConfirm,
    onClose,
    childrenAsRecordValuePermissionFilter,
    className
}) => {
    const {t} = useSharedTranslation();

    const [selectedNodes, setSelectedNode] = useState<ITreeNodeWithRecord[]>([]);
    const [isMonoValueToReplace, setIsMonoValueToReplace] = useState(false);

    const _handleOnSelect: ComponentProps<typeof SelectTreeNode>['onSelect'] = (node, selected) => {
        if (!attribute.multiple_values) {
            setSelectedNode(selected ? [node] : []);
            setIsMonoValueToReplace(true);
            return;
        }

        if (selected) {
            setSelectedNode([...selectedNodes, node]);
        } else {
            setSelectedNode(selectedNodes.filter(selectedValue => selectedValue.id !== node.id));
        }
    };

    const _handleOnConfirm: ComponentProps<typeof KitButton>['onClick'] = () => {
        onConfirm(selectedNodes);
        onClose();
    };

    return (
        <KitModal
            className={className}
            showCloseIcon
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
        >
            <SelectTreeNode
                treeId={attribute.linked_tree.id}
                multiple // We want to be able to set as selected in the tree components, the nodes that are already selected and the disabled nodes
                selectedNodes={[
                    ...selectedNodes.map(node => node.id),
                    ...(isMonoValueToReplace ? [] : backendValues.map(value => value.treeValue.id))
                ]}
                childrenAsRecordValuePermissionFilter={childrenAsRecordValuePermissionFilter}
                disabledNodes={backendValues.map(value => value.treeValue.id).concat(attribute.linked_tree.id)}
                onSelect={_handleOnSelect}
            />
        </KitModal>
    );
};
