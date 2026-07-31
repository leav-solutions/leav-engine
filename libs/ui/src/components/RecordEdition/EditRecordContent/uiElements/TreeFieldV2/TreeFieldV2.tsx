import {type ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {AntForm, AntTreeSelect, KitLoader, KitTreeSelect} from 'aristid-ds';
import {type FunctionComponent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type DependentValuesPermissionFilterInput,
    type RecordFormAttributeTreeAttributeFragment,
    RecordPermissionsActions,
} from '_ui/_gqlTypes';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {TreeNodeTitleV2} from '_ui/components/SelectTreeNodeV2';
import {TREE_FIELD_ID_PREFIX} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ITreeSelectionNode, resolveTreeSelectionConf, useTreeSelectionNodes} from '_ui/hooks/useTreeSelection';
import {type IFormElementProps} from '../../_types';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../shared/ComputeIndicator';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import {fieldWrapper, inputExtraAlignLeft} from './TreeFieldV2.module.css';
import {useTreeFieldValues} from './useTreeFieldValues';

/**
 * `AntForm.Item` clones its child with a `value` / `onChange` pair. The select is entirely controlled
 * by `useTreeFieldValues` (the antd form only mirrors the saved ids), so the injected props are
 * swallowed here instead of reaching the DOM.
 */
const FormItemChildDiv: FunctionComponent<{id: string; children: ReactNode}> = ({id, children}) => (
    <div id={id}>{children}</div>
);

/** Keys handled by antd `TreeSelect`, which does not accept the `bigint` of the React `Key`. */
type TreeSelectKey = string | number;

interface ITreeSelectNodeData {
    value: string;
    key: string;
    title: ReactNode;
    label: string;
    selectable: boolean;
    checkable: boolean;
    disabled: boolean;
    disableCheckbox: boolean;
    children?: ITreeSelectNodeData[];
}

/** Titles built by `useTreeSelectionNodes` are always strings; the node type allows a `ReactNode`. */
const _toLabel = (title: ITreeSelectionNode['title'], nodeId: string): string =>
    typeof title === 'string' ? title : nodeId;

const _toTreeSelectData = (
    nodes: ITreeSelectionNode[],
    renderTitle?: (node: ITreeSelectionNode) => ReactNode,
): ITreeSelectNodeData[] =>
    nodes.map(node => ({
        value: node.id,
        key: node.id,
        title: renderTitle ? renderTitle(node) : node.title,
        label: _toLabel(node.title, node.id),
        selectable: node.selectable,
        checkable: node.checkable,
        disabled: node.disabled,
        disableCheckbox: node.disabled || !node.checkable,
        children: node.children.length > 0 ? _toTreeSelectData(node.children, renderTitle) : undefined,
    }));

type TreeFieldV2Props = IFormElementProps<ICommonFieldsSettings>;

/**
 * V2 of `TreeField`, rendered instead of it when the `enableTreeAttributeV2Form` flag is on.
 *
 * The whole hierarchy is picked inside a `KitTreeSelect` dropdown instead of a modal, and the
 * selection rules come from the `tree_selection_conf` of the attribute. A single-level tree renders
 * as a plain list, with no dedicated code path (LEAVC-962).
 *
 * The tree itself is only fetched on the first opening of the dropdown: a form holding several tree
 * attributes would otherwise fire as many `TreeSelectionContent` queries on mount. The saved values are
 * displayed in the meantime, with the label the record form already carries.
 *
 * The `showSelectChildrenButton` / `showSelectDescendantsButton` group buttons are rendered by making
 * the title of a node a rich `ReactNode` (`TreeNodeTitleV2`, shared with the selection modal). By
 * default `TreeSelect` reuses that title to render a node once selected (`convert2LabelValues` in
 * `@rc-component/tree-select`), which would put the buttons inside the tags and inside the closed
 * field: `treeNodeLabelProp` points the selector at a separate plain-text `label` instead. The search
 * filters on that same `label`, since the title is no longer text.
 *
 * On a multivalued attribute, `showCheckedStrategy` is forced to `SHOW_ALL`: antd's default
 * `SHOW_CHILD` strategy hides the tag of a node once every one of its children is also checked,
 * even though that node is a saved value of its own in LEAV.
 */
