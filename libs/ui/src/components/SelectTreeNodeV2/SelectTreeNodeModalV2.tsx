import {faCheck, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitModal} from 'aristid-ds';
import {type ComponentProps, type FunctionComponent, useState} from 'react';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
    type RecordFormAttributeTreeAttributeFragment,
} from '_ui/_gqlTypes';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IResolvedTreeSelectionConf, resolveTreeSelectionConf} from '_ui/hooks/useTreeSelection';
import {type ITreeNodeWithRecord} from '_ui/types';
import {SelectTreeNodeV2} from './SelectTreeNodeV2';

const SELECT_TREE_NODE_MODAL_HEIGHT = '563px';
const SELECT_TREE_NODE_MODAL_WIDTH = '656px';

export type SelectTreeNodeModalV2BackendValue =
    | RecordFormElementsValueTreeValue
    | {
          treeValue: {
              id: string;
          };
      };

/**
 * Same widened type as the V1 modal, plus `tree_selection_conf`: callers outside of the record form
 * may pass a minimal object instead of a complete GraphQL fragment.
 */
export type SelectTreeNodeModalV2Attribute =
    | RecordFormAttributeTreeAttributeFragment
    | {
          multiple_values: boolean;
          linked_tree: {
              id: string;
          };
          tree_selection_conf?: Partial<IResolvedTreeSelectionConf> | null;
      };

export interface ISelectTreeNodeModalV2Props extends Partial<IResolvedTreeSelectionConf> {
    title: string;
    open: boolean;
    attribute: SelectTreeNodeModalV2Attribute;
    backendValues: SelectTreeNodeModalV2BackendValue[];
    onConfirm: (selectedNodes: ITreeNodeWithRecord[]) => void;
    onClose: () => void;
    childrenAsRecordValuePermissionFilter?: ChildrenAsRecordValuePermissionFilterInput;
    dependentValuesPermissionFilter?: DependentValuesPermissionFilterInput;
    className?: string;
}

export const SelectTreeNodeModalV2: FunctionComponent<ISelectTreeNodeModalV2Props> = ({
    title,
    open,
    attribute,
    backendValues,
    onConfirm,
    onClose,
    childrenAsRecordValuePermissionFilter,
    dependentValuesPermissionFilter,
    className,
    selectableNodes,
    defaultExpanded,
    displayRootNode,
    maxDepth,
    showSelectChildrenButton,
    showSelectDescendantsButton,
}) => {
    const {t} = useSharedTranslation();

    const [selectedNodes, setSelectedNodes] = useState<ITreeNodeWithRecord[]>([]);

    // Calling props win over the attribute configuration, which wins over the system defaults
    const conf = resolveTreeSelectionConf(attribute.tree_selection_conf, {
        selectableNodes,
        defaultExpanded,
        displayRootNode,
        maxDepth,
        showSelectChildrenButton,
        showSelectDescendantsButton,
    });

    const _handleOnSelect: ComponentProps<typeof SelectTreeNodeV2>['onSelect'] = (node, selected) => {
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
            <SelectTreeNodeV2
                treeId={attribute.linked_tree.id}
                multiple={attribute.multiple_values}
                selectedNodes={[
                    ...selectedNodes.map(node => node.id),
                    ...backendValues.map(value => value.treeValue.id),
                ]}
                // Values already linked to the record cannot be picked again
                disabledNodes={backendValues.map(value => value.treeValue.id)}
                childrenAsRecordValuePermissionFilter={childrenAsRecordValuePermissionFilter}
                dependentValuesPermissionFilter={dependentValuesPermissionFilter}
                onSelect={_handleOnSelect}
                {...conf}
            />
        </KitModal>
    );
};
