import {type ChangeEvent, type Key, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {KitBadge, KitButton, KitDropDown, KitInput, KitLoader, KitTooltip, KitTree, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGear, faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {useLang} from '@leav/ui';
import {
    useGetViewSettingsLibraryAttributesLazyQuery,
    useGetViewSettingsLibraryAttributesQuery,
} from '../../../../../__generated__';
import {type AvailableAttribute} from '../store-current-view/_types';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {sanitize} from '../tabs/tab-display/_constants';
import {
    attachChildren,
    type AvailableAttributesMode,
    buildAttributeNode,
    collectBranchKeys,
    countCheckedDescendants,
    filterAttributeNodes,
    getNodeKey,
    type IAttributeTreeNode,
} from './attributeTreeNodes';
import {
    dropdownOverlay,
    dropdownContent,
    header,
    subtitle,
    content,
    search as searchClass,
    list,
    nodeTitle,
    nodeLabel,
    nodeBadge,
} from './availableAttributesDropdown.module.css';

const MANAGE_LABEL_KEY: Record<AvailableAttributesMode, string> = {
    flat: 'view_settings.display.columns.manage_available',
    nested: 'view_settings.sorts.manage_available',
};

/**
 * Admin-only gear: a checkable tree of the library's attributes letting the admin curate which
 * attributes are "available" in a facet (= membership in `view.display.attributes` for columns /
 * `view.sorts` for sorts). Rendered only when `canEditAdminView` is true (caller's responsibility).
 *
 * - `mode="flat"`: flat tree, direct attributes only (a link/tree is a single checkable entry).
 * - `mode="nested"`: link attributes are expandable branches; descent is lazily fetched per expansion.
 */
export const AvailableAttributesDropdown = ({mode}: {mode: AvailableAttributesMode}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, availableColumnIds, availableSortPaths, setAvailableColumns, setAvailableSorts} = useCurrentView();
    const libraryId = view?.library;

    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [treeData, setTreeData] = useState<IAttributeTreeNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

    // Maps every known node key → its descent path (with labels), so a checked key can always be
    // resolved back to a full selection — even paths whose tree nodes aren't currently rendered.
    const pathIndex = useRef<Map<string, AvailableAttribute[]>>(new Map());

    const {data, loading} = useGetViewSettingsLibraryAttributesQuery({
        variables: {libraryId: libraryId ?? ''},
        skip: !open || !libraryId,
    });

    const [fetchAttributes] = useGetViewSettingsLibraryAttributesLazyQuery({fetchPolicy: 'cache-first'});

    // Seed the lookup from the current selection (labels come from the view itself).
    useEffect(() => {
        if (mode === 'flat') {
            view?.display.attributes.forEach(column => pathIndex.current.set(column.attribute.id, [column.attribute]));
        } else {
            view?.sorts.forEach(sort => pathIndex.current.set(getNodeKey(sort.attributes), sort.attributes));
        }
    }, [view, mode]);

    // The library whose top level is already in `treeData`. Closing the dropdown skips the query, so
    // `data` goes undefined; reopening must NOT rebuild the top level from scratch, otherwise every
    // lazily-loaded descendant is dropped while the tree still believes those branches are loaded —
    // expanding them then never re-fires `loadData` and they render empty.
    const seededLibraryRef = useRef<string | null>(null);

    // Seed the top level once per library, preserving lazily-loaded descendants across close/reopen.
    useEffect(() => {
        const attributes = data?.libraries?.list?.[0]?.attributes;
        if (!attributes || seededLibraryRef.current === libraryId) {
            return;
        }
        const nodes = attributes.map(attribute => buildAttributeNode(attribute, [], mode, lang));
        nodes.forEach(node => pathIndex.current.set(node.key, node.attributePath));
        seededLibraryRef.current = libraryId ?? null;
        setExpandedKeys([]);
        setTreeData(nodes);
    }, [data, libraryId, mode, lang]);

    const onLoadData = async (node: IAttributeTreeNode) => {
        if (node.children || !node.linkedLibraryId) {
            return;
        }
        const result = await fetchAttributes({variables: {libraryId: node.linkedLibraryId}});
        const attributes = result.data?.libraries?.list?.[0]?.attributes ?? [];
        const children = attributes.map(attribute => buildAttributeNode(attribute, node.attributePath, mode, lang));
        children.forEach(child => pathIndex.current.set(child.key, child.attributePath));
        setTreeData(previous => attachChildren(previous, node.key, children));
    };

    const checkedKeys = mode === 'flat' ? availableColumnIds : availableSortPaths.map(path => path.join('/'));

    const handleCheck = (checked: Key[] | {checked: Key[]; halfChecked: Key[]}) => {
        const keys = Array.isArray(checked) ? checked : checked.checked;
        const paths = keys
            .map(key => pathIndex.current.get(String(key)))
            .filter((path): path is AvailableAttribute[] => Boolean(path));

        if (mode === 'flat') {
            // A column path is a single attribute (flat tree).
            setAvailableColumns(paths.map(path => path[path.length - 1]));
        } else {
            setAvailableSorts(paths.map(path => ({attributes: path})));
        }
    };

    const buttonLabel = String(t(MANAGE_LABEL_KEY[mode]));

    // Client-side search over the loaded tree; matched branches are auto-expanded so nested hits show.
    const sanitizedSearch = sanitize(searchValue.trim());
    const displayedTreeData = sanitizedSearch
        ? filterAttributeNodes(treeData, title => sanitize(title).includes(sanitizedSearch))
        : treeData;
    const treeExpandedKeys = sanitizedSearch ? collectBranchKeys(displayedTreeData) : expandedKeys;

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value);

    // Badge each branch with how many of its sub-attributes are currently checked (all depths).
    const renderNodeTitle = (node: IAttributeTreeNode) => {
        const checkedDescendants = countCheckedDescendants(node.key, checkedKeys);
        return (
            <span className={nodeTitle}>
                <span className={nodeLabel}>{node.title}</span>
                {checkedDescendants > 0 && (
                    <KitBadge className={nodeBadge} count={checkedDescendants} color="primary" secondaryColorInvert />
                )}
            </span>
        );
    };

    return (
        <KitDropDown
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            overlayClassName={dropdownOverlay}
            dropdownRender={() => (
                <div className={dropdownContent}>
                    <div className={header}>
                        <KitTypography.Text weight="bold" size="fontSize5">
                            {t('view_settings.available_attributes.title')}
                        </KitTypography.Text>
                        <KitTypography.Text size="fontSize7" className={subtitle}>
                            {t('view_settings.available_attributes.subtitle')}
                        </KitTypography.Text>
                    </div>
                    <div className={content}>
                        <KitInput
                            className={searchClass}
                            placeholder={String(t('view_settings.available_attributes.search_placeholder'))}
                            value={searchValue}
                            onChange={handleSearchChange}
                            prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                            allowClear
                        />
                        <div className={list}>
                            {loading ? (
                                <KitLoader />
                            ) : (
                                <KitTree
                                    checkable
                                    checkStrictly
                                    selectable={false}
                                    treeData={displayedTreeData}
                                    checkedKeys={checkedKeys}
                                    expandedKeys={treeExpandedKeys}
                                    onExpand={setExpandedKeys}
                                    titleRender={node => renderNodeTitle(node as unknown as IAttributeTreeNode)}
                                    loadData={
                                        mode === 'nested'
                                            ? node => onLoadData(node as unknown as IAttributeTreeNode)
                                            : undefined
                                    }
                                    onCheck={handleCheck}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        >
            <KitTooltip title={buttonLabel}>
                <KitButton
                    type="secondary"
                    size="m"
                    active={open}
                    aria-label={buttonLabel}
                    icon={<FontAwesomeIcon icon={faGear} />}
                />
            </KitTooltip>
        </KitDropDown>
    );
};