const TreeFieldV2: FunctionComponent<TreeFieldV2Props> = ({
    element,
    readonly,
    isFormCreationMode,
    onDeleteMultipleValues,
    onValueSubmit,
    onValueDelete,
    metadataEdit = false,
}) => {
    const {state, dispatch} = useEditRecordReducer();
    const {lang} = useLang();
    const {t} = useSharedTranslation();
    const {
        settings,
        attribute,
        values,
    }: {
        settings: typeof element.settings;
        attribute?: RecordFormAttributeTreeAttributeFragment;
        values?: RecordFormElementsValueTreeValue[];
    } = element;

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueTreeValue[]>(values);
    const [expandedKeys, setExpandedKeys] = useState<TreeSelectKey[] | null>(null);
    const [searchValue, setSearchValue] = useState('');
    // Latched on purpose: the tree is loaded once, not on every opening of the dropdown
    const [hasOpenedDropdown, setHasOpenedDropdown] = useState(false);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const label = localizedTranslation(settings.label, lang);
    const form = AntForm.useFormInstance();

    // Used to force the input error display when a value is set
    AntForm.useWatch(attribute.id, form);

    // TODO: Temporary const that should be removed (and all it's usages) when we will have a proper way to override multiple values
    const tmpCantOverrideValues =
        attribute.multiple_values &&
        (calculatedFlags.calculatedValues?.length > 1 || inheritedFlags.inheritedValues?.length > 1);

    const isReadOnly = attribute.readonly || !attribute.permissions.edit_value || readonly || tmpCantOverrideValues;

    useEffect(() => {
        if (state.activeAttribute?.attribute.id === attribute.id) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues,
            });
        }
    }, [backendValues]);

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: TREE_FIELD_ID_PREFIX,
        dispatch,
        backendValues,
        allowedSelectors: ['.kit-select-dropdown-content', '.ant-select-dropdown'],
    });

    // The attribute of the field itself, not `state.activeAttribute`: opening the dropdown does not make
    // the attribute active on its own
    const childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput = {
        libraryId: state.libraryId,
        attributeId: attribute.id,
        action: RecordPermissionsActions.create_record,
    };

    // Without a record (creation before the draft), there is no value to depend on: the core treats
    // a missing filter as "no filtering" (`treeApp.ts`, `treeContent` resolver)
    const dependentValuesPermissionFilter: DependentValuesPermissionFilterInput | undefined = state.record?.id
        ? {
              libraryId: state.libraryId,
              attributeId: attribute.id,
              recordId: state.record.id,
          }
        : undefined;

    // No calling prop on a form field: the configuration of the attribute wins over the defaults
    const conf = resolveTreeSelectionConf(attribute.tree_selection_conf);

    const {rootNode, nodesById, getDescendants, loading, error} = useTreeSelectionNodes({
        treeId: attribute.linked_tree.id,
        conf,
        childrenAsRecordValuePermissionFilter,
        dependentValuesPermissionFilter,
        skip: !hasOpenedDropdown,
    });

    const {value, errors, handleChange} = useTreeFieldValues({
        attribute,
        nodesById,
        backendValues,
        setBackendValues,
        isFormCreationMode,
        onValueSubmit,
        onValueDelete,
        onDeleteMultipleValues,
    });

    const selectedNodeIds = (Array.isArray(value) ? value : value ? [value] : []).map(
        selectedValue => selectedValue.value,
    );

    // `handleChange` and the value array are rebuilt on every render: read through a ref so that they
    // never invalidate the memoized `treeData`, which the selection already invalidates by content
    const latestSelection = useRef({handleChange, selectedNodeIds});
    latestSelection.current = {handleChange, selectedNodeIds};

    // Group selection is a diff on the whole current selection, which `handleChange` then saves
    const _handleGroupSelect = useCallback((nodes: ITreeSelectionNode[], selected: boolean) => {
        const {handleChange: change, selectedNodeIds: currentIds} = latestSelection.current;
        const groupIds = nodes.map(node => node.id);

        change(
            selected
                ? [...new Set([...currentIds, ...groupIds])]
                : currentIds.filter(nodeId => !groupIds.includes(nodeId)),
        );
    }, []);

    // Group selection makes no sense on a mono-valued attribute, and nothing is selectable read-only
    const showGroupButtons =
        attribute.multiple_values && !isReadOnly && (conf.showSelectChildrenButton || conf.showSelectDescendantsButton);

    // Compared by content: the selection drives the state each rich title displays
    const selectedNodesKey = selectedNodeIds.join('|');

    // The pseudo root stands for the tree itself and carries no value: only real nodes are offered
    const treeData = useMemo(() => {
        if (!rootNode) {
            return [];
        }

        // Left as a plain string when there is no group button to render: zero visual change, and no
        // `ReactNode` title to work around
        const renderTitle = showGroupButtons
            ? (node: ITreeSelectionNode) => (
                  <TreeNodeTitleV2
                      node={node}
                      nodesById={nodesById}
                      getDescendants={getDescendants}
                      // antd already renders its own checkbox: no redundant check icon
                      checkable
                      selectedNodes={latestSelection.current.selectedNodeIds}
                      showSelectChildrenButton={conf.showSelectChildrenButton}
                      showSelectDescendantsButton={conf.showSelectDescendantsButton}
                      onGroupSelect={_handleGroupSelect}
                  />
              )
            : undefined;

        return _toTreeSelectData(rootNode.record === null ? rootNode.children : [rootNode], renderTitle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        rootNode,
        nodesById,
        getDescendants,
        showGroupButtons,
        conf.showSelectChildrenButton,
        conf.showSelectDescendantsButton,
        selectedNodesKey,
        _handleGroupSelect,
    ]);

    // Nodes are loaded asynchronously, long after the uncontrolled antd defaults have been captured:
    // the expanded keys have to be driven from here to honour `defaultExpanded`
    const autoExpandedKeys = useMemo<TreeSelectKey[]>(() => {
        if (conf.defaultExpanded) {
            return Object.keys(nodesById);
        }

        // Ancestors of the current values, so that they are visible without unfolding anything
        return [
            ...new Set(backendValues.flatMap(backendValue => nodesById[backendValue.treeValue?.id]?.parents ?? [])),
        ];
    }, [conf.defaultExpanded, nodesById, backendValues]);

    // Errors of the field itself first, then the ones set on the form by the record edition as a whole
    const formErrors = form.getFieldError(attribute.id);
    const errorMessage = errors[0] ?? (formErrors.length > 0 ? String(formErrors[0]) : error?.message);

    return (
        <div className={metadataEdit ? undefined : fieldWrapper}>
            <AntForm.Item name={attribute.id} noStyle>
                <FormItemChildDiv id={TREE_FIELD_ID_PREFIX + attribute.id}>
                    <KitTreeSelect
                        data-testid="tree-field-v2"
                        label={label}
                        required={attribute.required}
                        treeData={treeData}
                        value={value}
                        onChange={handleChange}
                        multiple={attribute.multiple_values}
                        // Without it antd checks the whole subtree, whereas selecting an intermediate
                        // node is a value of its own in LEAV
                        treeCheckStrictly={attribute.multiple_values}
                        // In LEAV every checked node is a value of its own, never a shortcut for its
                        // children: antd's default `SHOW_CHILD` strategy drops from the displayed tags
                        // any node whose children are all checked (`formatStrategyValues` in
                        // `@rc-component/tree-select`), while the value stays saved.
                        showCheckedStrategy={AntTreeSelect.SHOW_ALL}
                        // While searching, antd unfolds the matching nodes on its own
                        treeExpandedKeys={searchValue ? undefined : (expandedKeys ?? autoExpandedKeys)}
                        onTreeExpand={setExpandedKeys}
                        showSearch={{
                            onSearch: setSearchValue,
                            treeNodeFilterProp: 'label',
                        }}
                        treeNodeLabelProp="label"
                        readonly={isReadOnly}
                        allowClear={!attribute.required}
                        // The dropdown is normally opened before the tree has arrived: `loading` only
                        // turns the suffix icon into a spinner, the popup needs its own
                        loading={loading}
                        notFoundContent={loading ? <KitLoader /> : undefined}
                        onOpenChange={open => open && setHasOpenedDropdown(true)}
                        status={errorMessage ? 'error' : undefined}
                        helper={errorMessage}
                        placeholder={t('record_edition.placeholder.select_an_option')}
                        extra={
                            <div className={inputExtraAlignLeft}>
                                <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                            </div>
                        }
                    />
                </FormItemChildDiv>
            </AntForm.Item>
        </div>
    );
};

export default TreeFieldV2;
