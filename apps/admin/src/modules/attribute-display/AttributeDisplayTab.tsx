import {KitInputNumber, KitSelect, KitTreeSelect} from 'aristid-ds';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    type AttributeDetailsTreeAttributeFragment,
    MultiDisplayOption,
    TreeSelectableNodes,
    type TreeSelectionConfInput,
} from '../../_gqlTypes';
import {useRootNodeOptions} from './root-node-options/useRootNodeOptions';
import {useSaveTreeDisplayOption} from './save-display-option/useSaveTreeDisplayOption';
import {useSaveTreeSelectionConf} from './save-tree-selection-conf/useSaveTreeSelectionConf';
import {TreeSelectionSection} from './TreeSelectionSection';
import {TreeSelectionSwitchField} from './TreeSelectionSwitchField';
import {useTreeAttributeV2Flags} from './useTreeAttributeV2Flags';
import {fullWidthField, displayTab} from './attributeDisplayTab.module.css';

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

/**
 * Displayed value when the attribute has nothing stored: this is already what the rendering falls back
 * to (see the `default:` branch of the `ExplorerV2` table cell switch).
 */
const DEFAULT_MULTI_DISPLAY_OPTION = MultiDisplayOption.avatar;

interface IAttributeDisplayTabProps {
    attribute: AttributeDetailsTreeAttributeFragment;
}

/**
 * Display tab of a tree attribute, in two sections: how the values are rendered in the explorer, and
 * how a node is picked in a form. The Form section only makes sense behind the V2 flags, the Explorer
 * one applies whatever the flags are.
 */
export const AttributeDisplayTab = ({attribute}: IAttributeDisplayTabProps) => {
    const {t} = useTranslation();
    const {isFormV2Enabled, isModalV2Enabled} = useTreeAttributeV2Flags();
    const {saveTreeSelectionConf, loading: saving} = useSaveTreeSelectionConf(attribute.id);
    const {saveTreeDisplayOption, loading: savingDisplayOption} = useSaveTreeDisplayOption(attribute.id);
    const {treeData, loading: treeLoading, error: treeError} = useRootNodeOptions(attribute.linked_tree?.id);

    const [conf, setConf] = useState(() => _toConfInput(attribute.tree_selection_conf));
    // Kept apart from `conf` so that typing a depth does not fire a mutation on every keystroke
    const [depthDraft, setDepthDraft] = useState(conf.maxDepth);
    const [displayOption, setDisplayOption] = useState(
        attribute.multi_tree_display_option ?? DEFAULT_MULTI_DISPLAY_OPTION,
    );

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

    const _handleDisplayOptionChange = async (newDisplayOption: MultiDisplayOption) => {
        const previousDisplayOption = displayOption;

        setDisplayOption(newDisplayOption);

        if (!(await saveTreeDisplayOption(newDisplayOption))) {
            setDisplayOption(previousDisplayOption);
        }
    };

    return (
        <div className={displayTab}>
            {attribute.multiple_values && (
                <TreeSelectionSection title={t('attributes.tree_selection.section_explorer')}>
                    <KitSelect
                        className={fullWidthField}
                        label={t('attributes.multi_tree_display_option')}
                        value={displayOption}
                        disabled={savingDisplayOption}
                        options={Object.values(MultiDisplayOption).map(option => ({
                            value: option,
                            label: t(`attributes.multi_display_options.${option}`),
                        }))}
                        onChange={_handleDisplayOptionChange}
                    />
                </TreeSelectionSection>
            )}
            {(isFormV2Enabled || isModalV2Enabled) && (
                <TreeSelectionSection title={t('attributes.tree_selection.section_form')}>
                    <TreeSelectionSwitchField
                        label={t('attributes.tree_selection.selectable_nodes')}
                        stateLabel={t(
                            conf.selectableNodes === TreeSelectableNodes.leaves_only
                                ? 'attributes.tree_selection.selectable_nodes_leaves_only'
                                : 'attributes.tree_selection.selectable_nodes_all_nodes',
                        )}
                        checked={conf.selectableNodes === TreeSelectableNodes.leaves_only}
                        disabled={saving}
                        onChange={checked =>
                            _handleChange({
                                selectableNodes: checked
                                    ? TreeSelectableNodes.leaves_only
                                    : TreeSelectableNodes.all_nodes,
                            })
                        }
                    />
                    <TreeSelectionSwitchField
                        label={t('attributes.tree_selection.default_expanded')}
                        stateLabel={t(
                            conf.defaultExpanded
                                ? 'attributes.tree_selection.default_expanded_open'
                                : 'attributes.tree_selection.default_expanded_closed',
                        )}
                        checked={conf.defaultExpanded}
                        disabled={saving}
                        onChange={checked => _handleChange({defaultExpanded: checked})}
                    />
                    <KitTreeSelect
                        className={fullWidthField}
                        label={t('attributes.tree_selection.display_root_node')}
                        helper={treeError ? treeError.message : t('attributes.tree_selection.display_root_node_helper')}
                        status={treeError ? 'error' : undefined}
                        placeholder={t('attributes.tree_selection.display_root_node_placeholder')}
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
                        label={t('attributes.tree_selection.max_depth')}
                        helper={t('attributes.tree_selection.max_depth_helper')}
                        placeholder={t('attributes.tree_selection.max_depth_placeholder')}
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
                        label={t('attributes.tree_selection.show_select_children_button')}
                        stateLabel={t(conf.showSelectChildrenButton ? 'admin.yes' : 'admin.no')}
                        checked={conf.showSelectChildrenButton}
                        disabled={saving}
                        onChange={checked => _handleChange({showSelectChildrenButton: checked})}
                    />
                    <TreeSelectionSwitchField
                        label={t('attributes.tree_selection.show_select_descendants_button')}
                        stateLabel={t(conf.showSelectDescendantsButton ? 'admin.yes' : 'admin.no')}
                        checked={conf.showSelectDescendantsButton}
                        disabled={saving}
                        onChange={checked => _handleChange({showSelectDescendantsButton: checked})}
                    />
                </TreeSelectionSection>
            )}
        </div>
    );
};
