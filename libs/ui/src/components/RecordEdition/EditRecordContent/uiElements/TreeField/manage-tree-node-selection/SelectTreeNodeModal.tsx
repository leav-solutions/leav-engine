// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faXmark} from '@fortawesome/free-solid-svg-icons';
import {KitButton, KitModal} from 'aristid-ds';
import {
    type DependentValuesPermissionFilterInput,
    type ChildrenAsRecordValuePermissionFilterInput,
    type RecordFormAttributeTreeAttributeFragment,
} from '_ui/_gqlTypes';
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
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
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
    dependentValuesPermissionFilter,
    className,
}) => {
    const {t} = useSharedTranslation();

    const [selectedNodes, setSelectedNodes] = useState<ITreeNodeWithRecord[]>([]);

    const _handleOnSelect: ComponentProps<typeof SelectTreeNode>['onSelect'] = (node, selected) => {
        if (!attribute.multiple_values) {
            onConfirm(selected ? [node] : []);
            onClose();
            return;
        }

        if (selected) {
            setSelectedNodes(prev => [...prev, node]);
        } else {
            setSelectedNodes(prev => prev.filter(selectedValue => selectedValue.id !== node.id));
        }
    };

    const _handleOnConfirm: ComponentProps<typeof KitButton>['onClick'] = () => {
        onConfirm(selectedNodes);
        onClose();
    };

    return (
        <KitModal
            appElement={document.getElementById('root')}
            className={className}
            showCloseIcon
            width={SELECT_TREE_NODE_MODAL_WIDTH}
            height={SELECT_TREE_NODE_MODAL_HEIGHT}
            title={title}
            isOpen={open}
            close={onClose}
            footer={
                <>
                    <KitButton icon={<FontAwesomeIcon icon={faXmark} />} onClick={onClose}>
                        {t('global.close')}
                    </KitButton>
                    {attribute.multiple_values && (
                        <KitButton
                            type="primary"
                            icon={<FontAwesomeIcon icon={faCheck} />}
                            disabled={selectedNodes.length === 0}
                            onClick={_handleOnConfirm}
                        >
                            {t('global.confirm')}
                        </KitButton>
                    )}
                </>
            }
        >
            <SelectTreeNode
                treeId={attribute.linked_tree.id}
                multiple // We want to be able to set as selected in the tree components, the nodes that are already selected and the disabled nodes
                selectedNodes={[
                    ...selectedNodes.map(node => node.id),
                    ...backendValues.map(value => value.treeValue.id),
                ]}
                childrenAsRecordValuePermissionFilter={childrenAsRecordValuePermissionFilter}
                dependentValuesPermissionFilter={dependentValuesPermissionFilter}
                disabledNodes={backendValues.map(value => value.treeValue.id).concat(attribute.linked_tree.id)}
                onSelect={_handleOnSelect}
            />
        </KitModal>
    );
};
