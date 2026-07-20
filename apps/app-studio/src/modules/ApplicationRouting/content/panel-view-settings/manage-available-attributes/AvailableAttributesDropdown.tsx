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
    buildAttributeNodes,
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

/**
 * Which facet the gear curates. `columns` uses the flat tree; `sorts`/`filters` use the nested
 * (multi-level) tree. Drives which selection the gear reads and which reconcile action it dispatches.
 */
export type AvailableAttributesFacet = 'columns' | 'sorts' | 'filters';

const MANAGE_LABEL_KEY: Record<AvailableAttributesFacet, string> = {
    columns: 'view_settings.display.columns.manage_available',
    sorts: 'view_settings.sorts.manage_available',
    filters: 'view_settings.filters.manage_available',
};

/**
 * Views-manager gear: a checkable tree of the library's attributes letting a manager curate which
 * attributes are "available" in a facet (= membership in `view.display.attributes` for columns /
 * `view.sorts` for sorts / `view.filters` for filters). Rendered only when `canManageViews` is true
 * (caller's responsibility).
 *
 * The single `facet` prop drives everything: which selection is read, which reconcile action is
 * dispatched on check, the button label, AND the tree shape (`mode`, derived below):
 * - `columns` → flat tree (direct attributes only; a link/tree is a single checkable entry).
 * - `sorts` / `filters` → nested tree (link attributes are expandable branches, descent fetched lazily).
 */
export const AvailableAttributesDropdown = ({facet}: {facet: AvailableAttributesFacet}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {
        view,
        availableColumnIds,
        availableSortPaths,
        availableFilterPaths,
        setAvailableColumns,
        setAvailableSorts,
        setAvailableFilters,
    } = useCurrentView();
    const libraryId = view?.library;

    // Tree shape is a function of the facet: columns are flat, sorts/filters descend through links.
    // const mode: AvailableAttributesMode = facet === 'columns' ? 'flat' : 'nested';

    // TODO: The dropdown is currently flat because PO's are not ready for nested. When they are, use the above line and remove this hard-coded override.
    const mode: AvailableAttributesMode = 'flat';

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
        switch (facet) {
            case 'columns':
                view?.display.attributes.forEach(column =>
                    pathIndex.current.set(column.attribute.id, [column.attribute]),
                );
                break;
            case 'sorts':
                view?.sorts.forEach(sort => pathIndex.current.set(getNodeKey(sort.attributes), sort.attributes));
                break;
            case 'filters':
                view?.filters.forEach(filter =>
                    pathIndex.current.set(getNodeKey(filter.attributes), filter.attributes),
                );
                break;
        }
    }, [view, facet]);

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
        const nodes = buildAttributeNodes(attributes, [], mode, lang);
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
        const children = buildAttributeNodes(attributes, node.attributePath, mode, lang);
        children.forEach(child => pathIndex.current.set(child.key, child.attributePath));
        setTreeData(previous => attachChildren(previous, node.key, children));
    };

    const availablePaths = facet === 'filters' ? availableFilterPaths : availableSortPaths;
    const checkedKeys = facet === 'columns' ? availableColumnIds : availablePaths.map(path => path.join('/'));

    const handleCheck = (checked: Key[] | {checked: Key[]; halfChecked: Key[]}) => {
        const keys = Array.isArray(checked) ? checked : checked.checked;
        const paths = keys
            .map(key => pathIndex.current.get(String(key)))
            .filter((path): path is AvailableAttribute[] => Boolean(path));

        switch (facet) {
            case 'columns':
                // A column path is a single attribute (flat tree).
                setAvailableColumns(paths.map(path => path[path.length - 1]));
                break;
            case 'sorts':
                setAvailableSorts(paths.map(path => ({attributes: path})));
                break;
            case 'filters':
                setAvailableFilters(paths.map(path => ({attributes: path})));
                break;
        }
    };

    const buttonLabel = String(t(MANAGE_LABEL_KEY[facet]));

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
                                    // TODO: To uncomment when nested mode is re-enabled.
                                    // loadData={
                                    //     mode === 'nested'
                                    //         ? node => onLoadData(node as unknown as IAttributeTreeNode)
                                    //         : undefined
                                    // }
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
