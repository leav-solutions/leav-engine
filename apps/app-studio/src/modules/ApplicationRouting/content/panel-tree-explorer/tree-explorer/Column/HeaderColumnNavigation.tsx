import {CloseSquareOutlined} from '@ant-design/icons';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Checkbox, Tooltip, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import {type ITreeExplorerNode, type ITreeExplorerSelectedNode} from '../_types';
import {useTreeExplorerState} from '../store/useTreeExplorerState';
import {HeaderColumnNavigationActions} from './actions/HeaderColumnNavigationActions';
import {clearSelectionButton, columnLabel, headerColumn, selectAllCheckbox} from './headerColumnNavigation.module.css';

export const HeaderColumnNavigation = ({
    depth,
    isDetail,
    isActive,
    treeElement,
    columnNodes,
}: {
    depth: number;
    isDetail?: boolean;
    isActive?: boolean;
    treeElement?: ITreeExplorerNode;
    columnNodes?: ITreeExplorerNode[];
}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {activeTree, path, selection, setPath, setSelection, resetSelection} = useTreeExplorerState();

    const currentPositionInPath = depth;
    const selectionCount = selection.selected.length;

    const goToPath = () => setPath(path.slice(0, currentPositionInPath));

    const headerClickFn = () => {
        if (!isActive) {
            goToPath();
        }
    };

    // The record label is already localized server-side (a plain string), but the tree label is a raw
    // `{[lang]: string}` object — it must be localized before rendering, or <Paragraph> crashes trying
    // to render an object as a React child.
    const label = treeElement?.record
        ? treeElement.record.whoAmI.label || treeElement.record.id
        : (activeTree ? localizedTranslation(activeTree.label, lang) : '') || activeTree?.id;

    const _handleClickCheckbox = () => {
        // Select every accessible node of the current column.
        const columnSelection: ITreeExplorerSelectedNode[] = (columnNodes ?? [])
            .filter(child => child.permissions.access_tree)
            .map(child => ({
                id: child.record.whoAmI.id,
                nodeId: child.id,
                library: child.record.whoAmI.library.id,
                label: child.record.whoAmI.label ?? '',
            }));

        setSelection(columnSelection, treeElement?.id ?? null);
    };

    return (
        <header className={headerColumn} onClick={headerClickFn}>
            {!!selectionCount && isActive ? (
                <Tooltip title={t('tree_explorer.header.nb_selection', {nb: selectionCount})} placement="right">
                    {t('tree_explorer.header.selection_label', {count: selectionCount})}
                    <Button
                        icon={<CloseSquareOutlined />}
                        aria-label="clear-selection"
                        onClick={resetSelection}
                        className={clearSelectionButton}
                        ghost
                    />
                </Tooltip>
            ) : (
                <>
                    {isActive && !!treeElement?.childrenCount && (
                        <Checkbox className={selectAllCheckbox} onClick={_handleClickCheckbox} />
                    )}
                    <Typography.Paragraph ellipsis={{tooltip: label, rows: 1}} className={columnLabel}>
                        {label}
                    </Typography.Paragraph>
                </>
            )}
            {isActive && <HeaderColumnNavigationActions depth={depth} isDetail={isDetail} />}
        </header>
    );
};
