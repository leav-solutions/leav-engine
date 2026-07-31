import {type IResolvedTreeSelectionConf} from './_types';

/**
 * Behaviour of a tree attribute without any configuration: this is what keeps the V2 components
 * backward compatible. Must stay in sync with `TREE_SELECTION_CONF_DEFAULTS` in apps/admin.
 */
export const TREE_SELECTION_DEFAULTS: IResolvedTreeSelectionConf = {
    selectableNodes: 'all_nodes',
    defaultExpanded: false,
    displayRootNode: null,
    maxDepth: null,
    showSelectChildrenButton: false,
    showSelectDescendantsButton: false,
};

/**
 * Single source of truth of the priority rule: calling prop > attribute configuration > system
 * default.
 *
 * Merged key by key with `??` and never with `||`, otherwise `defaultExpanded: false` or
 * `maxDepth: 0` would fall back on the default.
 *
 * Known limitation of `??`: an override explicitly set to `null` on `displayRootNode` or `maxDepth`
 * does not neutralise the attribute configuration, it falls back on it. No caller needs to force
 * "no root node" today; supporting it would mean telling an absent override apart from an explicit
 * `null` (`'displayRootNode' in overrides`).
 */
export const resolveTreeSelectionConf = (
    attributeConf?: Partial<IResolvedTreeSelectionConf> | null,
    overrides?: Partial<IResolvedTreeSelectionConf>,
): IResolvedTreeSelectionConf => ({
    selectableNodes:
        overrides?.selectableNodes ?? attributeConf?.selectableNodes ?? TREE_SELECTION_DEFAULTS.selectableNodes,
    defaultExpanded:
        overrides?.defaultExpanded ?? attributeConf?.defaultExpanded ?? TREE_SELECTION_DEFAULTS.defaultExpanded,
    displayRootNode:
        overrides?.displayRootNode ?? attributeConf?.displayRootNode ?? TREE_SELECTION_DEFAULTS.displayRootNode,
    maxDepth: overrides?.maxDepth ?? attributeConf?.maxDepth ?? TREE_SELECTION_DEFAULTS.maxDepth,
    showSelectChildrenButton:
        overrides?.showSelectChildrenButton ??
        attributeConf?.showSelectChildrenButton ??
        TREE_SELECTION_DEFAULTS.showSelectChildrenButton,
    showSelectDescendantsButton:
        overrides?.showSelectDescendantsButton ??
        attributeConf?.showSelectDescendantsButton ??
        TREE_SELECTION_DEFAULTS.showSelectDescendantsButton,
});
