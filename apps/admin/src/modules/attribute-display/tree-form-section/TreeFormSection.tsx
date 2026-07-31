import {KitInputNumber, KitTreeSelect} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    type AttributeDetailsTreeAttributeFragment,
    TreeSelectableNodes,
    type TreeSelectionConfInput,
} from '../../../_gqlTypes';
import {useTreeSelectionNodes} from '../get-tree-selection-nodes/useTreeSelectionNodes';
import {useSaveTreeSelectionConf} from '../save-tree-selection-conf/useSaveTreeSelectionConf';
import {TreeSelectionSwitchField} from '../TreeSelectionSwitchField';
import {fullWidthField} from '../attributeDisplayTab.module.css';

/**
 * Must stay in sync with `TREE_SELECTION_DEFAULTS` in libs/ui, which resolves the same defaults at
 * render time. Core stores nothing when a field is absent, so these values describe the behaviour
 * an attribute without configuration already has.
 */
const TREE_SELECTION_CONF_DEFAULTS: Required<TreeSelectionConfInput> = {
    selectableNodes: TreeSelectableNodes.all_nodes,
    defaultExpanded: false,
    displayRootNode: null,
    maxDepth: null,
    showSelectChildrenButton: false,
    showSelectDescendantsButton: false,
};

const _toConfInput = (
    conf: AttributeDetailsTreeAttributeFragment['tree_selection_conf'],
): Required<TreeSelectionConfInput> => ({
    selectableNodes: conf?.selectableNodes ?? TREE_SELECTION_CONF_DEFAULTS.selectableNodes,
    defaultExpanded: conf?.defaultExpanded ?? TREE_SELECTION_CONF_DEFAULTS.defaultExpanded,
    displayRootNode: conf?.displayRootNode ?? TREE_SELECTION_CONF_DEFAULTS.displayRootNode,
    maxDepth: conf?.maxDepth ?? TREE_SELECTION_CONF_DEFAULTS.maxDepth,
    showSelectChildrenButton: conf?.showSelectChildrenButton ?? TREE_SELECTION_CONF_DEFAULTS.showSelectChildrenButton,
    showSelectDescendantsButton:
        conf?.showSelectDescendantsButton ?? TREE_SELECTION_CONF_DEFAULTS.showSelectDescendantsButton,
});

interface ITreeFormSectionProps {
    attribute: AttributeDetailsTreeAttributeFragment;
}

/**
 * How a node is picked in a form (selectable levels, default expanded state, root node, depth,
 * bulk-select buttons). Only makes sense for a tree attribute.
 */
export const TreeFormSection = ({attribute}: ITreeFormSectionProps) => {
    const {t} = useTranslation();
    const {saveTreeSelectionConf, loading: saving} = useSaveTreeSelectionConf(attribute.id);
    const {treeData, loading: treeLoading, error: treeError} = useTreeSelectionNodes(attribute.linked_tree?.id);

    const [conf, setConf] = useState(() => _toConfInput(attribute.tree_selection_conf));
    // Kept apart from `conf` so that typing a depth does not fire a mutation on every keystroke
    const [depthDraft, setDepthDraft] = useState(conf.maxDepth);

    const _handleChange = async (change: Partial<TreeSelectionConfInput>) => {
        const previousConf = conf;
        const newConf = {...conf, ...change};

        setConf(newConf);

        if (!(await saveTreeSelectionConf(newConf))) {
            setConf(previousConf);
            setDepthDraft(previousConf.maxDepth);
        }
    };

    const _handleDepthCommit = () => {
        const newDepth = depthDraft === null || Number.isNaN(depthDraft) ? null : Math.trunc(depthDraft);

        setDepthDraft(newDepth);

        if (newDepth !== conf.maxDepth) {
            _handleChange({maxDepth: newDepth});
        }
    };

    return (
        <>
            <TreeSelectionSwitchField
                label={t('attributes.display.selectable_nodes')}
                stateLabel={t(
                    conf.selectableNodes === TreeSelectableNodes.leaves_only
                        ? 'attributes.display.selectable_nodes_leaves_only'
                        : 'attributes.display.selectable_nodes_all_nodes',
                )}
                checked={conf.selectableNodes === TreeSelectableNodes.leaves_only}
                disabled={saving}
                onChange={checked =>
                    _handleChange({
                        selectableNodes: checked ? TreeSelectableNodes.leaves_only : TreeSelectableNodes.all_nodes,
                    })
                }
            />
            <TreeSelectionSwitchField
                label={t('attributes.display.default_expanded')}
                stateLabel={t(
                    conf.defaultExpanded
                        ? 'attributes.display.default_expanded_open'
                        : 'attributes.display.default_expanded_closed',
                )}
                checked={conf.defaultExpanded}
                disabled={saving}
                onChange={checked => _handleChange({defaultExpanded: checked})}
            />
            <KitTreeSelect
                className={fullWidthField}
                label={t('attributes.display.display_root_node')}
                helper={treeError ? treeError.message : t('attributes.display.display_root_node_helper')}
                status={treeError ? 'error' : undefined}
                placeholder={t('attributes.display.display_root_node_placeholder')}
                treeData={treeData}
                value={conf.displayRootNode ?? undefined}
                loading={treeLoading}
                disabled={saving || !!treeError}
                allowClear
                showSearch={{
                    treeNodeFilterProp: 'title',
                }}
                onChange={value => _handleChange({displayRootNode: value ?? null})}
            />
            <KitInputNumber
                label={t('attributes.display.max_depth')}
                helper={t('attributes.display.max_depth_helper')}
                placeholder={t('attributes.display.max_depth_placeholder')}
                min={1}
                step={1}
                precision={0}
                value={depthDraft}
                disabled={saving}
                onChange={value => setDepthDraft(value === null || value === '' ? null : Number(value))}
                onBlur={_handleDepthCommit}
                onPressEnter={_handleDepthCommit}
            />
            <TreeSelectionSwitchField
                label={t('attributes.display.show_select_children_button')}
                stateLabel={t(conf.showSelectChildrenButton ? 'admin.yes' : 'admin.no')}
                checked={conf.showSelectChildrenButton}
                disabled={saving}
                onChange={checked => _handleChange({showSelectChildrenButton: checked})}
            />
            <TreeSelectionSwitchField
                label={t('attributes.display.show_select_descendants_button')}
                stateLabel={t(conf.showSelectDescendantsButton ? 'admin.yes' : 'admin.no')}
                checked={conf.showSelectDescendantsButton}
                disabled={saving}
                onChange={checked => _handleChange({showSelectDescendantsButton: checked})}
            />
        </>
    );
};
