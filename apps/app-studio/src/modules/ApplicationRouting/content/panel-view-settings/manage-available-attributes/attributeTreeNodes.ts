import {type Key} from 'react';
import {type DataNode} from 'antd/es/tree';
import {localizedTranslation} from '@leav/utils';
import {type ViewSettingsLibraryAttributeFragment} from '../../../../../__generated__';
import {type AvailableAttribute} from '../store-current-view/_types';

export type AvailableAttributesMode = 'flat' | 'nested';

export interface IAttributeTreeNode extends DataNode {
    key: string;
    title: string;
    /** Full descent path to this attribute (length 1 for a direct attribute). */
    attributePath: AvailableAttribute[];
    /** Set on link branches so the descent children can be lazily fetched on expand. */
    linkedLibraryId?: string;
    children?: IAttributeTreeNode[];
}

const getLinkedLibraryId = (attribute: ViewSettingsLibraryAttributeFragment): string | undefined =>
    'linked_library' in attribute ? (attribute.linked_library?.id ?? undefined) : undefined;

/** Stable key of a node = its descent path ids joined by '/', matching `getSortId` in the store. */
export const getNodeKey = (attributePath: AvailableAttribute[]): string =>
    attributePath.map(attribute => attribute.id).join('/');

/**
 * Build a tree node for a library attribute.
 * - `flat` mode: every attribute is a checkable leaf (a link/tree just shows its own label).
 * - `nested` mode descends through link attributes: a link is an expandable, checkable branch (checking
 *   it sorts on the linked record identity); descending picks a sub-attribute (the path). Tree
 *   attributes are checkable leaves (identity sort) — descent into tree libraries needs a path segment
 *   (the linked library) that the view model can't store yet (LEAVC follow-up).
 */
export const buildAttributeNode = (
    attribute: ViewSettingsLibraryAttributeFragment,
    parentPath: AvailableAttribute[],
    mode: AvailableAttributesMode,
    lang: string[],
): IAttributeTreeNode => {
    const attributePath: AvailableAttribute[] = [...parentPath, {id: attribute.id, label: attribute.label}];
    const linkedLibraryId = getLinkedLibraryId(attribute);
    const isExpandable = mode === 'nested' && Boolean(linkedLibraryId);

    return {
        key: getNodeKey(attributePath),
        title: localizedTranslation(attribute.label ?? {}, lang) || attribute.id,
        attributePath,
        linkedLibraryId,
        isLeaf: !isExpandable,
        checkable: true,
    };
};

/** Immutably attach (lazily-loaded) children to the node matching `parentKey`. */
export const attachChildren = (
    nodes: IAttributeTreeNode[],
    parentKey: string,
    children: IAttributeTreeNode[],
): IAttributeTreeNode[] =>
    nodes.map(node => {
        if (node.key === parentKey) {
            return {...node, children};
        }
        if (node.children) {
            return {...node, children: attachChildren(node.children, parentKey, children)};
        }
        return node;
    });

/**
 * Keep nodes whose title contains `sanitizedNeedle` OR which have a matching descendant (so a link
 * branch stays visible when one of its loaded children matches). `matches` is injected so the caller
 * controls normalization. Returns the (immutably) pruned tree.
 */
export const filterAttributeNodes = (
    nodes: IAttributeTreeNode[],
    matches: (title: string) => boolean,
): IAttributeTreeNode[] =>
    nodes.reduce<IAttributeTreeNode[]>((kept, node) => {
        const filteredChildren = node.children ? filterAttributeNodes(node.children, matches) : undefined;
        if (matches(node.title) || (filteredChildren && filteredChildren.length > 0)) {
            kept.push(filteredChildren ? {...node, children: filteredChildren} : node);
        }
        return kept;
    }, []);

/** Keys of every node that has children — used to auto-expand a filtered tree so matches show. */
export const collectBranchKeys = (nodes: IAttributeTreeNode[]): string[] =>
    nodes.flatMap(node => (node.children?.length ? [node.key, ...collectBranchKeys(node.children)] : []));

/**
 * Number of checked keys sitting strictly below `nodeKey`. Keys are descent paths joined by '/'
 * (see {@link getNodeKey}), so a strict descendant is any checked key prefixed by `${nodeKey}/`.
 * Counts from the keys alone, so an unexpanded (not-yet-loaded) branch is still badged correctly.
 */
export const countCheckedDescendants = (nodeKey: string, checkedKeys: readonly Key[]): number =>
    checkedKeys.reduce<number>((total, key) => (String(key).startsWith(`${nodeKey}/`) ? total + 1 : total), 0);
